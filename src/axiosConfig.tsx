import axios from "axios";
const instance = axios.create({
  baseURL: "https://demo-hsh4.onrender.com/api/v1/",
  headers: {
    "ngrok-skip-browser-warning": "skip-browser-warning",
  },
  // withCredentials: true,
});
export default instance;
