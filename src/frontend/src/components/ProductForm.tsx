import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Category, Product, ProductSubCategory } from "@/types/pos";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { nanoid } from "nanoid";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editProduct?: Product;
  categories: Category[];
}

export function ProductForm({ open, onClose, onSave, editProduct, categories }: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"available" | "out_of_stock" | "coming_soon">("available");
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const isEditing = !!editProduct;

  useEffect(() => {
    if (open) {
      if (editProduct) {
        setName(editProduct.name);
        setPrice(editProduct.price.toString());
        setImage(editProduct.image);
        setCategoryId(editProduct.categoryId);
        setDescription(editProduct.description);
        setStatus(editProduct.status);
        setSubCategories(editProduct.subCategories || []);
      } else {
        setName("");
        setPrice("");
        setImage("/placeholder.svg");
        setCategoryId(categories[0]?.id || "");
        setDescription("");
        setStatus("available");
        setSubCategories([{ id: nanoid(), name: "Regular", additionalPrice: 0, note: "" }]);
      }
    }
  }, [open, editProduct, categories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak valid. Gunakan JPEG, PNG, atau WebP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error("Ukuran file terlalu besar. Maksimal 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadPath", "produk");

      /// BELUM TERSEDIA UPLOAD NYA 
      const response = await fetch("", {
        method: "POST",
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload gagal");
      }

      const data = await response.json();
      setImage(data.url);
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("UPLOAD BELUM TERSEDIA");
    } finally {
      setIsUploading(false);
    }


  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Nama produk harus diisi");
      return;
    }

    if (!price.trim() || isNaN(Number(price))) {
      toast.error("Harga produk harus diisi dengan angka valid");
      return;
    }
    
    if (!categoryId) {
      toast.error("Kategori harus dipilih");
      return;
    }

    if (subCategories.length === 0) {
      toast.error("Produk harus memiliki minimal satu sub kategori");
      return;
    }

    const productToSave: Product = {
      id: editProduct?.id || nanoid(),
      name,
      price: Number(price),
      image,
      categoryId,
      description,
      status,
      subCategories,
    };

    onSave(productToSave);
    onClose();
  };

  const handleAddSubCategory = () => {
    setSubCategories([
      ...subCategories,
      { id: nanoid(), name: "", additionalPrice: 0, note: "" },
    ]);
  };

  const handleRemoveSubCategory = (index: number) => {
    if (subCategories.length <= 1) {
      toast.error("Produk harus memiliki minimal satu sub kategori");
      return;
    }
    
    const newSubCategories = [...subCategories];
    newSubCategories.splice(index, 1);
    setSubCategories(newSubCategories);
  };

  const handleUpdateSubCategory = (index: number, field: keyof ProductSubCategory, value: string | number) => {
    const newSubCategories = [...subCategories];
    newSubCategories[index] = {
      ...newSubCategories[index],
      [field]: value,
    };
    setSubCategories(newSubCategories);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 p-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nama Produk
              </label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama produk" 
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Harga Dasar (Rp)
              </label>
              <Input 
                id="price" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                type="number"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="image" className="text-sm font-medium">
              Gambar Produk
            </label>
            <div className="flex items-center gap-2">
              <Input 
                type="file" 
                id="image-upload"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label 
                htmlFor="image-upload"
                className="flex-1 border rounded-md px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
              >
                {isUploading ? "Mengupload..." : "Pilih Gambar"}
              </label>
              {image && (
                <div className="w-10 h-10 rounded-md border overflow-hidden">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {image && !image.startsWith("data:") && (
              <Input 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="URL gambar"
                className="text-xs"
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Kategori
              </label>
              <Select 
                value={categoryId} 
                onValueChange={(value) => setCategoryId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select 
                value={status} 
                onValueChange={(value: "available" | "out_of_stock" | "coming_soon") => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="out_of_stock">Stok Habis</SelectItem>
                  <SelectItem value="coming_soon">Segera Hadir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Deskripsi
            </label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi produk" 
              rows={3}
            />
          </div>
          
          {/* Sub Categories Section */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Sub Kategori dan Harga Tambahan
              </label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddSubCategory}
                className="text-xs flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Sub Kategori
              </Button>
            </div>
            
            <div className="space-y-3 border rounded-md p-3 bg-gray-50">
              {subCategories.map((subCategory, index) => (
                <div key={subCategory.id} className="grid gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-1">
                      <Input 
                        value={subCategory.name}
                        onChange={(e) => handleUpdateSubCategory(index, "name", e.target.value)}
                        placeholder="Nama Sub"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input 
                        value={subCategory.additionalPrice}
                        onChange={(e) => handleUpdateSubCategory(index, "additionalPrice", Number(e.target.value))}
                        placeholder="Harga Tambahan"
                        type="number"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                        onClick={() => handleRemoveSubCategory(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Input 
                      value={subCategory.note || ""}
                      onChange={(e) => handleUpdateSubCategory(index, "note", e.target.value)}
                      placeholder="Catatan (opsional)"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="bg-gray-50 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-pos-primary hover:bg-pos-primary/90 transition-colors"
            disabled={isUploading}
          >
            {isUploading ? "Mengupload..." : isEditing ? "Update Produk" : "Tambah Produk"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}