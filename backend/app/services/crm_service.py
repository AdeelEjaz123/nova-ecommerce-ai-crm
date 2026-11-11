import re
import os
import logging
import httpx
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.models.crm_doc import KnowledgeDocument
from app.models.product import Product
from app.models.order import Order
from app.schemas.crm import ChatMessage

logger = logging.getLogger("crm_service")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

def calculate_text_relevance(query: str, text: str) -> float:
    """Computes a token overlap similarity score between query and document text."""
    query_tokens = set(re.findall(r"\w+", query.lower()))
    text_tokens = set(re.findall(r"\w+", text.lower()))
    if not query_tokens or not text_tokens:
        return 0.0
    common = query_tokens.intersection(text_tokens)
    return len(common) / (len(query_tokens) ** 0.5)

async def retrieve_knowledge_docs(db: AsyncSession, query: str, limit: int = 3) -> List[Tuple[KnowledgeDocument, float]]:
    """Retrieves the most relevant knowledge base policy/FAQ documents for a query."""
    result = await db.execute(select(KnowledgeDocument))
    all_docs = result.scalars().all()
    
    scored_docs = []
    for doc in all_docs:
        score = calculate_text_relevance(query, f"{doc.title} {doc.category} {doc.content}")
        if score > 0:
            scored_docs.append((doc, score))
    
    # Sort by relevance score descending
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    return scored_docs[:limit]

async def retrieve_database_context(db: AsyncSession, query: str) -> Dict[str, Any]:
    """Retrieves relevant live database records (products, orders) matching the user's inquiry."""
    context = {"products": [], "order": None}
    query_lower = query.lower()

    # 1. Check for Order Lookup (e.g., "order #1", "order 2", "order id 3")
    order_id_match = re.search(r"order\s*(?:#|id|number)?\s*(\d+)", query_lower)
    if order_id_match:
        order_id = int(order_id_match.group(1))
        order_res = await db.execute(select(Order).where(Order.id == order_id))
        order = order_res.scalar_one_or_none()
        if order:
            context["order"] = {
                "id": order.id,
                "status": order.status.value,
                "total": float(order.total_amount),
                "email": order.customer_email,
                "created_at": order.created_at.strftime("%Y-%m-%d %H:%M")
            }

    # 2. Check for Product queries
    prod_res = await db.execute(select(Product))
    all_products = prod_res.scalars().all()

    matched_products = []
    is_general_catalog_query = any(w in query_lower for w in ["what do you sell", "catalog", "products", "items", "recommend", "best", "collection", "all"])

    for p in all_products:
        score = calculate_text_relevance(query, f"{p.name} {p.description}")
        if score > 0 or is_general_catalog_query:
            matched_products.append({
                "id": p.id,
                "name": p.name,
                "price": float(p.price),
                "stock": p.stock,
                "description": p.description,
                "score": score
            })

    matched_products.sort(key=lambda x: x["score"], reverse=True)
    context["products"] = matched_products[:4]

    # Detect if user is searching for a product that does not exist in catalog
    product_inquiry_patterns = [
        r"\bdo you (?:have|sell|carry|offer)\b",
        r"\blooking for\b",
        r"\bhow much (?:is|are|for)\b",
        r"\bprice of\b",
        r"\bcan i (?:buy|get|order)\b",
        r"\bwhere can i find\b",
        r"\bany\b.*\b(?:in stock|available)\b"
    ]
    is_asking_for_product = any(re.search(pat, query_lower) for pat in product_inquiry_patterns)
    if is_asking_for_product and not matched_products:
        context["product_not_found"] = True

    return context

SYSTEM_INSTRUCTION = (
    "You are NOVA's friendly and knowledgeable e-commerce AI assistant. "
    "Guidelines: "
    "1. Answer ONLY what the customer is asking directly, specifically, and concisely in a natural conversational tone. "
    "2. Do NOT copy-paste the whole document or dump unrelated sections. "
    "3. Highlight exact numbers, dollar amounts, days, and rules relevant to the inquiry."
)

