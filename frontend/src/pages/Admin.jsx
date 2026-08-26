import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

const inp = "w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-saffron";
const lbl = "block text-xs font-semibold text-slate-500 mb-1";

const Field = ({ label, tid, ...props }) => (
  <div>
    <label className={lbl}>{label}</label>
    <input data-testid={tid} className={inp} {...props} />
  </div>
);

const emptyLeader = { name_hi: "", name_en: "", designation_hi: "", designation_en: "", profile_hi: "", profile_en: "", photo: "", special: false, active: true };

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("bjp_admin_token"));
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [media, setMedia] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leaderDialog, setLeaderDialog] = useState(null); // {mode:'add'|'edit', data}
  const [addDialog, setAddDialog] = useState(null); // 'news' | 'events' | 'media'
  const [formData, setFormData] = useState({});

  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", creds);
      localStorage.setItem("bjp_admin_token", data.token);
      setToken(data.token);
      toast.success("Logged in");
    } catch (err) {
      setError(formatApiError(err, "Login failed"));
    }
  };

  const logout = () => {
    localStorage.removeItem("bjp_admin_token");
    setToken(null);
  };

  const loadAll = () => {
    api.get("/admin/leaders").then((r) => setLeaders(r.data)).catch((e) => { if (e?.response?.status === 401) logout(); });
    api.get("/admin/donations").then((r) => setDonations(r.data)).catch(() => {});
    api.get("/news?limit=100").then((r) => setNews(r.data.items)).catch(() => {});
    api.get("/events").then((r) => setEvents(r.data)).catch(() => {});
    api.get("/media").then((r) => setMedia(r.data)).catch(() => {});
    api.get("/admin/contacts").then((r) => setContacts(r.data)).catch(() => {});
  };

  useEffect(() => { if (token) loadAll(); }, [token]);

  const saveLeader = async (e) => {
    e.preventDefault();
    try {
      if (leaderDialog.mode === "add") await api.post("/admin/leaders", leaderDialog.data);
      else await api.put(`/admin/leaders/${leaderDialog.data.id}`, leaderDialog.data);
      toast.success("Leader saved");
      setLeaderDialog(null);
      loadAll();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const deleteLeader = async (id) => {
    await api.delete(`/admin/leaders/${id}`).catch(() => {});
    toast.success("Leader removed");
    loadAll();
  };

  const setDonationStatus = async (id, status) => {
    try {
      await api.patch(`/admin/donations/${id}`, { status });
      toast.success("Status updated");
      loadAll();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/${addDialog}`, formData);
      toast.success("Added");
      setAddDialog(null);
      setFormData({});
      loadAll();
    } catch (err) { toast.error(formatApiError(err)); }
  };

  const deleteItem = async (type, id) => {
    await api.delete(`/admin/${type}/${id}`).catch(() => {});
    toast.success("Deleted");
    loadAll();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4" data-testid="admin-login-page">
        <form onSubmit={login} className="w-full max-w-sm bg-white rounded-3xl card-shadow-lg p-8" data-testid="admin-login-form">
          <div className="flex items-center gap-3 mb-6">
            <img src="/assets/logo.jpg" alt="BJP Lotus Logo" className="w-11 h-11 rounded-full object-cover" />
            <div>
              <h1 className="font-heading font-bold text-navy">Admin Panel</h1>
              <p className="text-xs text-slate-500">भारतीय जनता पार्टी</p>
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Email" tid="admin-email-input" type="email" required value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} />
            <Field label="Password" tid="admin-password-input" type="password" required value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
          </div>
          {error && <p className="mt-3 text-xs font-medium text-red-500" data-testid="admin-login-error">{error}</p>}
          <button data-testid="admin-login-btn" className="mt-6 w-full h-11 rounded-full bg-saffron text-white font-bold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform] duration-200">
            Login
          </button>
          <a href="/" data-testid="admin-back-home-link" className="block text-center mt-4 text-xs text-slate-400 hover:text-saffron-dark">← Back to website</a>
        </form>
      </div>
    );
  }

  const statusColor = { PENDING: "bg-amber-100 text-amber-700", VERIFIED: "bg-green-100 text-green-700", SUCCESS: "bg-green-100 text-green-700", FAILED: "bg-red-100 text-red-600" };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.jpg" alt="BJP Lotus Logo" className="w-9 h-9 rounded-full object-cover" />
            <h1 className="font-heading font-bold">BJP Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button data-testid="admin-refresh-btn" onClick={loadAll} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><RefreshCw className="w-4 h-4" /></button>
            <a href="/" data-testid="admin-view-site-link" className="text-xs text-white/70 hover:text-saffron px-2">View Site</a>
            <button data-testid="admin-logout-btn" onClick={logout} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="leaders">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 mb-6" data-testid="admin-tabs">
            {["leaders", "donations", "news", "events", "media", "contacts"].map((tab) => (
              <TabsTrigger key={tab} value={tab} data-testid={`admin-tab-${tab}`}
                className="rounded-xl px-4 py-2 text-sm font-medium capitalize data-[state=active]:bg-saffron data-[state=active]:text-white">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="leaders">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-xl font-bold text-navy">Leaders ({leaders.length})</h2>
              <button data-testid="add-leader-btn" onClick={() => setLeaderDialog({ mode: "add", data: { ...emptyLeader } })}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform]">
                <Plus className="w-4 h-4" />Add Leader
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]" data-testid="leaders-table">
                <thead><tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="p-4">Leader</th><th className="p-4">Designation</th><th className="p-4">Special</th><th className="p-4">Active</th><th className="p-4 text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {leaders.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100 hover:bg-saffron-50/40" data-testid={`leader-row-${l.id}`}>
                      <td className="p-4"><p className="font-semibold text-navy">{l.name_hi}</p><p className="text-xs text-slate-500">{l.name_en}</p></td>
                      <td className="p-4 text-slate-600">{l.designation_en}</td>
                      <td className="p-4">{l.special ? <span className="px-2 py-1 rounded-full bg-lotuspink/10 text-lotuspink text-xs font-bold">Yes</span> : <span className="text-slate-400">—</span>}</td>
                      <td className="p-4">{l.active ? <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Active</span> : <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">Hidden</span>}</td>
                      <td className="p-4 text-right">
                        <button data-testid={`edit-leader-${l.id}`} onClick={() => setLeaderDialog({ mode: "edit", data: { ...l } })} className="p-2 text-slate-400 hover:text-navy transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button data-testid={`delete-leader-${l.id}`} onClick={() => deleteLeader(l.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="donations">
            <h2 className="font-heading text-xl font-bold text-navy mb-4">Donations ({donations.length})</h2>
            <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]" data-testid="donations-table">
                <thead><tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="p-4">Receipt</th><th className="p-4">Donor</th><th className="p-4">Amount</th><th className="p-4">For</th><th className="p-4">Date</th><th className="p-4">Status</th>
                </tr></thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 hover:bg-saffron-50/40" data-testid={`donation-row-${d.id}`}>
                      <td className="p-4 font-mono text-xs font-bold text-saffron-dark">{d.receipt_no}</td>
                      <td className="p-4"><p className="font-semibold text-navy">{d.name}</p><p className="text-xs text-slate-500">{d.mobile} • {d.city}, {d.state}</p></td>
                      <td className="p-4 font-heading font-bold text-navy">₹{Number(d.amount).toLocaleString("en-IN")}</td>
                      <td className="p-4 text-xs text-slate-600">{d.leader_name || "General"}</td>
                      <td className="p-4 text-xs text-slate-500">{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="p-4">
                        <Select value={d.status} onValueChange={(v) => setDonationStatus(d.id, v)}>
                          <SelectTrigger data-testid={`donation-status-${d.id}`} className={`w-32 h-8 text-xs font-bold border-0 ${statusColor[d.status] || "bg-slate-100"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["PENDING", "VERIFIED", "FAILED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No donations yet</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {[
            { key: "news", rows: news, cols: ["title_hi", "category_en", "date"] },
            { key: "events", rows: events, cols: ["title_hi", "location_en", "date"] },
            { key: "media", rows: media, cols: ["title_hi", "type", ""] },
          ].map(({ key, rows, cols }) => (
            <TabsContent key={key} value={key}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl font-bold text-navy capitalize">{key} ({rows.length})</h2>
                <button data-testid={`add-${key}-btn`} onClick={() => { setFormData({}); setAddDialog(key); }}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform]">
                  <Plus className="w-4 h-4" />Add
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow divide-y divide-slate-100" data-testid={`${key}-list`}>
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 p-4" data-testid={`${key}-row-${r.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy text-sm truncate">{r.title_hi}</p>
                      <p className="text-xs text-slate-500 truncate">{r.title_en}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{cols.slice(1).map((c) => r[c]).filter(Boolean).join(" • ")}</span>
                    <button data-testid={`delete-${key}-${r.id}`} onClick={() => deleteItem(key, r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {rows.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No items</p>}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="contacts">
            <h2 className="font-heading text-xl font-bold text-navy mb-4">Contact Messages ({contacts.length})</h2>
            <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow divide-y divide-slate-100" data-testid="contacts-list">
              {contacts.map((c) => (
                <div key={c.id} className="p-4" data-testid={`contact-row-${c.id}`}>
                  <p className="font-semibold text-navy text-sm">{c.name} <span className="font-normal text-xs text-slate-500">• {c.email} {c.phone && `• ${c.phone}`}</span></p>
                  <p className="text-sm text-slate-600 mt-1">{c.message}</p>
                </div>
              ))}
              {contacts.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No messages yet</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!leaderDialog} onOpenChange={() => setLeaderDialog(null)}>
        <DialogContent className="max-w-lg bg-white max-h-[85vh] overflow-y-auto" data-testid="leader-form-dialog">
          {leaderDialog && (
            <form onSubmit={saveLeader} className="space-y-3">
              <DialogTitle className="font-heading text-lg font-bold text-navy">{leaderDialog.mode === "add" ? "Add Leader" : "Edit Leader"}</DialogTitle>
              <div className="grid grid-cols-2 gap-3">
                <Field label="नाम (Hindi)" tid="leader-name-hi" required value={leaderDialog.data.name_hi} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, name_hi: e.target.value } })} />
                <Field label="Name (English)" tid="leader-name-en" required value={leaderDialog.data.name_en} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, name_en: e.target.value } })} />
                <Field label="पद (Hindi)" tid="leader-desig-hi" required value={leaderDialog.data.designation_hi} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, designation_hi: e.target.value } })} />
                <Field label="Designation (English)" tid="leader-desig-en" required value={leaderDialog.data.designation_en} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, designation_en: e.target.value } })} />
              </div>
              <Field label="Profile (Hindi)" tid="leader-profile-hi" value={leaderDialog.data.profile_hi} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, profile_hi: e.target.value } })} />
              <Field label="Profile (English)" tid="leader-profile-en" value={leaderDialog.data.profile_en} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, profile_en: e.target.value } })} />
              <Field label="Photo URL" tid="leader-photo" value={leaderDialog.data.photo} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, photo: e.target.value } })} />
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" data-testid="leader-special-check" checked={leaderDialog.data.special} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, special: e.target.checked } })} className="w-4 h-4 accent-[#FF9933]" />
                  Special (Donation section)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" data-testid="leader-active-check" checked={leaderDialog.data.active} onChange={(e) => setLeaderDialog({ ...leaderDialog, data: { ...leaderDialog.data, active: e.target.checked } })} className="w-4 h-4 accent-[#FF9933]" />
                  Visible on website
                </label>
              </div>
              <button data-testid="leader-save-btn" className="w-full h-11 rounded-full bg-saffron text-white font-bold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform]">Save Leader</button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!addDialog} onOpenChange={() => setAddDialog(null)}>
        <DialogContent className="max-w-lg bg-white max-h-[85vh] overflow-y-auto" data-testid="add-item-dialog">
          {addDialog && (
            <form onSubmit={saveItem} className="space-y-3">
              <DialogTitle className="font-heading text-lg font-bold text-navy capitalize">Add {addDialog}</DialogTitle>
              <Field label="शीर्षक (Hindi)" tid="item-title-hi" required value={formData.title_hi || ""} onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })} />
              <Field label="Title (English)" tid="item-title-en" required value={formData.title_en || ""} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              {addDialog === "news" && (<>
                <Field label="विवरण (Hindi)" tid="item-desc-hi" value={formData.desc_hi || ""} onChange={(e) => setFormData({ ...formData, desc_hi: e.target.value })} />
                <Field label="Description (English)" tid="item-desc-en" value={formData.desc_en || ""} onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })} />
                <Field label="Image URL" tid="item-image" value={formData.image || ""} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
              </>)}
              {addDialog === "events" && (<>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date (YYYY-MM-DD)" tid="item-date" required value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  <Field label="Time" tid="item-time" required value={formData.time || ""} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                  <Field label="स्थान (Hindi)" tid="item-loc-hi" required value={formData.location_hi || ""} onChange={(e) => setFormData({ ...formData, location_hi: e.target.value })} />
                  <Field label="Location (English)" tid="item-loc-en" required value={formData.location_en || ""} onChange={(e) => setFormData({ ...formData, location_en: e.target.value })} />
                </div>
                <Field label="Image URL" tid="item-image" value={formData.image || ""} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
              </>)}
              {addDialog === "media" && (<>
                <div>
                  <label className={lbl}>Type</label>
                  <Select value={formData.type || "video"} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger data-testid="item-type-select" className={inp}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["live", "video", "photo"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="URL (video/photo)" tid="item-url" required value={formData.url || ""} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                <Field label="Thumbnail URL" tid="item-thumb" value={formData.thumbnail || ""} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} />
              </>)}
              <button data-testid="item-save-btn" className="w-full h-11 rounded-full bg-saffron text-white font-bold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform]">Save</button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
