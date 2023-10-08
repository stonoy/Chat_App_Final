import axios from "axios";
import moment from "moment";

export const customFetch = axios.create({
  baseURL: "/api/node",
});

export const getCurrentDateTime = () => {
  return moment().format()
}
