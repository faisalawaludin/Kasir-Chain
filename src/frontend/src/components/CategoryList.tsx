
import { useState } from "react";
import { Category } from "@/types/pos";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isAdmin?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

export function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  isAdmin = false,
  onEdit,
  onDelete,
}: CategoryListProps) {
  // Responsive scroll button handling
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setScrollPosition(container.scrollLeft);
  };

  const scrollLeft = () => {
    const container = document.getElementById("category-scroll-container");
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("category-scroll-container");
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      {/* Left scroll button */}
      {scrollPosition > 10 && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow-md p-2 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      )}

      <div 
        id="category-scroll-container"
        className="flex overflow-x-auto py-4 gap-3 no-scrollbar px-2 pb-2 scroll-smooth"
        onScroll={handleScroll}
      >
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={`category-card min-w-[110px] p-3 rounded-lg shadow-sm border flex flex-col items-center justify-center cursor-pointer transition-all ${
            selectedCategory === null 
              ? "border-pos-primary bg-pos-primary/10 text-pos-primary" 
              : "border-gray-200 bg-white hover:border-pos-primary/30 hover:bg-pos-primary/5"
          }`}
          onClick={() => onSelectCategory(null)}
        >
          <div className="text-2xl">🔍</div>
          <div className="text-sm font-medium mt-2">All Items</div>
        </motion.div>

        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileTap={{ scale: 0.95 }}
            className={`category-card min-w-[110px] p-3 rounded-lg shadow-sm border flex flex-col items-center justify-center cursor-pointer transition-all ${
              selectedCategory === category.id 
                ? "border-pos-primary bg-pos-primary/10 text-pos-primary" 
                : "border-gray-200 bg-white hover:border-pos-primary/30 hover:bg-pos-primary/5"
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="text-2xl">{category.icon}</div>
            <div className="text-sm font-medium mt-2 text-center">{category.name}</div>
            
            {/* Only show edit/delete buttons in admin mode */}
            {isAdmin && onEdit && onDelete && (
              <div className="mt-2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-yellow-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(category);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(category.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Right scroll button */}
      <button 
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow-md p-2 hover:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}
