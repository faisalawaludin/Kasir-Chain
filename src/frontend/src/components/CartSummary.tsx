import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useQueue } from "@/context/QueueContext";
import { formatCurrency } from "@/lib/formatters";
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, X, Ticket, Clock } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import type { Order, CartItem } from "@/types/pos";
import { listVouchers } from "@/services/voucher"; 
import { mapVoucherToData,mapDataToVoucher } from "@/mappers/voucherMapper";


import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


import { addOrder } from "@/services/order";
import { mapOrderToOrderData } from "@/mappers/orderMapper"; 

// Define payment method types
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'e-wallet' | 'web3';

// Define crypto token interface
interface CryptoToken {
  id: string;
  name: string;
  symbol: string;
  icon: React.ReactNode;
  decimals: number;
}

// Define payment option interface
interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
}

// Define voucher interface
interface Voucher {
  id: string;
  code: string;
  discount: number;
  expiryDate: string;
  description: string;
  isActive: boolean;
}

// Available crypto tokens for Web3 payment
const cryptoTokens: CryptoToken[] = [
  {
    id: 'ckBTC',
    name: 'ckBTC',
    symbol: 'ckBTC',
    icon: <span className="text-orange-500">₿</span>,
    decimals: 8
  },
  {
    id: 'ckUSDC',
    name: 'ckUSDC',
    symbol: 'ckUSDC',
    icon: <span className="text-blue-500">$</span>,
    decimals: 6
  },
  {
    id: 'ICP',
    name: 'Internet Computer',
    symbol: 'ICP',
    icon: <span className="text-purple-500">⎔</span>,
    decimals: 8
  },
  {
    id: 'ckETH',
    name: 'ckETH',
    symbol: 'ckETH',
    icon: <span className="text-gray-500">Ξ</span>,
    decimals: 18
  },
];

// Generate unique order ID
const generateOrderId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getAvailableVouchers = async (): Promise<Voucher[]> => {
  try {
    const result = await listVouchers(); // hasil: VoucherData[]
    return result
      .map(mapDataToVoucher)
      .filter(v => v.isActive && new Date(v.expiryDate) > new Date());
  } catch (error) {
    console.error("Gagal mengambil voucher dari canister:", error);
    return [];
  }
};

