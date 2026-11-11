from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
import math

from app.core.database import get_db
from app.models.product import Product, Category
from app.schemas.product import ProductRead, ProductCreate, ProductUpdate, ProductListResponse, CategoryRead

router = APIRouter(tags=["Products & Categories"])

@router.get("/categories", response_model=List[CategoryRead])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Fetch all product categories."""
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()

@router.get("/products", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    category_slug: Optional[str] = Query(None, description="Filter by category slug"),
    search: Optional[str] = Query(None, description="Search term in name or description"),
    featured_only: Optional[bool] = Query(None, description="Filter only featured products"),
    db: AsyncSession = Depends(get_db)
):
    """List products with filtering, search, and pagination."""
    query = select(Product).options(selectinload(Product.category))

    if category_slug:
        query = query.join(Category).where(Category.slug == category_slug)

    if featured_only is not None:
        query = query.where(Product.is_featured == featured_only)

    if search:
        search_fmt = f"%{search.strip().lower()}%"
        query = query.where(
            func.lower(Product.name).like(search_fmt) | 
            func.lower(Product.description).like(search_fmt)
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Pagination
    offset = (page - 1) * limit
    paginated_query = query.order_by(Product.id.desc()).offset(offset).limit(limit)
    items_result = await db.execute(paginated_query)
    items = items_result.scalars().all()

    pages = math.ceil(total / limit) if total > 0 else 1

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.get("/products/{id_or_slug}", response_model=ProductRead)
async def get_product(id_or_slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a single product by either ID or slug."""
    query = select(Product).options(selectinload(Product.category))
    
    if id_or_slug.isdigit():
        query = query.where(Product.id == int(id_or_slug))
    else:
        query = query.where(Product.slug == id_or_slug)

    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.post("/products", response_model=ProductRead)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    """Admin endpoint to create a new product."""
    # Check slug uniqueness
    existing = await db.execute(select(Product).where(Product.slug == payload.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A product with this slug already exists.")

    new_product = Product(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        price=payload.price,
        stock=payload.stock,
        image_url=payload.image_url,
        is_featured=payload.is_featured,
        category_id=payload.category_id
    )
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    # Reload with category relationship
    result = await db.execute(select(Product).options(selectinload(Product.category)).where(Product.id == new_product.id))
    return result.scalar_one()

@router.put("/products/{product_id}", response_model=ProductRead)
async def update_product(product_id: int, payload: ProductUpdate, db: AsyncSession = Depends(get_db)):
    """Admin endpoint to update product details, price, or stock."""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, val)

    await db.commit()
    result = await db.execute(select(Product).options(selectinload(Product.category)).where(Product.id == product_id))
    return result.scalar_one()

@router.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Admin endpoint to delete a product."""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()
    return {"status": "deleted", "id": product_id}

