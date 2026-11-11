import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Zap, Shield, RefreshCw } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { Product } from "@/lib/types";

// Fallback products shown if backend is not running yet during first boot
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "AcousticPro Wireless Headphones",
    slug: "acousticpro-wireless-headphones",
    description: "Premium active noise-cancelling over-ear headphones with 40-hour battery life and spatial audio.",
    price: 299.99,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    is_featured: true,
    category_id: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Chronos Minimalist Watch",
    slug: "chronos-minimalist-watch",
    description: "Sapphire crystal glass, Japanese quartz movement, and premium Italian leather quick-release strap.",
    price: 185.00,
    stock: 18,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    is_featured: true,
    category_id: 2,
    category: { id: 2, name: "Accessories", slug: "accessories" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Mechanical Studio Keyboard",
    slug: "mechanical-studio-keyboard",
    description: "Custom aluminum body, hot-swappable tactile switches, and Bluetooth multi-device pairing.",
    price: 149.50,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    is_featured: true,
    category_id: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Aero Carbon Fiber Sunglasses",
    slug: "aero-carbon-fiber-sunglasses",
    description: "Polarized UV400 lenses housed in ultra-lightweight carbon fiber frames for maximum clarity.",
    price: 135.00,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    is_featured: true,
    category_id: 2,
    category: { id: 2, name: "Accessories", slug: "accessories" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function HomePage() {
  let featuredProducts: Product[] = [];

  try {
    const data = await fetchProducts({ featured_only: true, limit: 4 });
    featuredProducts = data.items.length > 0 ? data.items : FALLBACK_PRODUCTS;
  } catch (e) {
    featuredProducts = FALLBACK_PRODUCTS;
  }

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-24 sm:py-32">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen E-Commerce Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight sm:leading-none">
            Precision Gear for the Modern Minimalist.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Curated accessories, studio electronics, and tailored apparel built with uncompromising quality and clean aesthetics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-900/30 flex items-center gap-2 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products?category=electronics"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
            >
              Shop Electronics
            </Link>
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/products?category=electronics"
            className="group relative h-64 rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
          >
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
              alt="Electronics"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs uppercase tracking-wider text-brand-400 font-semibold">Category</span>
              <h3 className="text-xl font-bold text-white mt-1">Electronics & Audio</h3>
            </div>
          </Link>

          <Link
            href="/products?category=accessories"
            className="group relative h-64 rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
          >
            <Image
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
              alt="Accessories"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs uppercase tracking-wider text-brand-400 font-semibold">Category</span>
              <h3 className="text-xl font-bold text-white mt-1">Everyday Accessories</h3>
            </div>
          </Link>

          <Link
            href="/products?category=apparel"
            className="group relative h-64 rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
          >
            <Image
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"
              alt="Apparel"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs uppercase tracking-wider text-brand-400 font-semibold">Category</span>
              <h3 className="text-xl font-bold text-white mt-1">Minimalist Apparel</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Handpicked</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Products</h2>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why NOVA Banner */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-brand-600 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Fast API Architecture</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Asynchronous Python backend powered by SQLAlchemy and asyncpg for lightning-fast queries.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-brand-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Stripe Checkout</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Bank-level PCI compliance with real-time webhook order fulfillment and instant card validation.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-brand-600 mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Next.js App Router</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Server-side rendering, streaming UI, and responsive Tailwind CSS layout.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

