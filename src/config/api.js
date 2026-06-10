const PRODUCTION_API_URL = "https://velora-backend-production-3e79.up.railway.app";
const LOCAL_API_URL = "http://localhost:5000";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? LOCAL_API_URL : PRODUCTION_API_URL)
).replace(/\/$/, "");

export const apiUrl = (path = "") =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const assetUrl = (path) => {
  if (!path || path.startsWith("http")) return path;
  return apiUrl(path);
};
