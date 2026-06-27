import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:6000",
  withCredentials: true,
  timeout: 10000
});

// Optional: request logging
api.interceptors.request.use((config) => {
  console.log("[API REQUEST]", config.method?.toUpperCase(), config.url);
  return config;
});

// Optional: response logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", err.response?.status, err.response?.data);
    return Promise.reject(err);
  }
);

export default api;
