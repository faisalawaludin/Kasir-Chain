import type {
  Order,
  CartItem,
  Product,
  ProductSubCategory,
} from "@/types/pos";

import type {
  OrderData,
  CartItem as CartItemData,
  ProductData,
  ProductSubCategory as ProductSubCategoryData,
  OrderStatus,
} from "../../../declarations/backend/backend.did";

export const mapSubCategory = (
  sub: ProductSubCategory
): ProductSubCategoryData => ({
  id: sub.id,
  name: sub.name,
  additionalPrice: BigInt(sub.additionalPrice),
});

export const mapProduct = (product: Product): ProductData => ({
  id: product.id,
  name: product.name,
  price: BigInt(product.price),
  image: product.image,
  categoryId: product.categoryId,
  description: product.description,
  status: product.status, 
  subCategories: product.subCategories?.map(mapSubCategory) ?? [],
});

export const mapCartItemToCartItemData = (item: CartItem): CartItemData => ({
  product: mapProduct(item.product),
  quantity: BigInt(item.quantity),
  selectedSubCategory: item.selectedSubCategory
    ? [mapSubCategory(item.selectedSubCategory)]
    : [],
  customerNote: item.customerNote ? [item.customerNote] : [],
  orderId: item.orderId ? [item.orderId] : [],

});

export const mapOrderStatus = (status: string): OrderStatus => {
  switch (status) {
    case "pending":
      return { pending: null };
    case "processing":
      return { processing: null };
    case "completed":
      return { completed: null };
    case "cancelled":
      return { cancelled: null };
    default:
      return { pending: null }; // default fallback
  }
};
export const mapOrderToOrderData = (order: Order): OrderData => ({
  id: order.id,
  items: order.items.map(mapCartItemToCartItemData),
  status: mapOrderStatus(order.status),
  total: BigInt(Math.round(order.total)),
  subtotal: BigInt(Math.round(order.subtotal)),
  discount: BigInt(Math.round(order.discount)),
  tax: BigInt(Math.round(order.tax)),
  createdAt: BigInt(order.createdAt.getTime()),
  completedAt: order.completedAt
    ? [BigInt(order.completedAt.getTime())]
    : [],
  paymentMethod: order.paymentMethod ? [order.paymentMethod] : [],
  cryptoToken: order.cryptoToken ? [order.cryptoToken] : [],
});


export const mapOrderStatusFromBackend = (status: OrderStatus): Order["status"] => {
  if ("pending" in status) return "pending";
  if ("processing" in status) return "processing";
  if ("completed" in status) return "completed";
  if ("cancelled" in status) return "cancelled";
  return "pending"; // fallback default
};

const allowedProductStatus = ["available", "out_of_stock", "coming_soon"] as const;

type ProductStatus = (typeof allowedProductStatus)[number];

export const mapProductStatus = (status: string): ProductStatus => {
  if (allowedProductStatus.includes(status as ProductStatus)) {
    return status as ProductStatus;
  }
  return "available"; // fallback jika status tidak valid
};

export const mapCartItemDataToCartItem = (data: CartItemData): CartItem => ({
  product: {
    id: data.product.id,
    name: data.product.name,
    price: Number(data.product.price),
    image: data.product.image,
    description: data.product.description,
    categoryId: data.product.categoryId,
    status: mapProductStatus(data.product.status),
    subCategories: data.product.subCategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      additionalPrice: Number(sub.additionalPrice),
    })),
  },
  quantity: Number(data.quantity),
  selectedSubCategory:
    data.selectedSubCategory.length > 0
      ? {
          id: data.selectedSubCategory[0].id,
          name: data.selectedSubCategory[0].name,
          additionalPrice: Number(data.selectedSubCategory[0].additionalPrice),
        }
      : undefined,
  customerNote: data.customerNote?.[0],
  orderId: data.orderId?.[0],
});

export const mapOrderDataToOrder = (data: OrderData): Order => ({
  id: data.id,
  items: data.items.map(mapCartItemDataToCartItem),
  status: mapOrderStatusFromBackend(data.status),
  total: Number(data.total),
  subtotal: Number(data.subtotal),
  discount: Number(data.discount),
  tax: Number(data.tax),
  createdAt: new Date(Number(data.createdAt)),
  completedAt:
    data.completedAt.length > 0 ? new Date(Number(data.completedAt[0])) : undefined,
  paymentMethod: data.paymentMethod.length > 0 ? data.paymentMethod[0] : undefined,
  cryptoToken: data.cryptoToken.length > 0 ? data.cryptoToken[0] : undefined,
});
