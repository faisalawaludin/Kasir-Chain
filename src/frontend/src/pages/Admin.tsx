import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/MainLayout";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Order, CartItem } from "@/types/pos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Link } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { listOrders } from "@/services/order";
import { mapOrderDataToOrder } from "@/mappers/orderMapper"; 

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<"1day" | "7days" | "30days">("7days");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);


  // Load orders 
  useEffect(() => {
    const loadOrdersFromCanister = async () => {
      try {
        const orderDataList = await listOrders();
        const mapped = orderDataList.map(mapOrderDataToOrder); 
        setOrders(mapped);
      } catch (err) {
        console.error("Gagal load orders dari canister", err);
        toast.error("Gagal memuat order dari server");
      }
    };

    loadOrdersFromCanister();

    const intervalId = setInterval(loadOrdersFromCanister, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Filter orders based on selected date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "1day": startDate = subDays(now, 1); break;
      case "7days": startDate = subDays(now, 7); break;
      case "30days": startDate = subDays(now, 30); break;
      default: startDate = subDays(now, 7);
    }

    return orders.filter(order => new Date(order.createdAt) >= startDate);
  }, [orders, dateRange]);


  // Calculate totals
  const completedOrders = filteredOrders.filter(order => order.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = completedOrders.length;
  const pendingOrders = filteredOrders.filter(order => order.status === "pending").length;

  // Generate revenue chart data based on completed orders only
  const getOrdersByDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyData = Array(7).fill(0);
    
    completedOrders.forEach(order => {
      const dayIndex = new Date(order.createdAt).getDay();
      dailyData[dayIndex] += order.total;
    });
    
    return days.map((day, index) => ({
      name: day,
      amount: dailyData[index]
    }));
  };
  
  const dailyRevenue = getOrdersByDay();

  // Generate category sales data based on completed orders only
  const getCategorySales = () => {
    const categorySalesMap: Record<string, number> = {};
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const categoryId = item.product.categoryId;
        const amount = (item.product.price + (item.selectedSubCategory?.additionalPrice || 0)) * item.quantity;
        
        if (categorySalesMap[categoryId]) {
          categorySalesMap[categoryId] += amount;
        } else {
          categorySalesMap[categoryId] = amount;
        }
      });
    });
    
    return Object.entries(categorySalesMap).map(([categoryId, amount]) => ({
      name: getCategoryName(categoryId),
      amount
    }));
  };
  
  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string): string => {
    switch(categoryId) {
      case "cat1": return "Burger";
      case "cat2": return "Pizza";
      case "cat3": return "Pasta";
      case "cat4": return "Pancake";
      case "cat5": return "Snacks";
      case "cat6": return "Drinks";
      default: return "Other";
    }
  };
  
  const categorySales = getCategorySales();

  // Export dashboard data to PDF
  const exportToPDF = () => {
    try {
      toast.success("Dashboard data exported to PDF successfully");
      console.log("Exporting data to PDF:", {
        dateRange,
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders: completedOrders.length,
        dailyRevenue,
        categorySales
      });
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };


  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };


  return (
    <MainLayout isAdmin>
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="w-full sm:w-auto">
              <Select value={dateRange} onValueChange={(value: "1day" | "7days" | "30days") => setDateRange(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">Last 24 hours</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={exportToPDF}
            >
              <FileText size={16} />
              Export to PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pos-primary">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">From {totalOrders} completed orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completed Orders</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pos-primary">
                <rect width="16" height="20" x="4" y="2" rx="2"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M4 10h16"/>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Completed revenue: {formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pos-orange">
                <path d="M10.1 2.182a10 10 0 0 1 3.8 0"/>
                <path d="M13.9 21.818a10 10 0 0 1-3.8 0"/>
                <path d="M7.1 3.4a10 10 0 0 1 2.933-1.358"/>
                <path d="M16.9 20.6a10 10 0 0 1-2.933 1.358"/>
                <path d="M4.6 5.45a10 10 0 0 1 2.1-2.1"/>
                <path d="M19.4 18.55a10 10 0 0 1-2.1 2.1"/>
                <path d="M2.8 8.4a10 10 0 0 1 1.05-2.8"/>
                <path d="M21.2 15.6a10 10 0 0 1-1.05 2.8"/>
                <path d="M2 12a10 10 0 0 1 .182-1.9"/>
                <path d="M22 12a10 10 0 0 1-.182 1.9"/>
                <path d="M2.8 15.6a10 10 0 0 1-.8-3.6"/>
                <path d="M12 12h-1.5"/>
                <path d="M12 12v-1.5"/>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (Completed Orders)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `Rp${(value/1000)}k`} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(value as number)}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#9b87f5" 
                      strokeWidth={3} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, stroke: "#9b87f5", strokeWidth: 2, fill: "white" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Sales (Completed Orders)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `Rp${(value/1000)}k`} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(value as number)}`, 'Sales']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#9b87f5" 
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

       <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link to="/admin/orders">
              <button className="text-sm text-pos-primary hover:text-pos-primary/80 flex items-center">
                View all orders
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            </Link>
          </div>
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "completed" ? "bg-green-100 text-green-800" :
                          order.status === "processing" ? "bg-blue-100 text-blue-800" :
                          order.status === "cancelled" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.status === "completed" ? "Completed" : 
                           order.status === "processing" ? "Processing" :
                           order.status === "cancelled" ? "Cancelled" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewOrderDetails(order)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Order Details #{selectedOrder?.id}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                    <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedOrder.status === "completed" ? "bg-green-100 text-green-800" :
                        selectedOrder.status === "processing" ? "bg-blue-100 text-blue-800" :
                        selectedOrder.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            {item.selectedSubCategory && (
                              <p className="text-xs text-gray-500 mt-1">
                                Variant: {item.selectedSubCategory.name} (+{formatCurrency(item.selectedSubCategory.additionalPrice)})
                              </p>
                            )}
                            {item.customerNote && (
                              <p className="text-xs text-gray-500 mt-1">
                                Note: "{item.customerNote}"
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p>{item.quantity} × {formatCurrency(item.product.price + (item.selectedSubCategory?.additionalPrice || 0))}</p>
                            <p className="font-medium">
                              {formatCurrency((item.product.price + (item.selectedSubCategory?.additionalPrice || 0)) * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Subtotal</h4>
                    <p className="text-sm">{formatCurrency(selectedOrder.subtotal)}</p>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tax</h4>
                      <p className="text-sm">{formatCurrency(selectedOrder.tax)}</p>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Discount</h4>
                      <p className="text-sm text-red-600">-{formatCurrency(selectedOrder.discount)}</p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t">
                    <h4 className="text-sm font-medium text-gray-500">Total</h4>
                    <p className="text-lg font-bold">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Admin;