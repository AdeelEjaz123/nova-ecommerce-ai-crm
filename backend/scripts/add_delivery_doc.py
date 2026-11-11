import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

import asyncio
from app.core.database import AsyncSessionLocal
from app.models.crm_doc import KnowledgeDocument
from sqlalchemy import select

async def add_delivery_doc():
    async with AsyncSessionLocal() as session:
        check = await session.execute(
            select(KnowledgeDocument).where(KnowledgeDocument.title == "Delivery Issues, Delays & Resolution Guidelines")
        )
        if check.scalars().first():
            print("Document already present in CRM Knowledge Base.")
            return

        doc_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "DELIVERY_ISSUES_POLICY.md")
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()

        doc = KnowledgeDocument(
            title="Delivery Issues, Delays & Resolution Guidelines",
            category="shipping",
            content=content
        )
        session.add(doc)
        await session.commit()
        print("Successfully synchronized Delivery Issues document to CRM Knowledge Base!")

if __name__ == "__main__":
    asyncio.run(add_delivery_doc())

