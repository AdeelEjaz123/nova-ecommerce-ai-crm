export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_featured: boolean;
  category_id: number;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customer_email: string;
  customer_name?: string;
  total_amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  created_at: string;
  shipping_details?: any;
  items: OrderItem[];
}

export interface CheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
  order_id: number;
}
