# NOVA Commerce — Production Full-Stack E-Commerce & RAG AI CRM Platform

<div align="center">

![Next.js 15](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python 3.11+](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)
![Llama 3](https://img.shields.io/badge/Llama%203-0467DF?style=for-the-badge&logo=meta&logoColor=white)

**An enterprise-grade, modern e-commerce storefront with Stripe payments, an isolated Admin Operations Portal, and a live Database-Integrated RAG AI Customer Agent.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Admin Portal](#-admin-portal) • [AI CRM Bot](#-rag-powered-ai-crm-engine) • [API Documentation](#-api-endpoints)

</div>

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Next.js 15 App Router & React 18:** Server & Client components optimized for performance and SEO.
- **Persistent Shopping Cart:** Client-side cart state with slide-out drawer, live badge count, and quantity controls persisted in `localStorage`.
- **Dynamic Catalog:** Real-time search, category filters, and sorting by price or popularity.
- **Stripe Checkout Integration:** End-to-end checkout with hosted payment sessions and customized success/cancellation receipt views.
- **Zero Admin Pollution:** Strict boundary separation—the customer storefront contains zero admin controls, badges, or privileged links.

### 🤖 RAG-Powered AI CRM Bot
- **Hybrid Retrieval System:** Automatically distinguishes between transactional database queries (order status, live stock, product pricing) and unstructured policy questions (returns, shipping delays, warranties).
- **Precision Section Extraction:** Ranks and extracts only the exact policy clause answering the user query—eliminating overwhelming document dumps.
- **Out-of-Catalog Handling:** Politely alerts shoppers when an item is unavailable and intelligently suggests matching items from active store categories.
- **Multi-Backend LLM Inference:** Seamless integration with local Ollama (`llama3.2:3b`), Groq Cloud API, or built-in Smart Synthesis fallback.

### 📊 Standalone Admin Portal (`/admin`)
- **Passcode Protected:** Gated access (`admin123` or 1-Click Demo Login) strictly separated from the public store.
- **Business KPI Metrics:** Real-time overview of gross revenue, active orders, catalog inventory, and indexed RAG documents.
- **Products Catalog CRUD:** Create, update prices/inventory, and delete products with immediate storefront reflection.
- **Order Fulfillment Tracker:** Monitor incoming customer purchases and update statuses (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Knowledge Base Manager:** Upload store policies, resolution guidelines, or FAQs directly via file upload (`.txt`, `.md`, `.csv`, `.json`) or rich text editor.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 Frontend                  │
│   Storefront (Port 3000)   │    Admin Portal (/admin)  │
└────────────────────────────┼───────────────────────────┘
                             │ REST API (JSON)
┌────────────────────────────▼───────────────────────────┐
│                     FastAPI Backend                    │
│                     (Port 8000)                        │
├────────────────────────────┬───────────────────────────┤
│    Catalog & Order APIs    │     RAG CRM AI Service    │
│    Stripe Webhook Engine   │     Hybrid Query Router   │
└──────────────┬─────────────┴─────────────┬─────────────┘
               │                           │
     ┌─────────▼─────────┐        ┌────────▼────────┐
     │  SQLAlchemy Async │        │  Knowledge Base │
     │  PostgreSQL / DB  │        │  Vector/BM25 &  │
     │  (or SQLite fallback)      │  Llama 3 Engine │
     └───────────────────┘        └─────────────────┘
```

---

## 📂 Project Structure

```text
ecommerce/
├── docker-compose.yml          # PostgreSQL 16 container definition
├── DELIVERY_ISSUES_POLICY.md   # Seed store delivery & delays resolution policy
├── README.md                   # Project documentation
├── start_all.bat               # 1-Click startup for both Backend & Frontend
├── stop_all.bat                # 1-Click shutdown for all services
├── start_admin.bat             # 1-Click launcher opening directly to /admin
├── stop_admin.bat              # Clean shutdown for Admin & servers
│
├── backend/                    # FastAPI High-Performance Backend
│   ├── app/
│   │   ├── api/                # API Endpoints (products, orders, checkout, crm, admin)
│   │   ├── core/               # App configuration & async DB connection
│   │   ├── models/             # SQLAlchemy 2.0 Models (Product, Category, Order, KnowledgeDoc)
│   │   ├── schemas/            # Pydantic v2 validation models
│   │   ├── services/           # Stripe service & Hybrid RAG CRM service
│   │   └── main.py             # FastAPI entrypoint with CORS & auto-migrations
│   ├── scripts/
│   │   └── seed_data.py        # Database seeder (sample products, categories, RAG docs)
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   └── .env                    # Local environment config
│
└── frontend/                   # Next.js 15 Tailwind Storefront
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx        # High-converting Storefront homepage
    │   │   ├── products/       # Catalog & individual product details
    │   │   ├── cart/           # Full-page shopping cart
    │   │   ├── checkout/       # Stripe success/cancel callback handlers
    │   │   └── admin/          # Standalone Admin Portal (/admin)
    │   ├── components/         # CrmChatBot, Navbar, ProductCard, CartDrawer, Footer
    │   ├── context/            # CartContext (persisted in localStorage)
    │   └── lib/                # API client & TypeScript interfaces
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.mjs
```

---

## 🚀 Quick Start

### ⚡ 1-Click Windows Launchers
If you are on Windows, you can launch the entire stack with a single click:
- **`start_all.bat`**: Starts FastAPI backend, Next.js frontend, and launches the store in your browser.
- **`start_admin.bat`**: Ensures both servers are active and launches directly into the Admin Portal (`http://localhost:3000/admin`).
- **`stop_all.bat`**: Kills all running instances on ports 8000 and 3000 cleanly.

---

### Manual Setup

#### 1. Backend Setup (FastAPI & Python 3.11+)

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   *Note: Zero-config SQLite fallback is enabled by default. To use PostgreSQL, run `docker compose up -d` and set `DATABASE_URL` in `.env`.*
5. Seed initial catalog & RAG policies:
   ```bash
   python -m scripts.seed_data
   ```
6. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - OpenAPI Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Healthcheck: [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### 2. Frontend Setup (Next.js 15)

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 RAG-Powered AI CRM Engine

The built-in customer service bot combines transactional database awareness with unstructured policy documents:

```text
User Question ───► Query Intent Router
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[Database Query]            [RAG Policy Search]
- Order tracking by ID      - Delay compensation rules
- Product price & stock     - Return / replacement terms
- Category inventory        - International customs
         │                           │
         └─────────────┬─────────────┘
                       ▼
          Precision Section Extractor
          (Extracts specific clause)
                       ▼
          LLM Synthesis (Llama 3 / Fallback)
                       ▼
          Targeted Customer Answer + Sources
```

### Supported LLM Providers:
1. **Local Ollama:** Automatically detected at `http://localhost:11434` (e.g., `ollama run llama3.2:3b`).
2. **Groq Cloud:** Set `GROQ_API_KEY="gsk_..."` in `backend/.env` for ultra-fast cloud inference.
3. **Smart Synthesis Fallback:** Built-in semantic parser ensures the bot answers accurately even with zero external API keys!

---

## 🔒 Admin Portal

Access URL: **[http://localhost:3000/admin](http://localhost:3000/admin)**  
Default Passcode: **`admin123`** (or click *One-Click Demo Login*)

- **Overview:** Real-time revenue analytics, order counts, and inventory health.
- **Knowledge Base:** Upload `.txt`, `.md`, `.json`, or `.csv` policy files. The RAG engine indexes them immediately with zero downtime.
- **Product Management:** Add new items, adjust stock counts, update pricing, or delete obsolete SKUs.
- **Order Fulfillment:** Change order statuses from `PENDING` to `PAID`, `SHIPPED`, or `DELIVERED`.

---

## 💳 Stripe Checkout & Webhook Integration

### Development Testing (Zero Keys Required)
The system is pre-configured with mock test handling. Checking out redirects smoothly to the order confirmation page with verified items and reference tracking.

### Connecting Live Stripe Test Mode
1. Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
2. Set `STRIPE_SECRET_KEY` in `backend/.env`.
3. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `frontend/.env.local`.
4. Forward webhooks locally using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:8000/api/webhooks/stripe
   ```
   Add the printed signing secret (`whsec_...`) to `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend healthcheck |
| `GET` | `/api/products` | List catalog products (filters: category, search, sorting) |
| `POST` | `/api/products` | Create new product (Admin) |
| `PUT` | `/api/products/{id}` | Update product details or stock (Admin) |
| `DELETE` | `/api/products/{id}` | Delete product (Admin) |
| `POST` | `/api/checkout/create-session` | Create Stripe checkout session |
| `GET` | `/api/orders/{id}` | Lookup order status and items |
| `PATCH` | `/api/orders/{id}/status` | Update fulfillment status (Admin) |
| `POST` | `/api/crm/chat` | Send question to RAG CRM agent |
| `GET` | `/api/crm/documents` | List knowledge documents (Admin) |
| `POST` | `/api/crm/documents/upload` | Upload document file (`.md`, `.txt`, `.csv`, `.json`) |
| `GET` | `/api/admin/stats` | Retrieve platform KPI overview (Admin) |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
