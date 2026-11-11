import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-24 border-t border-slate-900">
      {/* Trust Badges */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-slate-900 rounded-xl text-brand-500">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Free Global Shipping</h4>
                <p className="text-xs text-slate-500 mt-0.5">On all orders over $100</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-slate-900 rounded-xl text-brand-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Stripe Secure Checkout</h4>
                <p className="text-xs text-slate-500 mt-0.5">256-bit SSL encrypted payments</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-slate-900 rounded-xl text-brand-500">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">30-Day Free Returns</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hassle-free guarantee</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-slate-900 rounded-xl text-brand-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">24/7 Dedicated Care</h4>
                <p className="text-xs text-slate-500 mt-0.5">Expert customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <span className="font-extrabold text-2xl tracking-tight text-white">
              NOVA<span className="text-brand-500">.</span>
            </span>
            <p className="text-sm text-slate-400 mt-3 max-w-sm leading-relaxed">
              Engineered minimalism. High-performance gear designed for creators, thinkers, and explorers.
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Shop</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">Catalog</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link href="/products?category=apparel" className="hover:text-white transition-colors">Apparel</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Support</h5>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-white cursor-pointer transition-colors">Order Tracking</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Shipping Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Returns & Refunds</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Help Center</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Company</h5>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-white cursor-pointer transition-colors">Our Story</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Sustainability</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NOVA Commerce. Powered by Next.js, FastAPI & Stripe.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span>Powered by Stripe Payments</span>
            <span>•</span>
            <span>FastAPI RESTful Backend</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

