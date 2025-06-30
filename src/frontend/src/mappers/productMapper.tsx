import type { Product, ProductSubCategory } from "@/types/pos";
import type { ProductData, SubCategory } from "../../../declarations/backend/backend.did";

const allowedStatuses = ["available", "out_of_stock", "coming_soon"] as const;

export const mapProductDataToProduct = (data: ProductData): Product => {
  const status = allowedStatuses.includes(data.status as any)
    ? (data.status as Product["status"])
    : "available"; 

  return {
    id: data.id,
    name: data.name,
    price: Number(data.price),
    image: data.image,
    categoryId: data.categoryId,
    description: data.description,
    status,
    subCategories: data.subCategories.map((sub: SubCategory): ProductSubCategory => ({
      id: sub.id,
      name: sub.name,
      additionalPrice: Number(sub.additionalPrice),
    })),
  };
};


export const mapProductToProductData = (product: Product): ProductData => {
  return {
    id: product.id,
    name: product.name,
    price: BigInt(product.price),
    image: product.image,
    categoryId: product.categoryId,
    description: product.description,
    status: product.status,
    subCategories: product.subCategories.map((sub): SubCategory => ({
      id: sub.id,
      name: sub.name,
      additionalPrice: BigInt(sub.additionalPrice),
    })),
  };
};