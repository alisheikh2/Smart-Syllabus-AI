import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    // ✅ User-friendly messages har status ke liye
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
    } else if (!error.response) {
      error.userMessage = "Network error. Please check your internet connection.";
    } else {
      error.userMessage = message || "Something went wrong. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;