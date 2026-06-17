import client from './client';
export interface Product {
  id: number; title: string; price: number; status: string;
  location: string; view_count: number; like_count: number;
  images: string; description: string; seller_id: number;
  category_id: number; created_at: string;
  seller_nickname?: string; seller_manner_score?: number;
  seller_location?: string; is_liked?: boolean;
}
export interface ProductCreate { title: string; description: string; price: number; category_id: number; location: string; }
export const getProducts = (params?: any) => client.get<Product[]>('/products', { params });
export const getProduct = (id: number) => client.get<Product>(`/products/${id}`);
export const createProduct = (data: ProductCreate) => client.post<Product>('/products', data);
export const updateProduct = (id: number, data: ProductCreate) => client.put<Product>(`/products/${id}`, data);
export const deleteProduct = (id: number) => client.delete(`/products/${id}`);
export const toggleLike = (id: number) => client.post(`/products/${id}/like`);
export const updateStatus = (id: number, status: string) => client.patch(`/products/${id}/status`, null, { params: { status } });
export const getCategories = () => client.get('/categories');
export const uploadImage = (id: number, file: File) => {
  const fd = new FormData(); fd.append('file', file);
  return client.post(`/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getMyProducts = () => client.get<Product[]>('/users/me/products');
export const getMyLikes = () => client.get<Product[]>('/users/me/likes');
