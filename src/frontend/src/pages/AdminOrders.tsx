import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Order, CartItem } from "@/types/pos";
import { toast } from "sonner";
import { Clock, Check, X, Trash2, ExternalLink, Tag } from "lucide-react";
import { AdminOrderDetail } from "@/components/AdminOrderDetail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueue } from "@/context/QueueContext";
import { motion } from "framer-motion";
import { updateOrder, listOrders, deleteOrder } from "@/services/order";
import { mapOrderToOrderData, mapOrderDataToOrder } from "@/mappers/orderMapper"; 

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const {
    addToQueue,
    updateQueueStatus,
    getCurrentQueueItems
  } = useQueue();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderDataList = await listOrders();
        const mappedOrders = orderDataList.map(mapOrderDataToOrder);
        setOrders(mappedOrders);
      } catch (err) {
        console.error("Gagal memuat orders dari backend:", err);
        toast.error("Gagal memuat orders dari canister");
      }
    };

    loadOrders();

  }, []);



  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? { ...order, status, completedAt: status === "completed" ? new Date() : order.completedAt }
        : order
    );

    setOrders(updatedOrders);

    const updatedOrder = updatedOrders.find(order => order.id === orderId);
    if (!updatedOrder) {
      toast.error("Order tidak ditemukan");
      return;
    }

    // canister ICP
    const success = await updateOrder(mapOrderToOrderData(updatedOrder));
    if (!success) {
      toast.error("Gagal menyimpan update ke canister");
      return;
    }

    if (status === "completed") {
      const queueItems = getCurrentQueueItems();
      const queueItem = queueItems.find(item =>
        item.items.some(queueItem => queueItem.orderId === orderId)
      );

      if (queueItem) {
        updateQueueStatus(queueItem.id, 'completed');
      }

      toast.success(`Order #${orderId} marked as completed`);
    } else if (status === "cancelled") {
      toast.info(`Order #${orderId} has been cancelled`);
    }

    setOrderDetailOpen(false);
  };


  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    const success = await deleteOrder(orderToDelete);
    if (success) {
      setOrders((prev) => prev.filter(order => order.id !== orderToDelete));
      toast.success("Order deleted successfully");
    } else {
      toast.error("Failed to delete order from backend");
    }

    setOrderToDelete(null);
    setDeleteDialogOpen(false);
  };


  const handleAddToQueue = (orderId: string, items: CartItem[]) => {
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId
    }));

    const queueId = addToQueue(itemsWithOrderId);
    toast.success(`Order #${orderId} added to preparation queue`);
  };


  const confirmDelete = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  // Group orders by status
  const pendingOrders = orders.filter(order => order.status === "pending");
  const processingOrders = orders.filter(order => order.status === "processing");
  const completedOrders = orders.filter(order => order.status === "completed");
  const cancelledOrders = orders.filter(order => order.status === "cancelled");

  // Function to render an individual order card
  const renderOrderCard = (order: Order) => (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg border shadow-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">#{order.id}</h3>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          {order.status === "pending" && (
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Clock className="w-3 h-3 mr-1" /> Pending
            </span>
          )}
          {order.status === "processing" && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Clock className="w-3 h-3 mr-1" /> Processing
            </span>
          )}
          {order.status === "completed" && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Check className="w-3 h-3 mr-1" /> Completed
            </span>
          )}
          {order.status === "cancelled" && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
              <X className="w-3 h-3 mr-1" /> Cancelled
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {order.items.slice(0, 2).map((item, index) => (
          <div key={index} className="flex flex-col text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span>{item.quantity}x</span>
                <span className="ml-2">{item.product.name}</span>
              </div>
              <span>{formatCurrency((item.product.price + (item.selectedSubCategory?.additionalPrice || 0)) * item.quantity)}</span>
            </div>

            {(item.selectedSubCategory || item.customerNote) && (
              <div className="ml-6 mt-1 text-xs text-gray-500">
                {item.selectedSubCategory && (
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.selectedSubCategory.name}
                  </span>
                )}
                {item.customerNote && (
                  <span className="ml-1 italic">
                    "{item.customerNote.length > 15 ? `${item.customerNote.substring(0, 15)}...` : item.customerNote}"
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {order.items.length > 2 && (
          <div className="text-xs text-gray-500">
            + {order.items.length - 2} more items
          </div>
        )}
      </div>

      <div className="flex justify-between items-start border-t pt-2">
        <div className="flex flex-col">
          <div className="flex flex-col text-xs text-gray-500">
            <span>Subtotal: {formatCurrency(order.subtotal)}</span>
            {order.tax > 0 && (
              <span>Tax: {formatCurrency(order.tax)}</span>
            )}
            {order.discount > 0 && (
              <div className="flex items-center text-red-600">
                <Tag className="w-3 h-3 mr-0.5" />
                <span>Discount: -{formatCurrency(order.discount)}</span>
              </div>
            )}
          </div>
          <span className="font-semibold mt-1">{formatCurrency(order.total)}</span>
        </div>

        <div className="flex space-x-2">
          {order.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              onClick={() => confirmDelete(order.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewOrderDetails(order)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <MainLayout isAdmin>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Orders Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">
                {pendingOrders.length}
              </span>
              Pending Orders
            </h2>
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                  No pending orders
                </p>
              ) : (
                pendingOrders.map(renderOrderCard)
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">
                {processingOrders.length}
              </span>
              Processing Orders
            </h2>
            <div className="space-y-4">
              {processingOrders.length === 0 ? (
                <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                  No processing orders
                </p>
              ) : (
                processingOrders.map(renderOrderCard)
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">
              {completedOrders.length}
            </span>
            Completed Orders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedOrders.length === 0 ? (
              <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                No completed orders
              </p>
            ) : (
              completedOrders.slice(0, 6).map(renderOrderCard)
            )}
          </div>
        </div>

        {selectedOrder && (
          <AdminOrderDetail
            order={selectedOrder}
            open={orderDetailOpen}
            onClose={() => setOrderDetailOpen(false)}
            onUpdateStatus={updateOrderStatus}
            onAddToQueue={handleAddToQueue}
          />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the order. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteOrder}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default AdminOrders;
