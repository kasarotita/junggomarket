import client from './client';

export interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  location: string;
  view_count: number;
  like_count: number;
  created_at: string;
}

export interface ProductCreate {
  title: string;
  description: string;
  price: number;
  category_id: number;
  location: string;
}

export const getProducts = (params?: {
  skip?: number; limit?: number;
  category_id?: number; search?: string;
}) => client.get<Product[]>('/products', { params });

export const getProduct = (id: number) =>
  client.get<Product>(`/products/${id}`);

export const createProduct = (data: ProductCreate) =>
  client.post<Product>('/products', data);

export const deleteProduct = (id: number) =>
  client.delete(`/products/${id}`);

export const toggleLike = (id: number) =>
  client.post(`/products/${id}/like`);

export const getCategories = () =>
  client.get('/categories');
