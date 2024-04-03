import axios from "axios";

const token = import.meta.env.VITE_TELEGRAM_API_TOKEN;

const BASE_URL = `https://api.telegram.org/bot${token}`;

const headersConfig = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const telegram = axios.create({
  baseURL: BASE_URL,
  headers: headersConfig,
});

export default telegram;
