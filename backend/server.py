from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
MIN_DONATION = 10001

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"email": payload.get("email")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class LeaderIn(BaseModel):
    name_hi: str
    name_en: str
    designation_hi: str
    designation_en: str
    profile_hi: str = ""
    profile_en: str = ""
    photo: str = ""
    special: bool = False
    active: bool = True


class DonationIn(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    city: str
    state: str
    amount: int
    leader_name: Optional[str] = None


class DonationStatusIn(BaseModel):
    status: str


class NewsIn(BaseModel):
    title_hi: str
    title_en: str
    desc_hi: str = ""
    desc_en: str = ""
    category_hi: str = "समाचार"
    category_en: str = "News"
    date: str = ""
    image: str = ""
    featured: bool = False


class EventIn(BaseModel):
    title_hi: str
    title_en: str
    date: str
    time: str
    location_hi: str
    location_en: str
    category_hi: str = "कार्यक्रम"
    category_en: str = "Event"
    image: str = ""


class MediaIn(BaseModel):
    type: str  # live | video | photo
    title_hi: str
    title_en: str
    url: str
    thumbnail: str = ""


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    message: str


# ---------- Auth ----------
@api_router.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password / गलत ईमेल या पासवर्ड")
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}


@api_router.get("/auth/me")
async def me(admin=Depends(get_admin)):
    return admin


# ---------- Leaders ----------
@api_router.get("/leaders")
async def list_leaders(special: Optional[bool] = None):
    query = {"active": True}
    if special is not None:
        query["special"] = special
    leaders = await db.leaders.find(query, {"_id": 0}).to_list(200)
    leaders.sort(key=lambda l: (not l.get("special", False), l.get("name_en", "")))
    return leaders


@api_router.get("/admin/leaders")
async def admin_list_leaders(admin=Depends(get_admin)):
    return await db.leaders.find({}, {"_id": 0}).to_list(500)


