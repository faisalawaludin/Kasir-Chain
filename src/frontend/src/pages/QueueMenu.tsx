
import { useState, useEffect } from "react";
import { useQueue, QueueItem } from "@/context/QueueContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Timer, SquareKanban, ListCheck } from "lucide-react";

const QueueMenu = () => {
  const { queue, getCurrentQueueItems } = useQueue();
  const [activeQueues, setActiveQueues] = useState<QueueItem[]>([]);

  // Update active queues whenever queue changes
  useEffect(() => {
    setActiveQueues(getCurrentQueueItems());
  }, [queue, getCurrentQueueItems]);

  // Count orders by status
  const statusCounts = {
    waiting: queue.filter(item => item.status === 'waiting').length,
    preparing: queue.filter(item => item.status === 'preparing').length,
    ready: queue.filter(item => item.status === 'ready').length,
  };

  // Get the total number of active orders (not completed)
  const totalActiveOrders = activeQueues.length;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-center text-pos-primary">Queue Menu</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 flex items-center text-lg">
                <Timer className="mr-2 h-5 w-5" /> 
                Waiting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-700">{statusCounts.waiting}</p>
              <p className="text-sm text-amber-600 mt-1">Orders waiting to be prepared</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 flex items-center text-lg">
                <SquareKanban className="mr-2 h-5 w-5" /> 
                Preparing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-700">{statusCounts.preparing}</p>
              <p className="text-sm text-blue-600 mt-1">Orders currently being prepared</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 flex items-center text-lg">
                <ListCheck className="mr-2 h-5 w-5" /> 
                Ready for Pickup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-700">{statusCounts.ready}</p>
              <p className="text-sm text-green-600 mt-1">Orders ready to be picked up</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Current Queue Status</h2>
            <div className="bg-pos-primary/10 px-3 py-1 rounded-full text-pos-primary font-medium">
              Total Active: {totalActiveOrders}
            </div>
          </div>
          
          {queue.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Timer className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-xl font-medium text-gray-500">No Active Queue Items</h3>
              <p className="text-gray-400 mt-2">Queue items will appear here when orders are placed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Queue #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Time Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue
                  .filter(item => item.status !== 'completed')
                  .sort((a, b) => a.queueNumber - b.queueNumber)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-lg">
                        #{item.queueNumber}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'waiting' ? 'bg-amber-100 text-amber-800' : 
                            item.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </TableCell>
                      <TableCell>
                        <CountdownTimer initialTime={item.estimatedTime} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Queue Display Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue
              .filter(item => item.status === 'ready')
              .sort((a, b) => a.queueNumber - b.queueNumber)
              .map((item) => (
                <Card key={item.id} className="border-green-500 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-800 text-xl flex justify-between items-center">
                      <span>Queue #{item.queueNumber}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">READY</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 font-medium">
                      {item.items.reduce((sum, i) => sum + i.quantity, 0)} items ready for pickup!
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
          
          {queue.filter(item => item.status === 'ready').length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No orders ready for pickup at the moment</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default QueueMenu;
