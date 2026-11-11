import { Product, ProductListResponse, Category, Order, CheckoutSessionResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/categories`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category_slug?: string;
  search?: string;
  featured_only?: boolean;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.category_slug) query.set("category_slug", params.category_slug);
  if (params?.search) query.set("search", params.search);
  if (params?.featured_only !== undefined) query.set("featured_only", String(params.featured_only));

  const url = `${API_BASE}/api/products?${query.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${idOrSlug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch product details");
  return res.json();
}

export async function createCheckoutSession(payload: {
  items: { product_id: number; quantity: number }[];
  customer_email: string;
  customer_name?: string;
}): Promise<CheckoutSessionResponse> {
  const res = await fetch(`${API_BASE}/api/checkout/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create checkout session");
  }

  return res.json();
}

export async function fetchOrderBySession(sessionId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/by-session/${sessionId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Order not found for this session");
  return res.json();
}

export interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponseData {
  reply: string;
  sources: string[];
  suggested_questions: string[];
}

export interface KnowledgeDocumentData {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export async function sendCrmChatMessage(
  message: string,
  history: ChatMessagePayload[] = []
): Promise<ChatResponseData> {
  const res = await fetch(`${API_BASE}/api/crm/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "CRM AI assistant is temporarily unavailable");
  }
  return res.json();
}

export async function fetchKnowledgeDocuments(): Promise<KnowledgeDocumentData[]> {
  const res = await fetch(`${API_BASE}/api/crm/documents`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch knowledge documents");
  return res.json();
}

export async function createKnowledgeDocument(payload: {
  title: string;
  content: string;
  category?: string;
}): Promise<KnowledgeDocumentData> {
  const res = await fetch(`${API_BASE}/api/crm/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create knowledge document");
  }
  return res.json();
}

export async function uploadKnowledgeDocumentFile(
  file: File,
  category: string = "policy",
  title?: string
): Promise<KnowledgeDocumentData> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (title) formData.append("title", title);

  const res = await fetch(`${API_BASE}/api/crm/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to upload document file");
  }
  return res.json();
}

export async function deleteKnowledgeDocument(docId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/crm/documents/${docId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete document");
}

export async function updateKnowledgeDocument(
  docId: number,
  payload: { title?: string; content?: string; category?: string }
): Promise<KnowledgeDocumentData> {
  const res = await fetch(`${API_BASE}/api/crm/documents/${docId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update knowledge document");
  }
  return res.json();
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  total_products: number;
  low_stock_count: number;
  total_knowledge_docs: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load admin stats");
  return res.json();
}

export async function fetchAdminOrders(status?: string): Promise<Order[]> {
  const url = status ? `${API_BASE}/api/orders?status=${status}` : `${API_BASE}/api/orders`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export async function createProduct(payload: {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_featured: boolean;
  category_id: number;
}): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create product");
  }
  return res.json();
}

export async function updateProduct(
  productId: number,
  payload: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    is_featured: boolean;
    category_id: number;
  }>
): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update product");
  }
  return res.json();
}

export async function deleteProduct(productId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

