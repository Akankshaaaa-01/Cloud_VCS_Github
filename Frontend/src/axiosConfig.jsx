import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002",
});

// Har request se pehle automatically token attach ho
//because backend mein authenticateMiddleware token check karta hai, toh frontend se bhi token bhejna zaroori hai
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;