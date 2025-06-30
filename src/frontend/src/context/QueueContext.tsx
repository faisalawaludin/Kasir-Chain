
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CartItem } from "@/types/pos";
import { toast } from "sonner";

// Generate a unique ID
const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `q-${timestamp}-${randomStr}`;
};

// Define queue item type
export interface QueueItem {
  id: string;
  items: CartItem[];
  createdAt: Date;
  estimatedTime: number; // in seconds
  status: 'waiting' | 'preparing' | 'ready' | 'completed';
  queueNumber: number;
}

interface QueueContextType {
  queue: QueueItem[];
  addToQueue: (items: CartItem[], estimatedTime?: number) => string;
  updateQueueStatus: (id: string, status: QueueItem['status']) => void;
  updateEstimatedTime: (id: string, time: number) => void;
  removeFromQueue: (id: string) => void;
  getNextQueueNumber: () => number;
  getCurrentQueueItems: () => QueueItem[];
  getQueueStats: () => { waiting: number; preparing: number; ready: number; completed: number; total: number };
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);


export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [lastQueueNumber, setLastQueueNumber] = useState(0);

  
  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem('pos-queue');
      const savedQueueNumber = localStorage.getItem('pos-queue-number');
      
      if (savedQueue) {
        const parsedQueue = JSON.parse(savedQueue);
        // Convert string dates back to Date objects
        parsedQueue.forEach((item: any) => {
          item.createdAt = new Date(item.createdAt);
        });
        setQueue(parsedQueue);
      }
      
      if (savedQueueNumber) {
        setLastQueueNumber(parseInt(savedQueueNumber, 10));
      }
    } catch (error) {
      console.error("Error loading queue from localStorage:", error);
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('pos-queue', JSON.stringify(queue));
      localStorage.setItem('pos-queue-number', lastQueueNumber.toString());
    } catch (error) {
      console.error("Error saving queue to localStorage:", error);
    }
  }, [queue, lastQueueNumber]);

  const getNextQueueNumber = () => {
    const nextNumber = lastQueueNumber + 1;
    setLastQueueNumber(nextNumber);
    return nextNumber;
  };

  const addToQueue = (items: CartItem[], estimatedTime = 300) => {
    const queueNumber = getNextQueueNumber();
    const uniqueId = generateUniqueId();
    
    const newQueueItem: QueueItem = {
      id: uniqueId,
      items,
      createdAt: new Date(),
      estimatedTime,
      status: 'waiting',
      queueNumber
    };

    setQueue(prevQueue => [...prevQueue, newQueueItem]);
    toast.success(`Berhasil menambah antrian`);
    
    return uniqueId;
  };

  const updateQueueStatus = (id: string, status: QueueItem['status']) => {
    setQueue(prevQueue =>
      prevQueue.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
    
    // Show toast for ready items
    if (status === 'ready') {
      const item = queue.find(item => item.id === id);
      if (item) {
        toast.success(`Order #${item.queueNumber} is ready for pickup!`);
      }
    }
  };

  const updateEstimatedTime = (id: string, time: number) => {
    setQueue(prevQueue =>
      prevQueue.map(item =>
        item.id === id ? { ...item, estimatedTime: time } : item
      )
    );
  };

  const removeFromQueue = (id: string) => {
    setQueue(prevQueue => prevQueue.filter(item => item.id !== id));
  };

  const getCurrentQueueItems = () => {
    return queue.filter(item => item.status !== 'completed');
  };
  
  const getQueueStats = () => {
    const waiting = queue.filter(item => item.status === 'waiting').length;
    const preparing = queue.filter(item => item.status === 'preparing').length;
    const ready = queue.filter(item => item.status === 'ready').length;
    const completed = queue.filter(item => item.status === 'completed').length;
    
    return {
      waiting,
      preparing,
      ready,
      completed,
      total: waiting + preparing + ready
    };
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        addToQueue,
        updateQueueStatus,
        updateEstimatedTime,
        removeFromQueue,
        getNextQueueNumber,
        getCurrentQueueItems,
        getQueueStats
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};
