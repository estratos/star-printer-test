import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const sessionData = localStorage.getItem("vue-app-session");
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed && parsed.session && parsed.session.token) {
          config.headers.Authorization = `Bearer ${parsed.session.token}`;
        }
      }
    } catch (error) {
      console.warn("Error reading session:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Response error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network error:", error.request);
    } else {
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;