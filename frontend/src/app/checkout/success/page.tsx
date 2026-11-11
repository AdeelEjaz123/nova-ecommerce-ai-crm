"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Package, Clock, ShieldCheck, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { fetchOrderBySession } from "@/lib/api";
import { Order } from "@/lib/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear cart upon successful payment
  useEffect(() => {
    clearCart();
  }, []);

  // Fetch verified order details from backend
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetchOrderBySession(sessionId)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Order load error:", err);
        setLoading(false);
      });
  }, [sessionId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 sm:p-12 text-center">
        {/* Animated Success Badge */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          We have received your payment via Stripe. A detailed receipt and shipment tracking details have been sent to your email.
        </p>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-slate-900 mb-2" />
            <span className="text-xs">Fetching order receipt...</span>
          </div>
        ) : order ? (
          <div className="mt-8 text-left bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Order Number</span>
                <span className="text-sm font-bold text-slate-900">#ORD-{order.id}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Status</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-medium">
                    {item.product_name} <span className="text-slate-400">× {item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between font-bold text-sm">
              <span className="text-slate-900">Total Paid</span>
              <span className="text-base text-slate-900">${order.total_amount.toFixed(2)} USD</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
            Order Reference: <span className="font-semibold">{sessionId || orderId || "Processed"}</span>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/products"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-24">Loading receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

