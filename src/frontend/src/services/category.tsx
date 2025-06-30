import { backend } from "../../../declarations/backend";
import type { CategoryData } from "../../../declarations/backend/backend.did";
import { toast } from "sonner";

// Ambil semua kategori
export const loadCategories = async (): Promise<CategoryData[]> => {
  try {
    const result = await backend.listCategories();
    return result;
  } catch (err) {
    console.error("Gagal mengambil kategori:", err);
    toast.error("Gagal memuat kategori");
    return [];
  }
};

// Tambah kategori
export const createCategory = async (
  category: CategoryData
): Promise<boolean> => {
  try {
    const result = await backend.addCategory(category);
    if ("ok" in result) {
      toast.success("Kategori berhasil ditambahkan!");
      return true;
    } else {
      toast.error(`Gagal menambah kategori: ${result.err}`);
      return false;
    }
  } catch (err) {
    toast.error("Gagal koneksi ke canister");
    return false;
  }
};

// Ambil satu kategori
export const getCategory = async (
  id: string
): Promise<CategoryData | null> => {
  try {
    const result = await backend.getCategory(id);
    if ("ok" in result) {
      return result.ok;
    } else {
      toast.error(`Kategori tidak ditemukan: ${result.err}`);
      return null;
    }
  } catch (err) {
    toast.error("Gagal mengambil kategori");
    return null;
  }
};

// Update kategori
export const updateCategory = async (
  category: CategoryData
): Promise<boolean> => {
  try {
    const result = await backend.updateCategory(category);
    if ("ok" in result) {
      toast.success("Kategori berhasil diperbarui!");
      return true;
    } else {
      toast.error(`Gagal update kategori: ${result.err}`);
      return false;
    }
  } catch (err) {
    toast.error("Gagal koneksi saat update");
    return false;
  }
};

// Hapus kategori
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const result = await backend.deleteCategory(id);
    if ("ok" in result) {
      toast.success("Kategori berhasil dihapus");
      return true;
    } else {
      toast.error(`Gagal hapus kategori: ${result.err}`);
      return false;
    }
  } catch (err) {
    toast.error("Koneksi error saat hapus kategori");
    return false;
  }
};
