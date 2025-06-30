import { backend } from "../../../declarations/backend";
import type { VoucherData } from "../../../declarations/backend/backend.did";
import { toast } from "sonner";

// Error handler
const handleError = (err: any, message = "Terjadi kesalahan") => {
  console.error(message, err);
  toast.error(`${message}: ${err}`);
};

// Ambil semua voucher
export const listVouchers = async (): Promise<VoucherData[]> => {
  try {
    const result = await backend.listVouchers();
    return result;
  } catch (err) {
    handleError(err, "Gagal mengambil daftar voucher");
    return [];
  }
};

// Tambah voucher
export const addVoucher = async (voucher: VoucherData): Promise<boolean> => {
  try {
    const result = await backend.addVoucher(voucher);
    if ("ok" in result) {
      toast.success("Voucher berhasil ditambahkan");
      return true;
    } else {
      handleError(result.err, "Gagal menambah voucher");
      return false;
    }
  } catch (err) {
    handleError(err, "Gagal menambah voucher");
    return false;
  }
};

// Ambil voucher
export const getVoucher = async (id: string): Promise<VoucherData | null> => {
  try {
    const result = await backend.getVoucher(id);
    if ("ok" in result) return result.ok;
    handleError(result.err, "Voucher tidak ditemukan");
    return null;
  } catch (err) {
    handleError(err, "Gagal mengambil voucher");
    return null;
  }
};

// Update voucher
export const updateVoucher = async (voucher: VoucherData): Promise<boolean> => {
  try {
    const result = await backend.updateVoucher(voucher);
    if ("ok" in result) {
      toast.success("Voucher berhasil diperbarui");
      return true;
    } else {
      handleError(result.err, "Gagal memperbarui voucher");
      return false;
    }
  } catch (err) {
    handleError(err, "Gagal memperbarui voucher");
    return false;
  }
};

// Hapus voucher
export const deleteVoucher = async (id: string): Promise<boolean> => {
  try {
    const result = await backend.deleteVoucher(id);
    if ("ok" in result) {
      toast.success("Voucher berhasil dihapus");
      return true;
    } else {
      handleError(result.err, "Gagal menghapus voucher");
      return false;
    }
  } catch (err) {
    handleError(err, "Gagal menghapus voucher");
    return false;
  }
};
