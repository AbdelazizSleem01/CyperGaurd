import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import type { ApiResponse } from '../../../shared/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthPath = typeof window !== 'undefined' &&
        (window.location.pathname.includes('/auth/login') || window.location.pathname.includes('/auth/register'));

      const isAuthUrl = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

      if (error.response?.status === 401 && !isAuthPath && !isAuthUrl) {
        Cookies.remove('auth-token');
        localStorage.removeItem('auth-user');
        window.location.href = '/en/auth/login';
      }

      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      } else if (error.response?.data?.error) {
        error.message = error.response.data.error;
      } else if (Array.isArray(error.response?.data?.errors)) {
        error.message = error.response.data.errors[0]?.msg || 'Validation error';
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createApiClient();

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, config);
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data!;
}

export async function post<T>(url: string, body: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body, config);
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data!;
}

export async function put<T>(url: string, body: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data!;
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url);
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data!;
}
