import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CrmChatBot from "@/components/CrmChatBot";

export const metadata: Metadata = {
  title: "NOVA | Minimalist E-Commerce Experience",
  description: "High-performance modern e-commerce storefront powered by Next.js, FastAPI, PostgreSQL, and Stripe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <CrmChatBot />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

