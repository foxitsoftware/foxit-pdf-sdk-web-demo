import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { currentToken } from './api';
import { serverUrl } from '../config';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/collab-server',
});

axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response.data;
  },
  function (error: AxiosError) {
    if (error.response?.status === 401) {
      console.log('please login');
    }
    throw error;
  },
);

axiosInstance.interceptors.request.use((config) => {
  const token = currentToken;
  if (token) {
    config.headers!['Authorization'] = `Bearer ${token}`;
  }
  config.baseURL = serverUrl;
  return config;
});

export type Response<T> = {
  ret: number;
  data: T;
};

export const request = axiosInstance.request;
