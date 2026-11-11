"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createCheckoutSession } from "@/lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerEmail || !customerEmail.includes("@")) {
      setErrorMessage("Please provide a valid email address for your Stripe receipt.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const payload = {
        customer_email: customerEmail,
        customer_name: customerName.trim() || undefined,
        items: items.map((itm) => ({
          product_id: itm.product.id,
          quantity: itm.quantity,
        })),
      };

      const { checkout_url } = await createCheckoutSession(payload);
      window.location.href = checkout_url;
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setErrorMessage(err.message || "Failed to start Stripe checkout.");
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Looks like you haven't added anything to your cart yet. Discover our curated catalog.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
        Shopping Bag ({totalItems} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.product.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6">
                <div className="relative w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      ${Number(item.product.price).toFixed(2)} each
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-base font-extrabold text-slate-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-8 pt-4 flex items-center justify-between">
            <Link
              href="/products"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right: Order Summary & Checkout Form */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="text-slate-400 text-xs">Calculated at Stripe</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 text-base font-extrabold text-slate-900">
            <span>Total</span>
            <span className="text-xl">${subtotal.toFixed(2)}</span>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 mt-2">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Stripe Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Encrypted 256-bit Stripe Checkout</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

