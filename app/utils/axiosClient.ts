import axios from "axios";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const axiosApiInstance = axios.create();

// Helper function to get the latest Firebase token
const getLatestFirebaseToken = async () => {
  const user = auth.currentUser;
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.token;
  } else {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        localStorage.removeItem("auth");
        localStorage.removeItem("emailNotVerified");
        location.reload();
      })
      .catch((error) => {
        console.log("unable to logout");
      });
  }
  return null;
};

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async (config: any) => {
    const firebaseToken = localStorage.getItem("auth");
    if (firebaseToken) {
      config.headers = {
        Authorization: `Bearer ${firebaseToken}`,
        "Content-Type": "application/json",
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const firebaseToken = await getLatestFirebaseToken();
      if (firebaseToken) {
        localStorage.setItem("auth", firebaseToken);
        originalRequest.headers["Authorization"] = `Bearer ${firebaseToken}`;
        originalRequest.headers["Content-Type"] = "application/json";
        return axiosApiInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosApiInstance;
