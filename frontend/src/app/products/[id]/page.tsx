"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Plus, Minus, ShieldCheck, Truck, RotateCcw, Loader2 } from "lucide-react";
import { fetchProductByIdOrSlug } from "@/lib/api";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const { addItem, openCart } = useCart();

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);

    fetchProductByIdOrSlug(idOrSlug)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setLoading(false);
      });
  }, [idOrSlug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    openCart();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 mb-3" />
        <p className="text-xs font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested product could not be located.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-slate-900 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Image Showcase */}
        <div className="relative aspect-square w-full rounded-3xl bg-slate-100 overflow-hidden border border-slate-100 shadow-md">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="flex flex-col space-y-6">
          <div>
            {product.category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wider mb-3">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-extrabold text-slate-900">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">USD (Taxes calculated at Stripe checkout)</span>
            </div>
          </div>

          <div className="prose prose-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-6">
            <p>{product.description}</p>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-xs font-semibold text-slate-700">
              {product.stock > 0 ? `In Stock (${product.stock} units available)` : "Out of Stock"}
            </span>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                  added
                    ? "bg-brand-600 text-white"
                    : product.stock > 0
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center"
            >
              Instant Checkout with Stripe
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Truck className="w-5 h-5 text-slate-700 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 block">Fast Delivery</span>
              <span className="text-[10px] text-slate-400">2-4 business days</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <RotateCcw className="w-5 h-5 text-slate-700 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 block">Easy Returns</span>
              <span className="text-[10px] text-slate-400">30 days money-back</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-slate-700 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 block">Stripe Protected</span>
              <span className="text-[10px] text-slate-400">256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

