import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Product, ProductSubCategory } from "@/types/pos";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, subCategory?: ProductSubCategory, customerNote?: string) => void;
  removeFromCart: (productId: string, subCategoryId?: string) => void; // Tambahkan parameter opsional
  increaseQuantity: (productId: string, subCategoryId?: string) => void;
  decreaseQuantity: (productId: string, subCategoryId?: string) => void;
  clearCart: () => void;
  getSubTotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1, subCategory?: ProductSubCategory, customerNote?: string) => {
    const selectedSubCategory = product.subCategories && product.subCategories.length > 0
      ? (subCategory || product.subCategories[0])
      : undefined;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          ((!item.selectedSubCategory && !selectedSubCategory) ||
            (item.selectedSubCategory?.id === selectedSubCategory?.id)) &&
          item.customerNote === customerNote 
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;

        toast.success(`Ditambahkan ${product.name} ${selectedSubCategory?.name ? `(${selectedSubCategory.name})` : ''} ke keranjang`);
        return updatedItems;
      }

      // Add as new item
      toast.success(`Ditambahkan ${product.name} ${selectedSubCategory?.name ? `(${selectedSubCategory.name})` : ''} ke keranjang`);
      return [
        ...prevItems,
        {
          product,
          quantity,
          selectedSubCategory,
          customerNote
        }
      ];
    });
  };

  const removeFromCart = (productId: string, subCategoryId?: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => {
        if (item.product.id !== productId) return true;
        if (!subCategoryId) return false;
        return item.selectedSubCategory?.id !== subCategoryId;
      });

      if (newItems.length < prevItems.length) {
        toast.info("Item removed from cart");
      }
      return newItems;
    });
  };

  const increaseQuantity = (productId: string, subCategoryId?: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
          (item.selectedSubCategory?.id === subCategoryId ||
            (!item.selectedSubCategory && !subCategoryId))
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string, subCategoryId?: string) => {
    setItems((prevItems) => {
      
      const itemToDecrease = prevItems.find(item =>
        item.product.id === productId &&
        (item.selectedSubCategory?.id === subCategoryId ||
          (!item.selectedSubCategory && !subCategoryId))
      );

      if (itemToDecrease && itemToDecrease.quantity === 1) {
        toast.info("Item removed from cart");
        return prevItems.filter(item =>
          !(item.product.id === productId &&
            (item.selectedSubCategory?.id === subCategoryId ||
              (!item.selectedSubCategory && !subCategoryId)))
        );
      }

      return prevItems.map((item) =>
        item.product.id === productId &&
          (item.selectedSubCategory?.id === subCategoryId ||
            (!item.selectedSubCategory && !subCategoryId))
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubTotal = () => {
    return items.reduce(
      (total, item) => {
        const itemBasePrice = item.product.price;
        const additionalPrice = item.selectedSubCategory?.additionalPrice || 0;
        return total + (itemBasePrice + additionalPrice) * item.quantity;
      },
      0
    );
  };

  const getTax = () => {
    return getSubTotal() * 0.1; // 10% tax
  };

  const getTotal = () => {
    return getSubTotal() + getTax();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getSubTotal,
        getTax,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
