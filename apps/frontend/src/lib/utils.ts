import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type WindowWithClerk = Window & {
  Clerk?: {
    session?: {
      getToken(): Promise<string | null>;
    };
  };
};

export const getSessionToken = async () => {
  if (!(window as WindowWithClerk).Clerk?.session) return null;
  return (
    (await (window as WindowWithClerk)?.Clerk?.session?.getToken()) ?? null
  );
};

export function setupAuthInterseptor() {
  return api.interceptors.request.use(async (config) => {
    const token = await getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
