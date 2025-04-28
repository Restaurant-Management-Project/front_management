import axios from "axios";
const instance = axios.create({
  baseURL: "http://localhost:8001/v1/api",
  headers: {
    // "ngrok-skip-browser-warning": "skip-browser-warning",
  },
  // withCredentials: true,
});
export default instance;
