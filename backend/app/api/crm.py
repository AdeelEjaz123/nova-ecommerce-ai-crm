from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import os

from app.core.database import get_db
from app.models.crm_doc import KnowledgeDocument
from app.schemas.crm import ChatRequest, ChatResponse, KnowledgeDocCreate, KnowledgeDocUpdate, KnowledgeDocRead
from app.services.crm_service import process_crm_chat

router = APIRouter(prefix="/crm", tags=["CRM AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    User sends a query to the CRM AI bot.
    The bot performs RAG over admin-provided knowledge documents and store database
    (products, stock, orders) to formulate an accurate response.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    result = await process_crm_chat(
        db=db,
        user_message=request.message.strip(),
        history=request.history
    )
    return ChatResponse(**result)

@router.get("/documents", response_model=List[KnowledgeDocRead])
async def list_knowledge_documents(db: AsyncSession = Depends(get_db)):
    """Fetch all knowledge base documents currently available for RAG."""
    result = await db.execute(select(KnowledgeDocument).order_by(KnowledgeDocument.id.desc()))
    return result.scalars().all()

@router.post("/documents", response_model=KnowledgeDocRead)
async def create_knowledge_document(
    doc: KnowledgeDocCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Admin endpoint to upload or add custom policy/FAQ documents
    which the AI bot immediately learns and uses for RAG.
    """
    new_doc = KnowledgeDocument(
        title=doc.title,
        content=doc.content,
        category=doc.category
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    return new_doc

@router.post("/documents/upload", response_model=KnowledgeDocRead)
async def upload_knowledge_document_file(
    file: UploadFile = File(...),
    category: str = Form("policy"),
    title: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin endpoint to upload a document file (.txt, .md, .json) directly.
    Extracts text and indexes it in the RAG Knowledge Base.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read file content
    try:
        raw_bytes = await file.read()
        try:
            content = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            content = raw_bytes.decode("latin-1", errors="replace")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Infer title if not given
    if not title or not title.strip():
        base_name = os.path.splitext(file.filename)[0]
        title = base_name.replace("_", " ").replace("-", " ").title()

    new_doc = KnowledgeDocument(
        title=title.strip(),
        category=category.strip(),
        content=content.strip()
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    return new_doc

@router.put("/documents/{doc_id}", response_model=KnowledgeDocRead)
async def update_knowledge_document(
    doc_id: int,
    payload: KnowledgeDocUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to update an existing knowledge document."""
    doc = await db.get(KnowledgeDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.title is not None:
        doc.title = payload.title.strip()
    if payload.content is not None:
        doc.content = payload.content.strip()
    if payload.category is not None:
        doc.category = payload.category.strip()

    await db.commit()
    await db.refresh(doc)
    return doc

@router.delete("/documents/{doc_id}")
async def delete_knowledge_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to delete a knowledge document from the RAG store."""
    doc = await db.get(KnowledgeDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return {"status": "deleted", "id": doc_id}

