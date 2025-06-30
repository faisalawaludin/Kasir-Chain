import { backend } from "../../../declarations/backend";
import type { OrderData } from "../../../declarations/backend/backend.did";
import { toast } from "sonner";

// Tambahkan error handler standar
const handleError = (err: any, message = "Terjadi kesalahan") => {
  console.error(message, err);
  toast.error(`${message}: ${err}`);
};

// Tambah order
export const addOrder = async (order: OrderData): Promise<boolean> => {
  try {
    const result = await backend.addOrder(order);
    if ("ok" in result) {
      toast.success("Order berhasil ditambahkan");
      return true;
    } else {
      handleError(result.err, "Gagal menambah order");
      return false;
    }
  } catch (err) {
    handleError(err, "Gagal menambah order");
    return false;
  }
};

// Ambil detail order
export const getOrder = async (id: string): Promise<OrderData | null> => {
  try {
    const result = await backend.getOrder(id);
    if ("ok" in result) {
      return result.ok;
    } else {
      handleError(result.err, "Gagal mengambil order");
      return null;
    }
  } catch (err) {
    handleError(err, "Gagal mengambil order");
    return null;
  }
};

// Update order
export const updateOrder = async (order: OrderData): Promise<boolean> => {
  try {
    const result = await backend.updateOrder(order);
    if ("ok" in result) {
      toast.success("Order berhasil diperbarui");
      return true;
    } else {
      handleError(result.err, "Gagal memperbarui order");
      return false;
    }
  } catch (err) {
    handleError(err, "Gagal memperbarui order");
    return false;
  }
};

// Hapus order
export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const result = await backend.deleteOrder(id);
    if ("ok" in result) {
      toast.success("Order berhasil dihapus");
      return true;
    } else {
      handleError(result.err, "Gagal menghapus order");
      return false;
    }
  } catch (err) {
    handleError(err, "Gagal menghapus order");
    return false;
  }
};

// Ambil semua order
export const listOrders = async (): Promise<OrderData[]> => {
  try {
    const result = await backend.listOrders();
    return result;
  } catch (err) {
    handleError(err, "Gagal mengambil daftar order");
    return [];
  }
};
