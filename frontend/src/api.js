import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bjp_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const formatApiError = (e, fallback = "Something went wrong") => {
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || "").filter(Boolean).join(" ");
  return fallback;
};

export default api;
