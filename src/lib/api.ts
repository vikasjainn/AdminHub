import type { DummyProduct, ProductsResponse, User, UsersResponse } from '@/types';
import { mapUser } from '@/lib/mappers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://dummyjson.com';

const USER_FIELDS = 'firstName,lastName,email,phone,image,birthDate,address,role';
const PRODUCT_FIELDS = 'title,category,price';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Network error. Please check your internet connection.');
  }
  if (!response.ok) throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  return (await response.json()) as T;
}

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

/* ---------- Reads ---------- */

/** `limit=0` returns every record, which the client then filters and paginates. */
export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const data = await request<UsersResponse>(`/users?limit=0&select=${USER_FIELDS}`, { signal });
  if (!Array.isArray(data.users)) throw new ApiError('Unexpected users response.');
  return data.users.map(mapUser);
}

export async function fetchProducts(signal?: AbortSignal): Promise<DummyProduct[]> {
  const data = await request<ProductsResponse>(`/products?limit=0&select=${PRODUCT_FIELDS}`, { signal });
  if (!Array.isArray(data.products)) throw new ApiError('Unexpected products response.');
  return data.products;
}

/* ---------- Writes (DummyJSON simulates these: it responds but does not persist) ---------- */

export const createUserRequest = (user: Partial<User>) => request<unknown>('/users/add', jsonInit('POST', user));
export const updateUserRequest = (id: number, patch: Partial<User>) =>
  request<unknown>(`/users/${id}`, jsonInit('PUT', patch));
export const deleteUserRequest = (id: number) => request<unknown>(`/users/${id}`, jsonInit('DELETE'));
