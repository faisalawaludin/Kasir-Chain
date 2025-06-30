
import { useState, useEffect } from "react";
import { Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface CountdownTimerProps {
  initialTime: number; // in seconds
  onTimeUpdate?: (newTime: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showEdit?: boolean;
}

export const CountdownTimer = ({ 
  initialTime, 
  onTimeUpdate,
  size = 'md', 
  showEdit = false 
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor(initialTime / 60).toString());
  const [seconds, setSeconds] = useState((initialTime % 60).toString().padStart(2, '0'));
  
  useEffect(() => {
    setTimeLeft(initialTime);
    setMinutes(Math.floor(initialTime / 60).toString());
    setSeconds((initialTime % 60).toString().padStart(2, '0'));
  }, [initialTime]);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isPaused]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditTime = () => {
    const newMinutes = parseInt(minutes, 10) || 0;
    const newSeconds = parseInt(seconds, 10) || 0;
    const newTotalSeconds = (newMinutes * 60) + newSeconds;
    
    if (newTotalSeconds > 0) {
      setTimeLeft(newTotalSeconds);
      if (onTimeUpdate) {
        onTimeUpdate(newTotalSeconds);
      }
    }
    
    setIsEditDialogOpen(false);
  };

  // Determine size classes
  const sizeClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-lg font-semibold"
  };

  return (
    <>
      <div className={`flex items-center ${size === 'lg' ? 'gap-2' : 'gap-1'}`}>
        <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} text-pos-primary`} />
        <span className={`${sizeClasses[size]}`}>
          {formatTime(timeLeft)}
        </span>
        {showEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Timer</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min="0"
                placeholder="Minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full"
              />
              <span className="text-lg">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="Seconds"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditTime} className="bg-pos-primary hover:bg-pos-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
