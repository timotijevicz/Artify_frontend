import axios from "axios";

const base = process.env.REACT_APP_BASE_URL || "";
const baseURL = base.endsWith("/") ? base : `${base}/`; // ✅ MINIMALNO

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers = config.headers || {}; // ✅ MINIMALNO (da ne pukne)
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "AXIOS REQUEST:",
      config.method?.toUpperCase(),
      config.url,
      config.headers.Authorization
    );

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("AXIOS ERROR:", {
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
