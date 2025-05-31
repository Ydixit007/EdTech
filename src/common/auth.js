"use client";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors?.response.use(
  (response) => response,
  (error) => {
    // console.log('response', interceptors)
    if (error.response && error.response.status === 401) {
      console.log("Token expired or unauthorized");

      Cookies.get("accessToken");

      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const API_FETCHER = async ({
  url,
  method = "GET",
  data = {},
  params = {},
  headers = {},
}) => {
  try {
    const config = {
      url,
      method,
      data,
      params,
      headers,
    };
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default API_FETCHER;
