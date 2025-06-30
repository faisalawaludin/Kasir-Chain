
import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Clock, CreditCard, Printer, Tag } from "lucide-react";
import { Order, CartItem } from "@/types/pos";
import { CountdownTimer } from "./CountdownTimer";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminOrderDetailProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onAddToQueue: (orderId: string, items: CartItem[]) => void;
}

export function AdminOrderDetail({ order, open, onClose, onUpdateStatus, onAddToQueue }: AdminOrderDetailProps) {
  const [processingAction, setProcessingAction] = useState(false);
  const isMobile = useIsMobile();

  const handleAddToQueue = () => {
    setProcessingAction(true);

    // Add a brief delay to simulate processing
    setTimeout(() => {
      onAddToQueue(order.id, order.items);
      onUpdateStatus(order.id, "processing");
      setProcessingAction(false);
    }, 500);
  };

  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    if (!method) return "Unknown";

    const formattedMethod = method.replace("_", " ");
    return formattedMethod.charAt(0).toUpperCase() + formattedMethod.slice(1);
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for the print window
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .order-info {
              margin-bottom: 20px;
              padding: 10px;
              border-bottom: 1px dashed #ccc;
            }
            .item {
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .variant {
              font-size: 14px;
              color: #666;
              margin-left: 20px;
            }
            .note {
              font-style: italic;
              font-size: 14px;
              color: #666;
              margin-left: 20px;
            }
            .total {
              margin-top: 20px;
              font-weight: bold;
              text-align: right;
            }
            .subtotal-section {
              border-top: 1px dashed #ccc;
              padding-top: 10px;
              margin-top: 10px;
            }
            .flex {
              display: flex;
              justify-content: space-between;
            }
            .discount {
              color: #e53e3e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ORDER RECEIPT</h2>
          </div>
          
          <div class="order-info">
            <h3>Order #${order.id}</h3>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
            ${order.paymentMethod ? `<p>Payment: ${formatPaymentMethod(order.paymentMethod)}</p>` : ''}
          </div>
          
          <div>
            <h3>Items:</h3>
            ${order.items.map(item => `
              <div class="item">
                <div class="flex">
                  <span>${item.quantity}x ${item.product.name}</span>
                  <span>${formatCurrency((item.product.price + (item.selectedSubCategory?.additionalPrice || 0)) * item.quantity)}</span>
                </div>
                ${item.selectedSubCategory ? `<div class="variant">Variant: ${item.selectedSubCategory.name}</div>` : ''}
                ${item.customerNote ? `<div class="note">Note: ${item.customerNote}</div>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="subtotal-section">
            <div class="flex">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.subtotal)}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="flex">
              <span>Discount:</span>
              <span class="discount">-${formatCurrency(order.discount)}</span>
            </div>` : ''}
            <div class="flex">
              <span>Tax:</span>
              <span>${formatCurrency(order.tax)}</span>
            </div>
            <div class="total flex">
              <span>Total:</span>
              <span>${formatCurrency(order.total)}</span>
            </div>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window and print it
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Slight delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // Uncomment if you want to auto-close after print dialog
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] w-full p-3 h-[90vh] overflow-auto' : 'sm:max-w-[550px]'}`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Order Details #{order.id}
          </DialogTitle>
          <DialogDescription>
            View and manage order details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Order status badge */}
          <div className={`px-4 py-3 rounded-lg ${order.status === "completed"
              ? "bg-green-50 text-green-800"
              : order.status === "processing"
                ? "bg-blue-50 text-blue-800"
                : "bg-amber-50 text-amber-800"
            }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center">
                {order.status === "completed" ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <Clock className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium capitalize">{order.status}</span>
              </div>

              {/* Show payment method if available */}
              {order.paymentMethod && (
                <div className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-1" />
                  <span>{formatPaymentMethod(order.paymentMethod)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order items */}
          <div className="space-y-2">
            <h3 className="font-medium">Order Items:</h3>
            <div className="border rounded-lg divide-y overflow-hidden">
              {order.items.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="flex p-3 bg-gray-50">
                  <div className="w-12 h-12 rounded overflow-hidden mr-3">
                    <img
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <span className="text-gray-600">x{item.quantity}</span>
                    </div>

                    {/* Show variant info if available */}
                    {item.selectedSubCategory && (
                      <p className="text-sm text-gray-600">
                        Variant: {item.selectedSubCategory.name}
                        {item.selectedSubCategory.additionalPrice > 0 && (
                          <span className="text-pos-primary">
                            {" "}(+{formatCurrency(item.selectedSubCategory.additionalPrice)})
                          </span>
                        )}
                      </p>
                    )}

                    {/* Show customer note if available */}
                    {item.customerNote && (
                      <p className="text-sm italic text-gray-500 mt-1 bg-gray-100 p-1 rounded">
                        Note: {item.customerNote}
                      </p>
                    )}

                    <div className="mt-1 text-sm font-medium text-pos-primary">
                      {formatCurrency((item.product.price + (item.selectedSubCategory?.additionalPrice || 0)) * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {/* Display discount if available */}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center text-red-600">
                  <Tag className="w-3.5 h-3.5 mr-1" />
                  <span>Discount</span>
                </div>
                <span className="text-red-600">-{formatCurrency(order.discount)}</span>
              </div>
            )}

            {/* Display tax */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>

            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-pos-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Order actions */}
          {order.status === "pending" && (
            <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-2 pt-2 border-t`}>
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                disabled={processingAction}
                className={isMobile ? 'w-full' : ''}
              >
                Cancel Order
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={processingAction}
                className={`bg-gray-100 hover:bg-gray-200 ${isMobile ? 'w-full' : ''}`}
              >
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
              <Button
                className={`bg-pos-primary hover:bg-pos-primary/90 ${isMobile ? 'w-full' : ''}`}
                onClick={handleAddToQueue}
                disabled={processingAction}
              >
                {processingAction ? "Processing..." : "Accept & Add to Queue"}
              </Button>
            </div>
          )}
          {order.status === "processing" && (
            <div className={`${isMobile ? 'flex flex-col' : 'flex justify-between'} items-center gap-2 pt-2 border-t`}>
              <div>
                <p className="text-sm text-gray-600">Estimated waiting time:</p>
                <CountdownTimer initialTime={600} size="lg" />
              </div>
              <div className={`flex gap-2 ${isMobile ? 'mt-3 w-full' : ''}`}>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className={`bg-gray-100 hover:bg-gray-200 ${isMobile ? 'flex-1' : ''}`}
                >
                  <Printer className="w-4 h-4 mr-1" /> Print
                </Button>
                <Button
                  className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'flex-1' : ''}`}
                  onClick={() => onUpdateStatus(order.id, "completed")}
                >
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
          {order.status === "completed" && (
            <div className={`flex ${isMobile ? 'w-full' : 'justify-end'} pt-2 border-t`}>
              <Button
                variant="outline"
                onClick={handlePrint}
                className={`bg-gray-100 hover:bg-gray-200 ${isMobile ? 'w-full' : ''}`}
              >
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
