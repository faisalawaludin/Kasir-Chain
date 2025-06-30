export const idlFactory = ({ IDL }) => {
  const CategoryData = IDL.Record({
    'id' : IDL.Text,
    'icon' : IDL.Text,
    'name' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const OrderStatus = IDL.Variant({
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'completed' : IDL.Null,
    'processing' : IDL.Null,
  });
  const Time = IDL.Int;
  const ProductSubCategory = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'additionalPrice' : IDL.Nat,
  });
  const SubCategory = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'additionalPrice' : IDL.Nat,
  });
  const ProductData = IDL.Record({
    'id' : IDL.Text,
    'categoryId' : IDL.Text,
    'status' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'subCategories' : IDL.Vec(SubCategory),
    'image' : IDL.Text,
    'price' : IDL.Nat,
  });
  const CartItem = IDL.Record({
    'customerNote' : IDL.Opt(IDL.Text),
    'selectedSubCategory' : IDL.Opt(ProductSubCategory),
    'orderId' : IDL.Opt(IDL.Text),
    'quantity' : IDL.Nat,
    'product' : ProductData,
  });
  const OrderData = IDL.Record({
    'id' : IDL.Text,
    'tax' : IDL.Nat,
    'status' : OrderStatus,
    'completedAt' : IDL.Opt(Time),
    'cryptoToken' : IDL.Opt(IDL.Text),
    'total' : IDL.Nat,
    'paymentMethod' : IDL.Opt(IDL.Text),
    'createdAt' : Time,
    'discount' : IDL.Nat,
    'items' : IDL.Vec(CartItem),
    'subtotal' : IDL.Nat,
  });
  const VoucherData = IDL.Record({
    'id' : IDL.Text,
    'expiryDate' : IDL.Text,
    'code' : IDL.Text,
    'description' : IDL.Text,
    'isActive' : IDL.Bool,
    'discount' : IDL.Nat,
  });
  const Result_4 = IDL.Variant({ 'ok' : CategoryData, 'err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'ok' : OrderData, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : ProductData, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : VoucherData, 'err' : IDL.Text });
  return IDL.Service({
    'addCategory' : IDL.Func([CategoryData], [Result], []),
    'addOrder' : IDL.Func([OrderData], [Result], []),
    'addProduct' : IDL.Func([ProductData], [Result], []),
    'addVoucher' : IDL.Func([VoucherData], [Result], []),
    'deleteCategory' : IDL.Func([IDL.Text], [Result], []),
    'deleteOrder' : IDL.Func([IDL.Text], [Result], []),
    'deleteProduct' : IDL.Func([IDL.Text], [Result], []),
    'deleteVoucher' : IDL.Func([IDL.Text], [Result], []),
    'getCategory' : IDL.Func([IDL.Text], [Result_4], ['query']),
    'getOrder' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'getProduct' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'getVoucher' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'listCategories' : IDL.Func([], [IDL.Vec(CategoryData)], ['query']),
    'listOrders' : IDL.Func([], [IDL.Vec(OrderData)], ['query']),
    'listProducts' : IDL.Func([], [IDL.Vec(ProductData)], ['query']),
    'listProductsAI' : IDL.Func([], [IDL.Text], []),
    'listVouchers' : IDL.Func([], [IDL.Vec(VoucherData)], ['query']),
    'updateCategory' : IDL.Func([CategoryData], [Result], []),
    'updateOrder' : IDL.Func([OrderData], [Result], []),
    'updateProduct' : IDL.Func([ProductData], [Result], []),
    'updateVoucher' : IDL.Func([VoucherData], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
