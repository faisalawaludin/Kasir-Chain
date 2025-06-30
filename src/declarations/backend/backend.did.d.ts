import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CartItem {
  'customerNote' : [] | [string],
  'selectedSubCategory' : [] | [ProductSubCategory],
  'orderId' : [] | [string],
  'quantity' : bigint,
  'product' : ProductData,
}
export interface CategoryData {
  'id' : string,
  'icon' : string,
  'name' : string,
}
export interface OrderData {
  'id' : string,
  'tax' : bigint,
  'status' : OrderStatus,
  'completedAt' : [] | [Time],
  'cryptoToken' : [] | [string],
  'total' : bigint,
  'paymentMethod' : [] | [string],
  'createdAt' : Time,
  'discount' : bigint,
  'items' : Array<CartItem>,
  'subtotal' : bigint,
}
export type OrderStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'completed' : null } |
  { 'processing' : null };
export interface ProductData {
  'id' : string,
  'categoryId' : string,
  'status' : string,
  'name' : string,
  'description' : string,
  'subCategories' : Array<SubCategory>,
  'image' : string,
  'price' : bigint,
}
export interface ProductSubCategory {
  'id' : string,
  'name' : string,
  'additionalPrice' : bigint,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : VoucherData } |
  { 'err' : string };
export type Result_2 = { 'ok' : ProductData } |
  { 'err' : string };
export type Result_3 = { 'ok' : OrderData } |
  { 'err' : string };
export type Result_4 = { 'ok' : CategoryData } |
  { 'err' : string };
export interface SubCategory {
  'id' : string,
  'name' : string,
  'additionalPrice' : bigint,
}
export type Time = bigint;
export interface VoucherData {
  'id' : string,
  'expiryDate' : string,
  'code' : string,
  'description' : string,
  'isActive' : boolean,
  'discount' : bigint,
}
export interface _SERVICE {
  'addCategory' : ActorMethod<[CategoryData], Result>,
  'addOrder' : ActorMethod<[OrderData], Result>,
  'addProduct' : ActorMethod<[ProductData], Result>,
  'addVoucher' : ActorMethod<[VoucherData], Result>,
  'deleteCategory' : ActorMethod<[string], Result>,
  'deleteOrder' : ActorMethod<[string], Result>,
  'deleteProduct' : ActorMethod<[string], Result>,
  'deleteVoucher' : ActorMethod<[string], Result>,
  'getCategory' : ActorMethod<[string], Result_4>,
  'getOrder' : ActorMethod<[string], Result_3>,
  'getProduct' : ActorMethod<[string], Result_2>,
  'getVoucher' : ActorMethod<[string], Result_1>,
  'listCategories' : ActorMethod<[], Array<CategoryData>>,
  'listOrders' : ActorMethod<[], Array<OrderData>>,
  'listProducts' : ActorMethod<[], Array<ProductData>>,
  'listProductsAI' : ActorMethod<[], string>,
  'listVouchers' : ActorMethod<[], Array<VoucherData>>,
  'updateCategory' : ActorMethod<[CategoryData], Result>,
  'updateOrder' : ActorMethod<[OrderData], Result>,
  'updateProduct' : ActorMethod<[ProductData], Result>,
  'updateVoucher' : ActorMethod<[VoucherData], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
