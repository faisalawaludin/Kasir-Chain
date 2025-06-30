// mappers/categoryMapper.ts
import type { Category } from "@/types/pos";
import type { CategoryData } from "../../../declarations/backend/backend.did";

export const mapCategoryDataToCategory = (data: CategoryData): Category => ({
  id: data.id,
  name: data.name,
  icon: data.icon,
});

export const mapCategoryToCategoryData = (cat: Category): CategoryData => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
});
