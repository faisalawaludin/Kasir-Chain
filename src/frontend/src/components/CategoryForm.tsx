
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Category } from "@/types/pos";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, "id">) => void;
  editCategory?: Category;
}

export function CategoryForm({ open, onClose, onSave, editCategory }: CategoryFormProps) {
  const [name, setName] = useState(editCategory?.name || "");
  const [icon, setIcon] = useState(editCategory?.icon || "");
  
  const isEditing = !!editCategory;

  // Reset form when dialog opens/closes or when changing between add/edit mode
  useState(() => {
    if (open) {
      setName(editCategory?.name || "");
      setIcon(editCategory?.icon || "");
    }
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!icon.trim()) {
      toast.error("Category icon is required");
      return;
    }

    onSave({
      name,
      icon,
    });

    // Reset form
    setName("");
    setIcon("");
    onClose();
  };

  // Common emojis for selection
  const commonEmojis = ["🍕", "🍔", "🍜", "🍣", "🍦", "🍰", "🍹", "🥗", "🥪", "🥤", "☕", "🍷", "🥂", "🍺"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 p-6 pt-2">
          <div className="grid gap-4">
            <label htmlFor="name" className="text-sm font-medium">
              Category Name
            </label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name" 
              className="w-full" 
            />
          </div>
          
          <div className="grid gap-4">
            <label htmlFor="icon" className="text-sm font-medium">
              Icon (emoji)
            </label>
            <Input 
              id="icon" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🍕" 
              className="w-full" 
            />
            
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {commonEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 text-xl flex items-center justify-center rounded-md hover:bg-gray-100 ${
                      icon === emoji ? 'bg-pos-primary/10 border border-pos-primary/50' : 'border border-gray-200'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="bg-gray-50 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-pos-primary hover:bg-pos-primary/90 transition-colors"
          >
            {isEditing ? "Update Category" : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
