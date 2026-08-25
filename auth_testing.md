# Auth Testing Playbook

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"})
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email.

## Step 2: API Testing
```
TOKEN=$(curl -s -X POST $REACT_APP_BACKEND_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@bharatiyajantaparty.in","password":"Admin@10001"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s $REACT_APP_BACKEND_URL/api/auth/me -H "Authorization: Bearer $TOKEN"
```
Login returns {token, user}. /auth/me returns the user with the Bearer token.

Note: this app uses Bearer-token auth (localStorage) rather than httpOnly cookies, since the admin panel is a separate SPA route calling a cross-origin preview API.
