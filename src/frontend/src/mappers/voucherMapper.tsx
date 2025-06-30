
import type { VoucherData } from "../../../declarations/backend/backend.did";

// Define voucher interface
interface Voucher {
  id: string;
  code: string;
  discount: number;
  expiryDate: string;
  description: string;
  isActive: boolean;
}

export const mapVoucherToData = (voucher: Voucher): VoucherData => ({
  id: voucher.id,
  code: voucher.code,
  discount: BigInt(voucher.discount),
  expiryDate: voucher.expiryDate,
  description: voucher.description,
  isActive: voucher.isActive,
});

export const mapDataToVoucher = (data: VoucherData): Voucher => ({
  id: data.id,
  code: data.code,
  discount: Number(data.discount),
  expiryDate: data.expiryDate,
  description: data.description,
  isActive: data.isActive,
});