async def generate_with_ollama(prompt: str, history: List[ChatMessage]) -> str | None:
    """Attempts to generate a response using local Ollama running Llama 3.2 3B."""
    try:
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        for msg in history[-4:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("message", {}).get("content", "").strip()
    except Exception as e:
        logger.debug(f"Ollama local connection not available: {e}")
    return None

async def generate_with_groq(prompt: str, history: List[ChatMessage]) -> str | None:
    """Attempts to generate a response using Groq cloud API for Llama-3.2-3B."""
    if not GROQ_API_KEY:
        return None
    try:
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        for msg in history[-4:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.2-3b-preview",
                    "messages": messages,
                    "temperature": 0.3
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.debug(f"Groq API connection not available: {e}")
    return None

def extract_specific_answer_from_doc(query: str, doc_content: str) -> str:
    """
    Parses document into distinct sections or paragraphs,
    and returns ONLY the specific answer addressing the user query.
    """
    # Remove metadata headers and sample question footers
    cleaned_content = re.split(r"(?i)#+\s*.*sample questions", doc_content)[0]

    # Split into sections by markdown headers (##), numbered rules (1., 2.), or paragraph dividers
    raw_sections = re.split(r"(?:\n\s*---\s*\n|\n(?=##\s+)|\n(?=\d+\.\s+[A-Z]))", cleaned_content)
    sections = [s.strip() for s in raw_sections if len(s.strip()) > 30]

    if not sections:
        # Fallback to double line break splitting
        sections = [p.strip() for p in cleaned_content.split("\n\n") if len(p.strip()) > 30]

    if not sections:
        return doc_content[:350]

    # Score each section against the user query
    query_tokens = set(re.findall(r"\w+", query.lower()))
    scored_sections = []
    for sec in sections:
        sec_tokens = set(re.findall(r"\w+", sec.lower()))
        overlap = len(query_tokens.intersection(sec_tokens))
        score = overlap / (len(sec_tokens) ** 0.35 + 1)
        scored_sections.append((sec, score))

    scored_sections.sort(key=lambda x: x[1], reverse=True)
    best_section, _ = scored_sections[0]

    # Clean markdown headers for a natural conversational answer
    clean_section = re.sub(r"^#{1,4}\s*\d*\.?\s*", "", best_section).strip()
    return clean_section

def generate_smart_rag_fallback(
    query: str,
    rag_docs: List[Tuple[KnowledgeDocument, float]],
    db_context: Dict[str, Any]
) -> str:
    """
    Synthesizes a direct, natural, and specific answer addressing ONLY what
    was asked, avoiding bulk document dumping.
    """
    # 1. Answer Order lookup
    if db_context.get("order"):
        ord_info = db_context["order"]
        return (
            f"📦 **Order #{ord_info['id']} Details**:\n\n"
            f"• **Status:** `{ord_info['status']}`\n"
            f"• **Total Amount:** ${ord_info['total']:.2f}\n"
            f"• **Customer Email:** {ord_info['email']}\n"
            f"• **Placed On:** {ord_info['created_at']}\n\n"
            f"If you need any changes or tracking assistance, please let me know!"
        )

    # 2. Answer Product catalog query (product not found)
    if db_context.get("product_not_found"):
        return (
            "We currently do not carry that item in our store catalog.\n\n"
            "Our collection focuses on premium studio audio & electronics (like our AcousticPro wireless headphones & mechanical keyboards), everyday accessories (Chronos watches, commuter backpacks, carbon sunglasses), and minimalist organic apparel.\n\n"
            "Feel free to ask if you would like recommendations from our available products!"
        )

    # 3. Answer Product catalog query (matching products found)
    if db_context.get("products") and len(db_context["products"]) > 0:
        lines = ["Here are the specific items from our live catalog:"]
        for p in db_context["products"]:
            stock_str = f"{p['stock']} in stock" if p['stock'] > 0 else "Out of Stock"
            lines.append(f"• **{p['name']}** — **${p['price']:.2f}** ({stock_str})\n  {p['description']}")
        return "\n\n".join(lines)

    # 4. Answer from RAG Knowledge Documents (Extract ONLY the specific relevant section)
    if rag_docs:
        top_doc, _ = rag_docs[0]
        specific_answer = extract_specific_answer_from_doc(query, top_doc.content)

        return (
            f"{specific_answer}\n\n"
            f"_(Reference: {top_doc.title})_"
        )

    # 4. Default helpful response
    return (
        "Hello! I can help you with product details, pricing, live inventory, order tracking, and store policies.\n\n"
        "Feel free to ask a specific question like *'What is your return policy?'*, *'How much is the mechanical keyboard?'*, or *'Where is my order?'*."
    )

async def process_crm_chat(
    db: AsyncSession,
    user_message: str,
    history: List[ChatMessage]
) -> Dict[str, Any]:
    """
    Main RAG pipeline:
    1. Retrieves relevant policy/doc chunks.
    2. Queries live database for matching products or orders.
    3. Prompts Llama 3.2 3B (via Ollama or Groq), or falls back to Smart RAG synthesis.
    """
    # Step 1: Retrieve RAG Knowledge docs
    rag_docs = await retrieve_knowledge_docs(db, user_message, limit=2)
    sources = [doc.title for doc, _ in rag_docs]

    # Step 2: Retrieve Live DB Context
    db_context = await retrieve_database_context(db, user_message)

    # Step 3: Build rich Augmented Prompt
    rag_text = "\n\n".join([f"Document [{doc.title}]:\n{doc.content}" for doc, _ in rag_docs])
    db_text = ""
    if db_context.get("order"):
        db_text += f"\nOrder Lookup Result: {db_context['order']}"
    if db_context.get("products"):
        db_text += f"\nRelevant Products: {db_context['products']}"
    if db_context.get("product_not_found"):
        db_text += "\nProduct Search Status: The customer asked for a product that is NOT in the store database. Politely inform them that NOVA does not carry this item, mention our main collections (electronics, accessories, apparel), and offer to assist with available items."

    augmented_prompt = (
        f"Customer Question: {user_message}\n\n"
        f"--- KNOWLEDGE BASE CONTEXT ---\n{rag_text if rag_text else 'No specific policy documents retrieved.'}\n\n"
        f"--- STORE DATABASE CONTEXT ---\n{db_text if db_text else 'No specific DB matches.'}\n\n"
        f"Instructions: Provide a natural, concise, and specific answer addressing ONLY what was asked. "
        f"Mention relevant numbers, dollars, or timeline from the context. Do not dump other unrelated sections."
    )

    # Step 4: Try Llama 3.2 3B via Groq API or Ollama Local
    reply = await generate_with_groq(augmented_prompt, history)
    if not reply:
        reply = await generate_with_ollama(augmented_prompt, history)
    if not reply:
        reply = generate_smart_rag_fallback(user_message, rag_docs, db_context)

    # Step 5: Suggested follow-up chips
    suggested = [
        "What headphones do you sell?",
        "What is your return policy?",
        "Is shipping free?",
        "Check status of order #1"
    ]

    return {
        "reply": reply,
        "sources": sources,
        "suggested_questions": suggested
    }

