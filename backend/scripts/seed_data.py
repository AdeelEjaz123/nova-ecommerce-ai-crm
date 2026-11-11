import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

import asyncio
import logging
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.models.product import Category, Product
from app.models.crm_doc import KnowledgeDocument

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

KNOWLEDGE_DOCS_DATA = [
    {
        "title": "Shipping & Delivery Policy",
        "category": "shipping",
        "content": (
            "NOVA provides free standard shipping on all orders over $100 worldwide. "
            "Domestic orders within the United States are delivered in 2 to 4 business days via FedEx or UPS Express. "
            "International orders are delivered in 5 to 8 business days. "
            "Once an order is shipped, customers receive an automated email with real-time GPS tracking details."
        )
    },
    {
        "title": "30-Day Return & Full Refund Guarantee",
        "category": "returns",
        "content": (
            "We offer a 30-day no-questions-asked money-back guarantee on all NOVA products. "
            "Items must be returned in their original packaging and condition. "
            "To initiate a return, contact support@novacommerce.com or click 'Request Return' in your order receipt. "
            "Once received, refunds are processed back to your original payment method via Stripe within 3-5 business days."
        )
    },
    {
        "title": "Hardware Warranty & Coverage",
        "category": "warranty",
        "content": (
            "All electronic products (AcousticPro Headphones, Studio Keyboards, Chronos Watches) come with a complimentary 2-year manufacturer warranty. "
            "This covers technical malfunctions, battery defects, and component failures. "
            "Physical accidental damage and water submersion beyond rated specifications are excluded."
        )
    },
    {
        "title": "About NOVA Commerce",
        "category": "company",
        "content": (
            "NOVA is an engineered minimalist lifestyle brand founded in 2024. "
            "We design studio-grade electronics, high-durability travel accessories, and sustainable organic apparel. "
            "Our headquarters are based in San Francisco, CA, with eco-certified manufacturing partners in Japan and Italy."
        )
    },
    {
        "title": "Customer Support & Contact Info",
        "category": "support",
        "content": (
            "Our customer care team is available 24/7. "
            "You can reach us by email at support@novacommerce.com, live chat right here in the web app, or by phone at +1 (800) 555-NOVA. "
            "For order escalations, please mention your Order ID for instant lookup."
        )
    }
]

CATEGORIES_DATA = [
    {
        "name": "Electronics",
        "slug": "electronics",
        "description": "High-end gadgets, audio equipment, and workspace essentials.",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    },
    {
        "name": "Accessories",
        "slug": "accessories",
        "description": "Everyday carry, bags, watches, and personal travel gear.",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
    },
    {
        "name": "Apparel",
        "slug": "apparel",
        "description": "Minimalist premium clothing and modern lifestyle essentials.",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"
    }
]

PRODUCTS_DATA = [
    {
        "name": "AcousticPro Wireless Headphones",
        "slug": "acousticpro-wireless-headphones",
        "description": "Premium active noise-cancelling over-ear headphones with 40-hour battery life and spatial audio immersion.",
        "price": 299.99,
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "is_featured": True,
        "category_slug": "electronics"
    },
    {
        "name": "Chronos Minimalist Watch",
        "slug": "chronos-minimalist-watch",
        "description": "Sapphire crystal glass, Japanese quartz movement, and premium Italian leather quick-release strap.",
        "price": 185.00,
        "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "is_featured": True,
        "category_slug": "accessories"
    },
    {
        "name": "Mechanical Studio Keyboard",
        "slug": "mechanical-studio-keyboard",
        "description": "Custom aluminum body, hot-swappable tactile switches, RGB backlighting, and Bluetooth multi-device pairing.",
        "price": 149.50,
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        "is_featured": True,
        "category_slug": "electronics"
    },
    {
        "name": "Commuter Waterproof Backpack",
        "slug": "commuter-waterproof-backpack",
        "description": "Durable Cordura exterior with dedicated 16-inch padded laptop compartment, luggage pass-through, and water bottle pocket.",
        "price": 119.00,
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        "is_featured": False,
        "category_slug": "accessories"
    },
    {
        "name": "Heavyweight Organic Cotton Hoodie",
        "slug": "heavyweight-organic-cotton-hoodie",
        "description": "450 GSM French terry cotton hoodie crafted with a relaxed tailored drape and pre-shrunk finish.",
        "price": 89.00,
        "stock": 50,
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        "is_featured": False,
        "category_slug": "apparel"
    },
    {
        "name": "Aero Carbon Fiber Sunglasses",
        "slug": "aero-carbon-fiber-sunglasses",
        "description": "Polarized UV400 lenses housed in ultra-lightweight carbon fiber frames for maximum clarity and endurance.",
        "price": 135.00,
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        "is_featured": True,
        "category_slug": "accessories"
    }
]

async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Check if knowledge documents already exist
        check_docs = await session.execute(select(KnowledgeDocument))
        if not check_docs.scalars().first():
            logger.info("Seeding CRM knowledge base documents...")
            for doc_data in KNOWLEDGE_DOCS_DATA:
                session.add(KnowledgeDocument(**doc_data))
            await session.commit()
            logger.info("Successfully seeded CRM Knowledge Documents!")

        # Check if products already exist
        check_prod = await session.execute(select(Product))
        if check_prod.scalars().first():
            logger.info("Products already seeded.")
            return

        logger.info("Seeding categories...")
        category_map = {}
        for cat_data in CATEGORIES_DATA:
            cat = Category(**cat_data)
            session.add(cat)
            category_map[cat.slug] = cat
        
        await session.flush()

        logger.info("Seeding products...")
        for prod_data in PRODUCTS_DATA:
            cat_slug = prod_data.pop("category_slug")
            cat = category_map[cat_slug]
            product = Product(**prod_data, category_id=cat.id)
            session.add(product)

        await session.commit()
        logger.info("Successfully seeded categories and products!")

if __name__ == "__main__":
    asyncio.run(seed())