export function CartSummary() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getSubTotal,
    getTax,
    getTotal,
    clearCart
  } = useCart();

  const { getCurrentQueueItems } = useQueue();
  const currentQueue = getCurrentQueueItems();

  const isMobile = useIsMobile();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [orderNumber] = useState(generateOrderId());
  const [selectedToken, setSelectedToken] = useState<CryptoToken | null>(null);
  const [showTokenSelector, setShowTokenSelector] = useState(false);

  const paymentOptions: PaymentOption[] = [
    { id: 'cash', name: 'Cash', icon: <span className="text-green-500 text-xl">💵</span> },
    { id: 'credit_card', name: 'Credit Card', icon: <CreditCard className="text-blue-500" /> },
    { id: 'debit_card', name: 'Debit Card', icon: <span className="text-pos-blue text-xl">💳</span> },
    { id: 'e-wallet', name: 'E-Wallet', icon: <span className="text-pos-orange text-xl">📱</span> },
    { id: 'web3', name: 'Web3', icon: <span className="text-purple-500 text-xl">⎔</span> },
  ];

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsCheckoutOpen(true);
  };

  const applyVoucher = async () => {
    const availableVouchers = await getAvailableVouchers();
    const foundVoucher = availableVouchers.find(
      (v) => v.code.toLowerCase() === voucherCode.toLowerCase()
    );

    if (foundVoucher) {
      setActiveVoucher(foundVoucher);
      toast.success(`Voucher ${foundVoucher.code} applied! ${foundVoucher.discount}% discount`);
    } else {
      toast.error("Invalid or expired voucher code");
    }
  };

  const removeVoucher = () => {
    setActiveVoucher(null);
    setVoucherCode("");
    toast.info("Voucher removed");
  };

  const getDiscountAmount = () => {
    if (!activeVoucher) return 0;
    return (getSubTotal() * activeVoucher.discount) / 100;
  };

  const getFinalTotal = () => {
    const discountAmount = getDiscountAmount();
    return getTotal() - discountAmount;
  };

  const handleTokenSelect = (token: CryptoToken) => {
    setSelectedToken(token);
    setShowTokenSelector(false);
    toast.info(`Selected ${token.name} for payment`);
  };

  const processPayment = async () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }

    if (selectedPayment === 'web3' && !selectedToken) {
      toast.error("Please select a crypto token for Web3 payment");
      return;
    }

    const discountAmount = getDiscountAmount();
    const subtotal = getSubTotal();

    const newOrder: Order = {
      id: orderNumber,
      createdAt: new Date(),
      completedAt: null,
      status: "pending",
      items: [...items],
      subtotal,
      total: activeVoucher ? getFinalTotal() : getTotal(),
      tax: getTax(),
      discount: discountAmount,
      paymentMethod: selectedPayment,
      cryptoToken: selectedToken?.symbol, 
    };

    const mappedOrder = mapOrderToOrderData(newOrder);

    const success = await addOrder(mappedOrder);

    if (success) {
      const paymentMethodName = selectedPayment === 'web3'
        ? `Web3 (${selectedToken?.symbol})`
        : paymentOptions.find(p => p.id === selectedPayment)?.name;

      toast.success(`Order ${orderNumber} placed successfully using ${paymentMethodName}`);
      toast.info(`Your order has been sent to pending orders. Please wait for confirmation.`);

      setIsCheckoutOpen(false);
      clearCart();
      setSelectedPayment(null);
      setActiveVoucher(null);
      setVoucherCode("");
      setSelectedToken(null);
    }
  };

  const handleIncreaseQuantity = (productId: string, subCategoryId?: string) => {
    increaseQuantity(productId, subCategoryId);
  };

  const handleDecreaseQuantity = (productId: string, subCategoryId?: string) => {
    decreaseQuantity(productId, subCategoryId);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-semibold flex items-center">
            <div className="bg-pos-primary/10 p-2 rounded-full mr-2">
              <ShoppingCart className="h-5 w-5 text-pos-primary" />
            </div>
            Keranjang
          </h2>

          {/* Queue Status Badge */}
          <div className="flex items-center bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded">
            <Clock className="h-3 w-3 mr-1" />
            <span>Antrian: {currentQueue.length}</span>
          </div>
        </div>

        {/* Rest of cart content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>Keranjang Anda kosong</p>
            </div>
          ) : (


            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {items.map((item, index) => (
                <div key={`${item.product.id}-${item.selectedSubCategory?.id || 'default'}-${index}`} className="cart-item animate-slide-in flex gap-3 p-2 border border-gray-100 rounded-lg">
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.product.name}</h3>
                    {item.selectedSubCategory && (
                      <p className="text-xs text-gray-500">
                        {item.selectedSubCategory.name}
                        {item.selectedSubCategory.additionalPrice > 0 && (
                          <span className="text-pos-primary ml-1">
                            (+{formatCurrency(item.selectedSubCategory.additionalPrice)})
                          </span>
                        )}
                      </p>
                    )}
                    {item.customerNote && (
                      <p className="text-xs italic text-gray-500 mt-1">
                        Note: {item.customerNote}
                      </p>
                    )}
                    <p className="text-pos-primary font-semibold text-sm">
                      {formatCurrency(
                        item.product.price + (item.selectedSubCategory?.additionalPrice || 0)
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDecreaseQuantity(item.product.id, item.selectedSubCategory?.id)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleIncreaseQuantity(item.product.id, item.selectedSubCategory?.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeFromCart(item.product.id, item.selectedSubCategory?.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Only show summary if there are items */}
          {items.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(getSubTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pajak (10%)</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <div className="font-semibold">
                    <span>Total</span>
                    <div className="text-pos-primary">{formatCurrency(getTotal())}</div>
                  </div>
                  {/* Checkout button next to total */}
                  <Button
                    className="bg-pos-primary hover:bg-pos-primary/90 transition-colors"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Selesaikan Pesanan Anda</DialogTitle>
            <DialogDescription className="text-center">
              Order #{orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4">
            <div className="grid gap-6">
              {/* Order Information */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-amber-800 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-600" />
                    Informasi Pesanan
                  </h3>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
                    #{orderNumber}
                  </span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500">Ringkasan Pesanan</h3>

                <div className="border rounded-lg p-3 bg-gray-50 max-h-[200px] overflow-y-auto">
                  {/* Cart Items with Images */}
                  <div className="space-y-3 mb-3">
                    {items.map((item, index) => (
                      <div key={`summary-${item.product.id}-${item.selectedSubCategory?.id || 'default'}-${index}`} className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product.name}</p>
                          {item.selectedSubCategory && (
                            <p className="text-xs text-gray-500">
                              {item.selectedSubCategory.name}
                            </p>
                          )}
                          {item.customerNote && (
                            <p className="text-xs italic text-gray-500">
                              Note: {item.customerNote}
                            </p>
                          )}
                          <div className="flex justify-between text-xs">
                            <span>
                              {formatCurrency(item.product.price + (item.selectedSubCategory?.additionalPrice || 0))} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              {formatCurrency((item.product.price + (item.selectedSubCategory?.additionalPrice || 0)) * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items ({items.reduce((total, item) => total + item.quantity, 0)})</span>
                      <span>{formatCurrency(getSubTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pajak (10%)</span>
                      <span>{formatCurrency(getTax())}</span>
                    </div>

                    {/* Discount display if voucher is applied */}
                    {activeVoucher && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center">
                          <Ticket className="h-3 w-3 mr-1" />
                          Diskon ({activeVoucher.discount}%)
                        </span>
                        <span>-{formatCurrency(getDiscountAmount())}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-pos-primary">
                        {formatCurrency(activeVoucher ? getFinalTotal() : getTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voucher Section */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-gray-500">Gunakan Voucher</h3>

                {activeVoucher ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 mr-2 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{activeVoucher.code}</p>
                        <p className="text-xs text-green-700">Diskon {activeVoucher.discount}% diterapkan</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 h-8"
                      onClick={removeVoucher}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Masukkan kode voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={applyVoucher}
                      className="bg-pos-primary hover:bg-pos-primary/90"
                      disabled={!voucherCode}
                    >
                      Gunakan
                    </Button>
                  </div>
                )}

              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500">Pilih Metode Pembayaran</h3>

                {/* Wrapper utama dengan height yang dinamis */}
                <div className="flex flex-col" style={{ maxHeight: "calc(100vh - 300px)" }}>
                  {/* Container payment options dengan scroll */}
                  <div className="flex-1 overflow-y-auto pr-2 mb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {paymentOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`flex flex-col items-center justify-center p-2 sm:p-3 border rounded-lg transition-all min-h-[80px] ${selectedPayment === option.id
                            ? "border-pos-primary bg-pos-primary/5 ring-1 ring-pos-primary"
                            : "border-gray-200 hover:bg-gray-50"
                            }`}
                          onClick={() => {
                            setSelectedPayment(option.id);
                            if (option.id !== "web3") {
                              setSelectedToken(null);
                            }
                          }}
                        >
                          <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-lg sm:text-xl mb-1">
                            {option.icon}
                          </div>
                          <span className="font-medium text-xs sm:text-sm text-center">
                            {option.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crypto Token Selector - ditempatkan di bawah dengan spacing yang tepat */}
                  {selectedPayment === "web3" && (
                    <div className="flex-shrink-0 border-t pt-3 space-y-2">
                      <button
                        onClick={() => setShowTokenSelector(!showTokenSelector)}
                        className={`w-full p-2 sm:p-3 border rounded-lg flex items-center justify-between ${selectedToken
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <div className="flex items-center truncate">
                          {selectedToken ? (
                            <>
                              <div className="mr-2 flex-shrink-0">{selectedToken.icon}</div>
                              <span className="truncate text-sm">
                                {selectedToken.name} ({selectedToken.symbol})
                              </span>
                            </>
                          ) : (
                            <span className="text-sm">Select a token</span>
                          )}
                        </div>
                        <span className="text-gray-500 ml-2 text-sm">
                          {showTokenSelector ? "🡳" : "🡱"}
                        </span>
                      </button>

                      {showTokenSelector && (
                        <div className="border rounded-lg bg-white shadow-lg">
                          <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "calc(100vh - 450px)" }}
                          >
                            {cryptoTokens.map((token) => (
                              <button
                                key={token.id}
                                className={`w-full p-2 sm:p-3 rounded-lg flex items-center gap-2 hover:bg-gray-50 ${selectedToken?.id === token.id ? "bg-blue-50" : ""
                                  }`}
                                onClick={() => handleTokenSelect(token)}
                              >
                                <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                                  {token.icon}
                                </div>
                                <div className="text-left min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {token.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {token.symbol}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedToken && (
                        <div className="text-xs sm:text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                          <p>You'll pay with {selectedToken.symbol}</p>
                          <p className="text-xs">Conversion rate will be applied at checkout</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Batal
              </Button>
            </DialogClose>
            <Button
              className="bg-pos-primary hover:bg-pos-primary/90 transition-colors"
              onClick={processPayment}
              disabled={!selectedPayment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Bayar {formatCurrency(activeVoucher ? getFinalTotal() : getTotal())}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
