import { RestaurantSettings, Category, Product, Order, UserProfile } from './types.ts';

const BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to make API requests with JSON parsing and error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject stored admin key if present
  const adminKey = localStorage.getItem('masala_admin_key');
  if (adminKey && !headers.has('x-admin-key')) {
    headers.set('x-admin-key', adminKey);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `Server responded with ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch {
        // ignore non-json error responses
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw new Error(error.message || 'Unable to connect to MASALA backend service. Please check your network.');
  }
}

// 1. Settings
export const getSettings = () => fetchApi<RestaurantSettings>('/api/settings');

export const updateSettings = (data: Partial<RestaurantSettings>, token?: string) =>
  fetchApi<{ success: boolean; settings: RestaurantSettings }>('/api/admin/settings', {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(data),
  });

// 2. Categories
export const getCategories = () => fetchApi<Category[]>('/api/categories');

export const createCategory = (data: Partial<Category>, token?: string) =>
  fetchApi<Category>('/api/admin/categories', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(data),
  });

export const updateCategory = (id: number, data: Partial<Category>, token?: string) =>
  fetchApi<Category>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(data),
  });

export const deleteCategory = (id: number, token?: string) =>
  fetchApi<{ success: boolean }>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// 3. Products
export const getProducts = (onlyAvailable = false) =>
  fetchApi<Product[]>(`/api/products${onlyAvailable ? '?available=true' : ''}`);

export const createProduct = (data: Partial<Product>, token?: string) =>
  fetchApi<Product>('/api/admin/products', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(data),
  });

export const updateProduct = (id: number, data: Partial<Product>, token?: string) =>
  fetchApi<Product>(`/api/admin/products/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: number, token?: string) =>
  fetchApi<{ success: boolean }>(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// 4. Users
export const syncUserProfile = (profile: Partial<UserProfile>, token: string) =>
  fetchApi<UserProfile>('/api/users/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile),
  });

export const getMyProfile = (token: string) =>
  fetchApi<UserProfile>('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllCustomers = (token?: string) =>
  fetchApi<UserProfile[]>('/api/admin/users', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// 5. Orders
export const createOrder = (orderData: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  userUid?: string;
  paymentMethod: string;
  notes?: string;
  items: Array<{ productId: number; quantity: number }>;
}, token?: string) =>
  fetchApi<{ order: Order; items: any[] }>('/api/orders', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(orderData),
  });

export const getOrder = (orderNumber: string) =>
  fetchApi<Order>(`/api/orders/${orderNumber}`);

export const getUserOrders = (uid: string, token: string) =>
  fetchApi<Order[]>(`/api/orders/user/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllOrders = (token?: string) =>
  fetchApi<Order[]>('/api/admin/orders', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

export const updateOrderStatus = (orderId: number, status: string, token?: string) =>
  fetchApi<Order>(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ status }),
  });

// 6. Razorpay Payments
export const createPayment = (orderNumber: string) =>
  fetchApi<{
    gateway: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    message?: string;
  }>('/api/payment/create', {
    method: 'POST',
    body: JSON.stringify({ orderNumber }),
  });

export const verifyPayment = (paymentData: {
  orderNumber: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  simulationSuccess?: boolean;
}) =>
  fetchApi<{ success: boolean; orderNumber: string; paymentStatus: string; orderStatus: string }>(
    '/api/payment/verify',
    {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }
  );

// 7. Admin Auth
export const adminLogin = (password: string) =>
  fetchApi<{ success: boolean; adminKey: string; message: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
