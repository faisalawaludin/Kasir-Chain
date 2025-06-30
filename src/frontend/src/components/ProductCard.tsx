
import { useState } from "react";
import { Product, ProductSubCategory } from "@/types/pos";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ProductSubCategory | null>(
    product.subCategories && product.subCategories.length > 0
      ? product.subCategories[0]
      : null
  );
  const [customerNote, setCustomerNote] = useState("");

  const handleOpenDialog = () => {
    setSelectedSubCategory(
      product.subCategories && product.subCategories.length > 0
        ? product.subCategories[0]
        : null
    );
    setCustomerNote("");

    setDialogOpen(true);
  };

  const handleAddToCart = () => {
    if (!product.subCategories || product.subCategories.length === 0) {
      addToCart(product, 1, undefined, customerNote);
    } else if (selectedSubCategory) {
      addToCart(product, 1, selectedSubCategory, customerNote);
    }

    setDialogOpen(false);
    setCustomerNote("");
  };

  return (
    <>
      <div className="product-card animate-fade-in bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
        {/* Image Container - Fixed aspect ratio 1:1 */}
        <div className="relative bg-gray-100 pt-[100%]">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {product.status === "available" ? (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md flex items-center shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Tersedia
              </span>
            ) : (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Habis
              </span>
            )}
          </div>
        </div>


        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-gray-800 mb-1 truncate text-sm md:text-base">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-pos-primary font-semibold text-base md:text-lg mt-auto">
            {formatCurrency(product.price)}
          </p>
        </div>

        <div className="px-3 pb-3">
          <Button
            variant="outline"
            className={`w-full border-gray-200 hover:bg-pos-primary hover:text-white transition-colors ${product.status !== "available" ? "opacity-60 cursor-not-allowed" : ""
              }`}
            onClick={product.status === "available" ? handleOpenDialog : undefined}
            disabled={product.status !== "available"}
          >
            <Plus className="w-4 h-4 mr-1" />
            {product.status === "available" ? "Tambah" : "Stok Habis"}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {product.subCategories && product.subCategories.length > 0
                ? "Pilih Varian Produk"
                : "Tambah ke Keranjang"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.description}</p>
            </div>

            {product.subCategories && product.subCategories.length > 0 ? (
              <div className="grid gap-5">
                <RadioGroup
                  defaultValue={product.subCategories[0].id}
                  onValueChange={(value) => {
                    const selected = product.subCategories?.find(sub => sub.id === value);
                    if (selected) {
                      setSelectedSubCategory(selected);
                    }
                  }}
                >
                  {product.subCategories.map((subCategory) => (
                    <div key={subCategory.id} className="flex flex-col border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={subCategory.id} id={subCategory.id} />
                          <Label htmlFor={subCategory.id} className="font-medium cursor-pointer">
                            {subCategory.name}
                          </Label>
                        </div>
                        <span className="text-pos-primary font-medium">
                          {subCategory.additionalPrice > 0 ?
                            `+${formatCurrency(subCategory.additionalPrice)}` :
                            "Tanpa tambahan"
                          }
                        </span>
                      </div>

                      {/* Display note if available */}
                      {subCategory.note && (
                        <div className="mt-2 ml-6 text-sm text-gray-600">
                          <span className="italic">Note: {subCategory.note} <span className="text-gray-400">(optional)</span></span>
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {/* Customer note textarea */}
                <div className="grid gap-2">
                  <Label htmlFor="customerNote" className="text-sm font-medium">
                    Catatan Tambahan <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="customerNote"
                    placeholder="Tambahkan catatan untuk pesanan ini..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-pos-primary font-semibold text-lg">
                      {formatCurrency(product.price + (selectedSubCategory?.additionalPrice || 0))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Customer note textarea for products without variants */}
                <div className="grid gap-2">
                  <Label htmlFor="customerNote" className="text-sm font-medium">
                    Catatan Tambahan <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="customerNote"
                    placeholder="Tambahkan catatan untuk pesanan ini..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-pos-primary font-semibold text-lg">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button className="bg-pos-primary hover:bg-pos-primary/90" onClick={handleAddToCart}>
              Tambah ke Keranjang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
