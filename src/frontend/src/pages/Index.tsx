import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { CategoryList } from "@/components/CategoryList";
import { ProductCard } from "@/components/ProductCard";
import { CartSummary } from "@/components/CartSummary";
import { Input } from "@/components/ui/input";
import { Search, Timer } from "lucide-react";
import { useQueue } from "@/context/QueueContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Category, Product } from "@/types/pos";

///canister
import { loadProducts } from "@/services/product";
import { loadCategories } from "@/services/category";
import { mapProductDataToProduct } from "@/mappers/productMapper";
import { mapCategoryDataToCategory } from "@/mappers/categoryMapper";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

 // Load products & categories from canister
  useEffect(() => {
    const loadData = async () => {
      const prodRaw = await loadProducts();
      const catRaw = await loadCategories();

      setProducts(prodRaw.map(mapProductDataToProduct));
      setCategories(catRaw.map(mapCategoryDataToCategory));
    };

    loadData();
  }, []);

 // Filter products based on selected category and search query
 useEffect(() => {
    const filtered = products.filter((product) => {
      const categoryMatch = selectedCategory
        ? product.categoryId === selectedCategory
        : true;
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  const { getCurrentQueueItems } = useQueue();

  useEffect(() => {
    const currentQueue = getCurrentQueueItems();
    console.log("Current Queue Items:", currentQueue);
  }, [getCurrentQueueItems]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Menu</h1>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-full border border-gray-200"
                  />
                </div>
              </div>

              <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;