@api_router.post("/admin/leaders")
async def create_leader(body: LeaderIn, admin=Depends(get_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.leaders.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/leaders/{leader_id}")
async def update_leader(leader_id: str, body: LeaderIn, admin=Depends(get_admin)):
    result = await db.leaders.update_one({"id": leader_id}, {"$set": body.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leader not found")
    doc = await db.leaders.find_one({"id": leader_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/leaders/{leader_id}")
async def delete_leader(leader_id: str, admin=Depends(get_admin)):
    result = await db.leaders.delete_one({"id": leader_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Leader not found")
    return {"deleted": True}


# ---------- Donations ----------
@api_router.post("/donations")
async def create_donation(body: DonationIn):
    if body.amount < MIN_DONATION:
        raise HTTPException(status_code=400, detail="Minimum donation is ₹10,001 / न्यूनतम दान राशि ₹10,001 है")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["receipt_no"] = "BJP-" + uuid.uuid4().hex[:8].upper()
    doc["status"] = "PENDING"  # UPI QR payment: admin verifies before marking VERIFIED
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.donations.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/donations/receipt/{receipt_no}")
async def get_receipt(receipt_no: str):
    doc = await db.donations.find_one({"receipt_no": receipt_no}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return doc


@api_router.get("/admin/donations")
async def admin_list_donations(admin=Depends(get_admin)):
    donations = await db.donations.find({}, {"_id": 0}).to_list(2000)
    donations.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return donations


@api_router.patch("/admin/donations/{donation_id}")
async def update_donation_status(donation_id: str, body: DonationStatusIn, admin=Depends(get_admin)):
    result = await db.donations.update_one({"id": donation_id}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Donation not found")
    return await db.donations.find_one({"id": donation_id}, {"_id": 0})


# ---------- News ----------
@api_router.get("/news")
async def list_news(skip: int = 0, limit: int = 7):
    total = await db.news.count_documents({})
    items = await db.news.find({}, {"_id": 0}).sort("date", -1).skip(skip).limit(limit).to_list(limit)
    return {"total": total, "items": items}


@api_router.post("/admin/news")
async def create_news(body: NewsIn, admin=Depends(get_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    if not doc["date"]:
        doc["date"] = datetime.now(timezone.utc).date().isoformat()
    await db.news.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/admin/news/{news_id}")
async def delete_news(news_id: str, admin=Depends(get_admin)):
    await db.news.delete_one({"id": news_id})
    return {"deleted": True}


# ---------- Events ----------
@api_router.get("/events")
async def list_events():
    return await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(100)


@api_router.post("/admin/events")
async def create_event(body: EventIn, admin=Depends(get_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    await db.events.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, admin=Depends(get_admin)):
    await db.events.delete_one({"id": event_id})
    return {"deleted": True}


# ---------- Media ----------
@api_router.get("/media")
async def list_media():
    return await db.media.find({}, {"_id": 0}).to_list(200)


@api_router.post("/admin/media")
async def create_media(body: MediaIn, admin=Depends(get_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    await db.media.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/admin/media/{media_id}")
async def delete_media(media_id: str, admin=Depends(get_admin)):
    await db.media.delete_one({"id": media_id})
    return {"deleted": True}


# ---------- Footprints / States ----------
@api_router.get("/states")
async def list_states():
    return await db.states.find({}, {"_id": 0}).to_list(100)


# ---------- Contact ----------
@api_router.post("/contact")
async def create_contact(body: ContactIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"received": True}


@api_router.get("/admin/contacts")
async def admin_list_contacts(admin=Depends(get_admin)):
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    contacts.sort(key=lambda c: c.get("created_at", ""), reverse=True)
    return contacts


@api_router.get("/")
async def root():
    return {"message": "Bharatiya Janta Party API"}


# ---------- Seed ----------
async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": email, "name": "Party Admin",
            "password_hash": hash_password(password), "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})
        logger.info("Admin password refreshed")


async def seed_content():
    if await db.leaders.count_documents({}) == 0:
        await db.leaders.insert_many([
            {"id": str(uuid.uuid4()), "name_hi": "श्री नरेन्द्र मोदी", "name_en": "Narendra Modi", "designation_hi": "प्रधानमंत्री, भारत सरकार", "designation_en": "Prime Minister of India", "profile_hi": "देश के यशस्वी प्रधानमंत्री। विकास, सुशासन और आत्मनिर्भर भारत के प्रणेता।", "profile_en": "Hon'ble Prime Minister of India. Champion of development, good governance and Atmanirbhar Bharat.", "photo": "/assets/modi.jpg", "special": True, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्री नीतिन नबीन", "name_en": "Nitin Nabin", "designation_hi": "राष्ट्रीय अध्यक्ष", "designation_en": "National President", "profile_hi": "पार्टी के राष्ट्रीय अध्यक्ष। संगठनात्मक विस्तार और युवा नेतृत्व के प्रति समर्पित।", "profile_en": "National President of the party. Dedicated to organisational expansion and young leadership.", "photo": "/assets/nitin-nabin.jpg", "special": True, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्रद्धेय अटल बिहारी वाजपेयी", "name_en": "Atal Bihari Vajpayee", "designation_hi": "पूर्व प्रधानमंत्री, भारत रत्न", "designation_en": "Former Prime Minister, Bharat Ratna", "profile_hi": "पार्टी के संस्थापक नेताओं में से एक। कवि-हृदय नेता, जिनके विचार आज भी हमारा मार्गदर्शन करते हैं।", "profile_en": "One of the founding leaders of the party. A statesman-poet whose ideals continue to guide us.", "photo": "/assets/vajpayee.jpg", "special": False, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्री राजेश प्रताप सिंह", "name_en": "Rajesh Pratap Singh", "designation_hi": "राष्ट्रीय उपाध्यक्ष", "designation_en": "National Vice President", "profile_hi": "25 वर्षों से जनसेवा में सक्रिय। संगठन विस्तार और युवा सशक्तिकरण के प्रति समर्पित।", "profile_en": "Serving the people for 25 years. Dedicated to organisational growth and youth empowerment.", "photo": "https://images.unsplash.com/photo-1584554376766-ac0f2c65e949?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "special": False, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्रीमती अनिता देशमुख", "name_en": "Anita Deshmukh", "designation_hi": "राष्ट्रीय महासचिव", "designation_en": "National General Secretary", "profile_hi": "महिला सशक्तिकरण और शिक्षा सुधार की प्रेरक वक्ता।", "profile_en": "Inspiring voice for women empowerment and education reform.", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "special": False, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्री विक्रम चौधरी", "name_en": "Vikram Chaudhary", "designation_hi": "प्रदेश अध्यक्ष, उत्तर प्रदेश", "designation_en": "State President, Uttar Pradesh", "profile_hi": "किसान कल्याण और ग्रामीण विकास के लिए कार्यरत।", "profile_en": "Working for farmer welfare and rural development.", "photo": "https://images.pexels.com/photos/38889922/pexels-photo-38889922.jpeg?auto=compress&cs=tinysrgb&w=600", "special": False, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "डॉ. मीरा कुलकर्णी", "name_en": "Dr. Meera Kulkarni", "designation_hi": "राष्ट्रीय प्रवक्ता", "designation_en": "National Spokesperson", "profile_hi": "नीति अनुसंधान और जनसंचार की विशेषज्ञ।", "profile_en": "Expert in policy research and public communication.", "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "special": False, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्री अरुण यादव", "name_en": "Arun Yadav", "designation_hi": "राष्ट्रीय कोषाध्यक्ष", "designation_en": "National Treasurer", "profile_hi": "पारदर्शी वित्तीय प्रबंधन के प्रति प्रतिबद्ध।", "profile_en": "Committed to transparent financial management.", "photo": "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "special": False, "active": True},
            {"id": str(uuid.uuid4()), "name_hi": "श्रीमती कविता रेड्डी", "name_en": "Kavita Reddy", "designation_hi": "अध्यक्ष, महिला मोर्चा", "designation_en": "President, Women's Wing", "profile_hi": "ग्रासरुट स्तर पर महिला नेतृत्व का निर्माण।", "profile_en": "Building grassroots women leadership.", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", "special": False, "active": True},
        ])
    if await db.news.count_documents({}) == 0:
        news = [
            ("राष्ट्रीय कार्यकारिणी बैठक सफलतापूर्वक संपन्न", "National Executive Meeting Concludes Successfully", "दो दिवसीय बैठक में संगठनात्मक विस्तार और आगामी कार्यक्रमों की रूपरेखा तैयार की गई।", "The two-day meeting finalised the roadmap for organisational expansion and upcoming programmes.", "राष्ट्रीय", "National", "2026-07-05", "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", True),
            ("युवा संवाद कार्यक्रम में 50,000 युवा शामिल", "50,000 Youth Join Yuva Samvad Programme", "दिल्ली में आयोजित कार्यक्रम में युवाओं ने राष्ट्र निर्माण में भागीदारी का संकल्प लिया।", "Youth pledged participation in nation building at the Delhi event.", "कार्यक्रम", "Programme", "2026-07-01", "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", False),
            ("किसान कल्याण योजना का विस्तार", "Expansion of Farmer Welfare Scheme", "पार्टी ने 12 राज्यों में किसान सहायता केंद्र खोलने की घोषणा की।", "The party announced farmer support centres across 12 states.", "नीति", "Policy", "2026-06-28", "https://images.pexels.com/photos/39013505/pexels-photo-39013505.jpeg?auto=compress&cs=tinysrgb&w=800", False),
            ("महिला शक्ति सम्मेलन का भव्य आयोजन", "Grand Mahila Shakti Convention Held", "देशभर से 10,000 महिला प्रतिनिधियों ने भाग लिया।", "10,000 women delegates from across the country participated.", "सम्मेलन", "Convention", "2026-06-20", "https://images.unsplash.com/photo-1760872646642-5c4cde741cfe?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", False),
            ("स्वच्छता अभियान में 2 लाख कार्यकर्ता सक्रिय", "2 Lakh Volunteers Join Cleanliness Drive", "राष्ट्रव्यापी अभियान के तहत 500 शहरों में सफाई कार्यक्रम आयोजित।", "Cleanliness programmes organised in 500 cities under the nationwide drive.", "अभियान", "Campaign", "2026-06-15", "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", False),
            ("डिजिटल भारत कार्यशाला शुरू", "Digital Bharat Workshop Launched", "युवाओं को डिजिटल कौशल प्रशिक्षण देने की पहल शुरू हुई।", "Initiative launched to train youth in digital skills.", "शिक्षा", "Education", "2026-06-10", "https://images.unsplash.com/photo-1587474260584-136574528ed5?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", False),
            ("सहकारिता सम्मेलन में नई घोषणाएं", "New Announcements at Cooperative Summit", "ग्रामीण अर्थव्यवस्था को मजबूत करने के लिए नई योजनाओं का ऐलान।", "New schemes announced to strengthen the rural economy.", "नीति", "Policy", "2026-06-05", "https://images.unsplash.com/photo-1594882471743-2758d2ce5f00?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", False),
        ]
        await db.news.insert_many([
            {"id": str(uuid.uuid4()), "title_hi": t[0], "title_en": t[1], "desc_hi": t[2], "desc_en": t[3], "category_hi": t[4], "category_en": t[5], "date": t[6], "image": t[7], "featured": t[8]} for t in news
        ])
    if await db.events.count_documents({}) == 0:
        events = [
            ("जन आशीर्वाद रैली", "Jan Ashirwad Rally", "2026-07-20", "10:00 AM", "रामलीला मैदान, नई दिल्ली", "Ramlila Maidan, New Delhi", "रैली", "Rally", "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
            ("कार्यकर्ता प्रशिक्षण शिविर", "Worker Training Camp", "2026-07-25", "9:00 AM", "लखनऊ, उत्तर प्रदेश", "Lucknow, Uttar Pradesh", "प्रशिक्षण", "Training", "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
            ("स्वतंत्रता दिवस समारोह", "Independence Day Celebration", "2026-08-15", "8:00 AM", "प्रदेश मुख्यालय, जयपुर", "State Headquarters, Jaipur", "समारोह", "Ceremony", "https://images.pexels.com/photos/39013505/pexels-photo-39013505.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("युवा रोजगार मेला", "Youth Employment Fair", "2026-08-02", "11:00 AM", "पटना, बिहार", "Patna, Bihar", "मेला", "Fair", "https://images.unsplash.com/photo-1760872646642-5c4cde741cfe?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"),
        ]
        await db.events.insert_many([
            {"id": str(uuid.uuid4()), "title_hi": e[0], "title_en": e[1], "date": e[2], "time": e[3], "location_hi": e[4], "location_en": e[5], "category_hi": e[6], "category_en": e[7], "image": e[8]} for e in events
        ])
    if await db.media.count_documents({}) == 0:
        media = [
            {"type": "live", "title_hi": "राष्ट्रीय अध्यक्ष का संबोधन - सीधा प्रसारण", "title_en": "National President's Address - LIVE", "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "thumbnail": "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
            {"type": "video", "title_hi": "पार्टी की उपलब्धियां 2026", "title_en": "Party Achievements 2026", "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "thumbnail": "https://images.pexels.com/photos/39013505/pexels-photo-39013505.jpeg?auto=compress&cs=tinysrgb&w=800"},
            {"type": "video", "title_hi": "युवा संवाद कार्यक्रम की झलकियां", "title_en": "Highlights of Yuva Samvad", "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "thumbnail": "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
            {"type": "video", "title_hi": "स्वच्छता अभियान विशेष", "title_en": "Cleanliness Drive Special", "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", "thumbnail": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"},
            {"type": "photo", "title_hi": "जनसभा, वाराणसी", "title_en": "Public Meeting, Varanasi", "url": "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", "thumbnail": ""},
            {"type": "photo", "title_hi": "संसद भवन, नई दिल्ली", "title_en": "Parliament House, New Delhi", "url": "https://images.unsplash.com/photo-1760872646642-5c4cde741cfe?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", "thumbnail": ""},
            {"type": "photo", "title_hi": "तिरंगा यात्रा", "title_en": "Tiranga Yatra", "url": "https://images.pexels.com/photos/39013505/pexels-photo-39013505.jpeg?auto=compress&cs=tinysrgb&w=800", "thumbnail": ""},
            {"type": "photo", "title_hi": "कार्यकर्ता सम्मेलन", "title_en": "Workers Convention", "url": "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", "thumbnail": ""},
            {"type": "photo", "title_hi": "इंडिया गेट, दिल्ली", "title_en": "India Gate, Delhi", "url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", "thumbnail": ""},
            {"type": "photo", "title_hi": "ताज महल, आगरा", "title_en": "Taj Mahal, Agra", "url": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800", "thumbnail": ""},
        ]
        await db.media.insert_many([{**m, "id": str(uuid.uuid4())} for m in media])
    if await db.states.count_documents({}) == 0:
        states = [
            ("उत्तर प्रदेश", "Uttar Pradesh", "UP", "लखनऊ / Lucknow", 75, "2.1 Cr", 403, "श्री विक्रम चौधरी", "Vikram Chaudhary", 1980, 205, 140),
            ("महाराष्ट्र", "Maharashtra", "MH", "मुंबई / Mumbai", 36, "1.4 Cr", 288, "श्री संदीप पवार", "Sandeep Pawar", 1980, 125, 280),
            ("बिहार", "Bihar", "BR", "पटना / Patna", 38, "90 Lakh", 243, "श्री राकेश कुमार", "Rakesh Kumar", 1980, 245, 160),
            ("पश्चिम बंगाल", "West Bengal", "WB", "कोलकाता / Kolkata", 23, "75 Lakh", 294, "श्रीमती सुप्रिया सेन", "Supriya Sen", 1985, 280, 225),
            ("मध्य प्रदेश", "Madhya Pradesh", "MP", "भोपाल / Bhopal", 52, "1.1 Cr", 230, "श्री देवेंद्र राठौड़", "Devendra Rathore", 1980, 165, 220),
            ("तमिलनाडु", "Tamil Nadu", "TN", "चेन्नई / Chennai", 38, "60 Lakh", 234, "श्री के. वेंकटेशन", "K. Venkatesan", 1984, 155, 405),
            ("राजस्थान", "Rajasthan", "RJ", "जयपुर / Jaipur", 33, "85 Lakh", 200, "श्री हनुमान सिंह", "Hanuman Singh", 1980, 118, 170),
            ("कर्नाटक", "Karnataka", "KA", "बेंगलुरु / Bengaluru", 31, "70 Lakh", 224, "श्रीमती लक्ष्मी नारायण", "Lakshmi Narayan", 1982, 132, 352),
            ("गुजरात", "Gujarat", "GJ", "गांधीनगर / Gandhinagar", 33, "95 Lakh", 182, "श्री भरत पटेल", "Bharat Patel", 1980, 82, 245),
            ("असम", "Assam", "AS", "दिसपुर / Dispur", 35, "40 Lakh", 126, "श्री देबोजित बरुआ", "Debojit Baruah", 1986, 330, 172),
            ("पंजाब", "Punjab", "PB", "चंडीगढ़ / Chandigarh", 23, "45 Lakh", 117, "श्री गुरप्रीत सिंह", "Gurpreet Singh", 1981, 135, 78),
            ("दिल्ली", "Delhi", "DL", "नई दिल्ली / New Delhi", 11, "55 Lakh", 70, "श्रीमती रेखा गुप्ता", "Rekha Gupta", 1980, 168, 108),
        ]
        await db.states.insert_many([
            {"id": str(uuid.uuid4()), "name_hi": s[0], "name_en": s[1], "code": s[2], "capital": s[3], "districts": s[4], "members": s[5], "offices": s[6], "regional_leader_hi": s[7], "regional_leader_en": s[8], "since": s[9], "x": s[10], "y": s[11]} for s in states
        ])


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_content()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
