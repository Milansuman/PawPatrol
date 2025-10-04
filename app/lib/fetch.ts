import * as SecureStore from 'expo-secure-store';

const BACKEND_URL = "http://10.148.15.206:8787";
const TOKEN_KEY = 'auth_token';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function authenticatedFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getToken();
    
    const url = `${BACKEND_URL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        await removeToken();
      }
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, { method: 'GET' });
}

export async function apiPost<T = any>(
  endpoint: string, 
  body?: any
): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T = any>(
  endpoint: string, 
  body?: any
): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, { method: 'DELETE' });
}
