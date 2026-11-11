"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  FileUp,
} from "lucide-react";
import {
  fetchAdminStats,
  fetchKnowledgeDocuments,
  createKnowledgeDocument,
  uploadKnowledgeDocumentFile,
  updateKnowledgeDocument,
  deleteKnowledgeDocument,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminOrders,
  updateOrderStatus,
  fetchCategories,
  AdminStats,
  KnowledgeDocumentData,
} from "@/lib/api";
import { Product, Order, Category } from "@/lib/types";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginPasscode, setLoginPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "rag" | "products" | "orders">("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("nova_admin_logged_in");
      if (auth === "true") setIsAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loginPasscode.trim() === "admin123" || loginPasscode.trim().toLowerCase() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("nova_admin_logged_in", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid passcode. Use 'admin123' or click Demo Login.");
    }
  };

  const handleDemoLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("nova_admin_logged_in", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("nova_admin_logged_in");
  };

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Knowledge Base State
  const [docs, setDocs] = useState<KnowledgeDocumentData[]>([]);
  const [docSearch, setDocSearch] = useState("");
  const [docCategoryFilter, setDocCategoryFilter] = useState("all");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("policy");
  const [docContent, setDocContent] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodCategory, setProdCategory] = useState<number>(1);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [savingProd, setSavingProd] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Global notification banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Load Initial Data
  const loadDashboardData = async () => {
    setLoadingStats(true);
    try {
      const [statsData, docsData, prodsData, ordersData, catsData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchKnowledgeDocuments().catch(() => []),
        fetchProducts({ limit: 100 }).then((res) => res.items).catch(() => []),
        fetchAdminOrders().catch(() => []),
        fetchCategories().catch(() => []),
      ]);

      setStats(statsData);
      setDocs(docsData);
      setProducts(prodsData);
      setOrders(ordersData);
      setCategories(catsData);
      if (catsData.length > 0) setProdCategory(catsData[0].id);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // ----------------------------------------------------------------
  // Knowledge Base Actions
  // ----------------------------------------------------------------
  const handleOpenDocModal = (doc?: KnowledgeDocumentData) => {
    if (doc) {
      setEditingDocId(doc.id);
      setDocTitle(doc.title);
      setDocCategory(doc.category);
      setDocContent(doc.content);
    } else {
      setEditingDocId(null);
      setDocTitle("");
      setDocCategory("policy");
      setDocContent("");
    }
    setIsDocModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDoc(true);
    try {
      if (editingDocId) {
        const updated = await updateKnowledgeDocument(editingDocId, {
          title: docTitle,
          category: docCategory,
          content: docContent,
        });
        setDocs((prev) => prev.map((d) => (d.id === editingDocId ? updated : d)));
        showNotification("Knowledge document updated successfully!");
      } else {
        const created = await createKnowledgeDocument({
          title: docTitle,
          category: docCategory,
          content: docContent,
        });
        setDocs((prev) => [created, ...prev]);
        showNotification("New document added to AI knowledge base!");
      }
      setIsDocModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      alert("Failed to save document: " + err.message);
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document from the AI knowledge base?")) return;
    try {
      await deleteKnowledgeDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      showNotification("Document removed from AI knowledge base.");
      loadDashboardData();
    } catch (err: any) {
      alert("Failed to delete document: " + err.message);
    }
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const created = await uploadKnowledgeDocumentFile(file, "policy");
      setDocs((prev) => [created, ...prev]);
      showNotification(`File "${file.name}" uploaded and indexed into AI Knowledge Base!`);
      loadDashboardData();
    } catch (err: any) {
      alert("File upload failed: " + err.message);
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleImportFileIntoForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setDocContent(text);
        if (!docTitle) {
          const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
          setDocTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ----------------------------------------------------------------
  // Product Actions
  // ----------------------------------------------------------------
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProductId(prod.id);
      setProdName(prod.name);
      setProdSlug(prod.slug);
      setProdDesc(prod.description);
      setProdPrice(String(prod.price));
      setProdStock(String(prod.stock));
      setProdImage(prod.image_url);
      setProdCategory(prod.category_id);
      setProdFeatured(prod.is_featured);
    } else {
      setEditingProductId(null);
      setProdName("");
      setProdSlug("");
      setProdDesc("");
      setProdPrice("");
      setProdStock("20");
      setProdImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80");
      setProdCategory(categories[0]?.id || 1);
      setProdFeatured(false);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProd(true);
    try {
      const payload = {
        name: prodName,
        slug: prodSlug || prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: prodDesc,
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock, 10),
        image_url: prodImage,
        category_id: prodCategory,
        is_featured: prodFeatured,
      };

      if (editingProductId) {
        const updated = await updateProduct(editingProductId, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? updated : p)));
        showNotification(`Product "${updated.name}" updated!`);
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        showNotification(`Product "${created.name}" created!`);
      }
      setIsProductModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      alert("Error saving product: " + err.message);
    } finally {
      setSavingProd(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showNotification("Product deleted successfully.");
      loadDashboardData();
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    }
  };

  // ----------------------------------------------------------------
  // Order Actions
  // ----------------------------------------------------------------
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showNotification(`Order #${orderId} marked as ${newStatus}!`);
      loadDashboardData();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.content.toLowerCase().includes(docSearch.toLowerCase());
    const matchesCat = docCategoryFilter === "all" || d.category === docCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === "ALL" ? true : o.status === orderStatusFilter
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">NOVA Command Center</h1>
            <p className="text-xs text-slate-400">Standalone Admin Portal</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Admin Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin passcode"
                value={loginPasscode}
                onChange={(e) => setLoginPasscode(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Default demo passcode: <code className="text-brand-400 font-mono">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-slate-800 pt-4 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs rounded-xl border border-slate-800 transition-colors"
            >
              One-Click Demo Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
                N
              </span>
              <span className="font-extrabold text-xl tracking-tight text-white">
                NOVA <span className="text-brand-500 font-semibold text-xs tracking-wider uppercase ml-1">Admin Portal</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-300 text-xs font-semibold text-slate-300 transition-colors"
            >
              Log Out
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
          <nav className="bg-slate-950 p-3 rounded-3xl border border-slate-800 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab("rag")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "rag"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Knowledge Base (RAG)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {docs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "products"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products Catalog</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "orders"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders & Payments</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {orders.length}
              </span>
            </button>
          </nav>

          {/* AI Bot Quick Status Card */}
          <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 text-xs space-y-3">
            <div className="flex items-center gap-2 text-brand-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>CRM AI Bot Status</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bot uses RAG on <strong className="text-white">{docs.length} active documents</strong> and live database queries.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Model</span>
              <span className="font-mono text-emerald-400">Llama 3 3B</span>
            </div>
          </div>
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Business Overview</h1>
                  <p className="text-xs text-slate-400 mt-1">Real-time metrics from PostgreSQL & Stripe</p>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-2">
                    ${stats?.total_revenue.toFixed(2) || "0.00"}
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">From confirmed Stripe orders</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-2">
                    {stats?.total_orders || 0}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {stats?.paid_orders || 0} Paid • {stats?.pending_orders || 0} Pending
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Active Products</span>
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-2">
                    {stats?.total_products || products.length}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {stats?.low_stock_count || 0} products low in stock (&lt;10)
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>RAG Documents</span>
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-2">
                    {stats?.total_knowledge_docs || docs.length}
                  </div>
                  <span className="text-[10px] text-purple-400 mt-1 block">Knowledge base active</span>
                </div>
              </div>

              {/* Low Stock Warning */}
              {products.filter((p) => p.stock < 10).length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-3xl p-5 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-amber-200">Inventory Alert: Low Stock Detected</h3>
                    <p className="text-xs text-amber-300/80 mt-1">
                      Some items have under 10 units left. Replenish them in the Products tab to prevent checkout stockouts.
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">No orders received yet.</p>
                ) : (
                  <div className="divide-y divide-slate-900">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">#ORD-{ord.id}</span>
                          <span className="text-slate-400 ml-2">{ord.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-200">${ord.total_amount.toFixed(2)}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === "PAID"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : ord.status === "PENDING"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KNOWLEDGE BASE (RAG) */}
          {activeTab === "rag" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>Knowledge Base (RAG)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-900 text-brand-300 font-semibold">
                      AI Powered
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage FAQs, return rules, and policies. The AI bot retrieves these to answer customer questions accurately.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 shadow-sm">
                    {isUploadingFile ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-brand-400" />
                    )}
                    <span>{isUploadingFile ? "Uploading File..." : "Upload Document File"}</span>
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv,.doc,.docx"
                      onChange={handleDirectFileUpload}
                      disabled={isUploadingFile}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleOpenDocModal()}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write Document</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search documents by title or keywords..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Category:</span>
                  <select
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="policy">Policy / Rules</option>
                    <option value="shipping">Shipping</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="warranty">Warranty</option>
                    <option value="faq">FAQ</option>
                    <option value="company">Company Info</option>
                  </select>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-950 rounded-3xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-white line-clamp-1">{doc.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md uppercase font-extrabold bg-slate-900 border border-slate-800 text-brand-400">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                        {doc.content}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                      <span>Doc ID: #{doc.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDocModal(doc)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                          title="Edit Document"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Products Catalog</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage store inventory, prices, and catalog visibility</p>
                </div>

                <button
                  onClick={() => handleOpenProductModal()}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 uppercase text-[10px] text-slate-400 border-b border-slate-800 font-bold">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Featured</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                              <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{p.name}</span>
                              <span className="text-[11px] text-slate-500">{p.slug}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">${Number(p.price).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock > 10
                                  ? "bg-emerald-950 text-emerald-400"
                                  : p.stock > 0
                                  ? "bg-amber-950 text-amber-400"
                                  : "bg-red-950 text-red-400"
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {p.is_featured ? (
                              <span className="text-brand-400 font-semibold text-[11px]">Yes</span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">No</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Orders & Stripe Payments</h1>
                  <p className="text-xs text-slate-400 mt-1">Review customer transactions and update fulfillment status</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 uppercase text-[10px] text-slate-400 border-b border-slate-800 font-bold">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Change Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">#ORD-{ord.id}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-200 block">{ord.customer_email}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(ord.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] text-slate-400">
                              {ord.items?.map((it) => `${it.product_name} (×${it.quantity})`).join(", ") || "No items"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">${ord.total_amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === "PAID"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : ord.status === "PENDING"
                                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={ord.status}
                              disabled={updatingOrderId === ord.id}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                              className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Knowledge Base Document (Add / Edit) */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingDocId ? "Edit Knowledge Document" : "Add Document to AI Knowledge Base"}
              </h3>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Want to load a local file directly?</span>
              <label className="cursor-pointer text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 transition-colors">
                <FileUp className="w-3.5 h-3.5" />
                <span>Import from File</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleImportFileIntoForm}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-Day Return Policy"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="policy">Policy / Rules</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="returns">Returns & Refunds</option>
                  <option value="warranty">Warranty</option>
                  <option value="faq">FAQ</option>
                  <option value="company">Company Info</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write or paste the exact policy, guideline, or company facts..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
                >
                  {savingDoc && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save to Knowledge Base</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Product (Add / Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">
                {editingProductId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Monitor Headphones"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="199.99"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Image URL (Unsplash or direct image)</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Product features and overview..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={prodFeatured}
                  onChange={(e) => setProdFeatured(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="featuredCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Feature on Homepage Hero & Collection
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProd}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
                >
                  {savingProd && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

