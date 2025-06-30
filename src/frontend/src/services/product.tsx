import { backend } from "../../../declarations/backend/index";
import type { ProductData } from "../../../declarations/backend/backend.did";
import { toast } from "sonner";

// Ambil semua produk
export const loadProducts = async (): Promise<ProductData[]> => {
  try {
    const result = await backend.listProducts();
    return result;
  } catch (err) {
    console.error("Gagal mengambil produk:", err);
    toast.error("Gagal memuat produk");
    return [];
  }
};

// Tambah produk
export const createProduct = async (product: ProductData): Promise<boolean> => {
  try {
    const result = await backend.addProduct(product);
    if ("ok" in result) {
      //toast.success("Produk berhasil ditambahkan!");
      return true;
    } else {
      toast.error(`Gagal menambah produk: ${result.err}`);
      return false;
    }
  } catch (err) {
    toast.error("Gagal koneksi ke canister");
    return false;
  }
};

// Ambil satu produk by ID
export const getProduct = async (id: string): Promise<ProductData | null> => {
  try {
    const result = await backend.getProduct(id);
    if ("ok" in result) {
      return result.ok;
    } else {
      toast.error(`Produk tidak ditemukan: ${result.err}`);
      return null;
    }
  } catch (err) {
    toast.error("Gagal mengambil produk");
    return null;
  }
};

// Update produk
export const updateProduct = async (product: ProductData): Promise<boolean> => {
  try {
    const result = await backend.updateProduct(product);
    if ("ok" in result) {
      //toast.success("Produk berhasil diperbarui!");
      return true;
    } else {
      toast.error(`Gagal update produk: ${result.err}`);
      return false;
    }
  } catch (err) {
    toast.error("Gagal koneksi saat update");
    return false;
  }
};

// Hapus produk
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const result = await backend.deleteProduct(id);
    if ("ok" in result) {
      toast.success("Produk berhasil dihapus");
      return true;
    } else {
      toast.error(`Gagal hapus produk: ${result.err}`);
      return false;
    }
  } catch (err) {
    toast.error("Koneksi error saat hapus");
    return false;
  }
};
