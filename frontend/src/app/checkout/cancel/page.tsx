"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";

function CancelContent() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Checkout Cancelled
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          No charges were made
        </h1>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          You cancelled the checkout process. Your items are still safely saved in your shopping cart whenever you are ready to continue.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
          <Link
            href="/cart"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="text-center py-24">Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}

