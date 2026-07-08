import api from "./api";

// Health check
export const getHealth = () => api.get("/health");

// User profile
export const getMe = () => api.get("/user/me");

// Creator profile
export const getCreator = (id: string | number) =>
  api.get(`/creator/${id}`);

// Upload (mock)
export const uploadFile = (filename: string) =>
  api.post("/upload", { filename });

// Dashboard
export const getDashboard = () =>
  api.get("/creator/dashboard");