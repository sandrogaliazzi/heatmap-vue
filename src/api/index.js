import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const BASE_URL = "https://api.heatmap.conectnet.net/";

const headersConfig = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("token") || "",
};

const fetchApi = axios.create({
  baseURL: BASE_URL,
  headers: headersConfig,
});

fetchApi.interceptors.response.use(
  (response) => {
    //console.log(response);

    return response;
  },
  (error) => {
    if (error) {
      const errorStatus = error.response.status;

      if (errorStatus === 403 || errorStatus === 401) {
        const auth = useAuthStore();
        auth.tokenExpired = true;
      }
    }
  }
);

export default fetchApi;
