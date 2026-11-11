"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300">
      {/* Product Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-slate-100 block">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-sm">
            {product.category.name}
          </div>
        )}

        {/* Featured Tag */}
        {product.is_featured && (
          <div className="absolute top-3 right-3 bg-slate-900 text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
            Featured
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-50">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-bold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm ${
              added
                ? "bg-brand-600 text-white"
                : product.stock > 0
                ? "bg-slate-900 text-white hover:bg-brand-600 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : product.stock > 0 ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            ) : (
              <span>Sold Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

