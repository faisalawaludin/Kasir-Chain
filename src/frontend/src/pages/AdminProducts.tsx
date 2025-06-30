import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { CategoryList } from "@/components/CategoryList";
import { CategoryForm } from "@/components/CategoryForm";
import { Category, Product } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { ProductForm } from "@/components/ProductForm";
import { loadProducts, createProduct, updateProduct, deleteProduct } from "@/services/product";
import { mapProductDataToProduct, mapProductToProductData } from "@/mappers/productMapper"
import {
  loadCategories,
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryService,
} from "@/services/category";
import {
  mapCategoryToCategoryData,
  mapCategoryDataToCategory,
} from "@/mappers/categoryMapper";


const AdminProducts = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | undefined>(undefined);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);

  // Load data canister products and categories on mount
  useEffect(() => {


    (async () => {
      const cats = await loadCategories();
      setCategories(cats.map(mapCategoryDataToCategory));
      console.log("Loaded products:", cats);

      const prods = await loadProducts();
      console.log("Loaded products:", prods);
      setProducts(prods.map(mapProductDataToProduct));
    })();


  }, []);


  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products;

  // Category Functions
  const handleAddCategory = async (categoryData: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...categoryData,
      id: nanoid(),
    };

    const success = await createCategory(mapCategoryToCategoryData(newCategory));
    if (success) {
      const cats = await loadCategories();
      setCategories(cats.map(mapCategoryDataToCategory));
    }
  };


  const handleEditCategory = (category: Category) => {
    setEditCategory(category);
    setCategoryFormOpen(true);
  };

  const handleUpdateCategory = async (categoryData: Omit<Category, "id">) => {
    if (!editCategory) return;

    const updatedCategory: Category = { ...editCategory, ...categoryData };

    const success = await updateCategory(
      mapCategoryToCategoryData(updatedCategory)
    );

    if (success) {
      const cats = await loadCategories();
      setCategories(cats.map(mapCategoryDataToCategory));
      setEditCategory(undefined);
    }
  };


  const handleDeleteCategory = async (categoryId: string) => {
    const productsInCategory = products.filter(
      (product) => product.categoryId === categoryId
    );

    if (productsInCategory.length > 0) {
      toast.error(
        `Tidak dapat menghapus kategori karena ada ${productsInCategory.length} produk yang menggunakannya`
      );
      return;
    }

    const success = await deleteCategoryService(categoryId);
    if (success) {
      const cats = await loadCategories();
      setCategories(cats.map(mapCategoryDataToCategory));
      if (selectedCategory === categoryId) setSelectedCategory(null);
    }
  };


  // Product Functions
  const handleAddProduct = () => {
    setEditProduct(undefined);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setProductFormOpen(true);
  };


  const handleSaveProduct = async (product: Product) => {
    const productData = mapProductToProductData(product);

    let success = false;
    if (editProduct) {
      success = await updateProduct(productData);
    } else {
      success = await createProduct(productData);
    }

    if (success) {
      const result = await loadProducts();
      const mapped = result.map(mapProductDataToProduct);
      setProducts(mapped);
      toast.success(editProduct ? "Produk diperbarui" : "Produk ditambahkan");
    }

    setProductFormOpen(false);
    setEditProduct(undefined);
  };


  const handleDeleteProduct = async (productId: string) => {
    const success = await deleteProduct(productId);
    if (success) {
      const result = await loadProducts();
      const mapped = result.map(mapProductDataToProduct);
      setProducts(mapped);
      toast.success("Produk berhasil dihapus");
    }
  };


  return (
    <MainLayout isAdmin>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Produk</h1>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kategori</h2>
            <Button
              onClick={() => {
                setEditCategory(undefined);
                setCategoryFormOpen(true);
              }}
              className="bg-pos-primary hover:bg-pos-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
            </Button>
          </div>

          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isAdmin
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedCategory
                ? `Produk dalam kategori "${categories.find(cat => cat.id === selectedCategory)?.name || ''}"`
                : "Semua Produk"}
            </h2>
            <Button
              onClick={handleAddProduct}
              className="bg-pos-primary hover:bg-pos-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Produk
            </Button>
          </div>

          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Kategori
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                        Tidak ada produk yang tersedia
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const category = categories.find(
                        (cat) => cat.id === product.categoryId
                      );
                      return (
                        <tr key={product.id}>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-md overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.description.substring(0, 30)}
                              {product.description.length > 30 ? "..." : ""}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(product.price)}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {category ? (
                                <span>
                                  <span className="mr-1">{category.icon}</span>
                                  {category.name}
                                </span>
                              ) : (
                                "Tidak ada kategori"
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === "available"
                                ? "bg-green-100 text-green-800"
                                : product.status === "out_of_stock"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {product.status === "available"
                                ? "Tersedia"
                                : product.status === "out_of_stock"
                                  ? "Stok Habis"
                                  : "Segera Hadir"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {product.subCategories ? (
                              <div className="text-xs">
                                {product.subCategories.map((sub, idx) => (
                                  <div key={sub.id} className="flex justify-between mb-1">
                                    <span>{sub.name}</span>
                                    <span>+{formatCurrency(sub.additionalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">Tidak ada sub</div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>



        </div>
      </div>

      {/* Category Form Dialog */}
      <CategoryForm
        open={categoryFormOpen}
        onClose={() => {
          setCategoryFormOpen(false);
          setEditCategory(undefined);
        }}
        onSave={editCategory ? handleUpdateCategory : handleAddCategory}
        editCategory={editCategory}
      />

      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        onClose={() => {
          setProductFormOpen(false);
          setEditProduct(undefined);
        }}
        onSave={handleSaveProduct}
        editProduct={editProduct}
        categories={categories}
      />
    </MainLayout>
  );
};

export default AdminProducts;