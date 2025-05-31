"use client";
import API_FETCHER from "@/common/auth";
import { getApiEndpoints } from "../api_endpoints/Api_Endpoints";
import { getCookie } from "../Helper";

const role = getCookie("role") || "admin";

export const signup = async (data) => {
  const ENDPOINTS = getApiEndpoints(role);
  return API_FETCHER({
    url: `${ENDPOINTS.login}`,
    method: "POST",
    data,
  });
};

export const login = async (data) => {
  const ENDPOINTS = getApiEndpoints(role);
  return API_FETCHER({
    url: `${ENDPOINTS.login}`,
    method: "POST",
    data: data,
  });
};
