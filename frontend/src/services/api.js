import axios from "axios";
import { auth } from "../config/firebase";  

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach Firebase auth token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Token get error:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Map error responses to user-friendly messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 429) {
      error.userMessage =
        message ||
        "You've made too many requests. Please wait a few minutes and try again.";
    } else if (status === 503) {
      error.userMessage =
        message ||
        "Our AI service is busy right now. Please try again in a minute.";
    } else if (status === 500) {
      error.userMessage = "Something went wrong on our end. Please try again.";
    } else if (status === 401) {
      error.userMessage = "Session expired. Please login again.";
    } else if (!error.response) {
      error.userMessage = "Network error. Please check your internet connection.";
    } else {
      error.userMessage = message || "Something went wrong. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;