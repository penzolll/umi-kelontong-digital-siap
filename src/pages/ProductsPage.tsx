
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Product } from "@/lib/types";
import { useProductStore } from "@/lib/store";
import { products, categories } from "@/lib/data";
import { Filter, X } from "lucide-react";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setProducts } = useProductStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Get max price from products
  const maxPrice = Math.max(...products.map(p => p.price));
  
  // Initialize products
  useEffect(() => {
    setProducts(products);
    
    // Get query parameters
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const promoParam = searchParams.get("promo");
    
    // Set initial filter values
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    
    // Apply initial filters
    filterProducts(searchParam || "", categoryParam || "", promoParam === "true", priceRange);
  }, [setProducts, searchParams]);

  const filterProducts = (search: string, category: string, promoOnly: boolean, price: number[]) => {
    let filtered = [...products];
    
    // Filter by search
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    // Filter by price
    filtered = filtered.filter(p => {
      const productPrice = p.discountPrice || p.price;
      return productPrice >= price[0] && productPrice <= price[1];
    });
    
    // Filter by promo
    if (promoOnly) {
      filtered = filtered.filter(p => p.isPromo);
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateFilters({ category: value });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    updateFilters({ minPrice: value[0].toString(), maxPrice: value[1].toString() });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange([0, maxPrice]);
    setSearchParams({});
    filterProducts("", "", false, [0, maxPrice]);
  };

  const updateFilters = (
    params: { 
      search?: string; 
      category?: string; 
      promo?: string;
      minPrice?: string;
      maxPrice?: string;
    }
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
    
    // Apply filters
    filterProducts(
      params.search !== undefined ? params.search : searchTerm,
      params.category !== undefined ? params.category : selectedCategory,
      searchParams.get("promo") === "true",
      [
        params.minPrice ? parseInt(params.minPrice) : priceRange[0],
        params.maxPrice ? parseInt(params.maxPrice) : priceRange[1]
      ]
    );
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Semua Produk</h1>

      <div className="lg:flex gap-6">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </Button>
        </div>
        
        {/* Filter sidebar */}
        <div className={`
          lg:w-1/4 space-y-6 mb-6 
          ${showFilters ? 'block' : 'hidden'} 
          lg:block
        `}>
          <div className="bg-card shadow-sm rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Filter</h2>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            <form onSubmit={handleSearch} className="mb-6">
              <Label htmlFor="search" className="text-sm">Cari</Label>
              <div className="flex mt-1">
                <Input
                  id="search"
                  type="search"
                  placeholder="Nama produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <Button type="submit" className="rounded-l-none px-3">
                  Cari
                </Button>
              </div>
            </form>
            
            <div className="mb-6">
              <Label htmlFor="category" className="text-sm">Kategori</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="price-range" className="text-sm">Rentang Harga</Label>
                <span className="text-sm text-muted-foreground">
                  Rp{priceRange[0].toLocaleString('id-ID')} - Rp{priceRange[1].toLocaleString('id-ID')}
                </span>
              </div>
              <Slider
                id="price-range"
                defaultValue={[0, maxPrice]}
                min={0}
                max={maxPrice}
                step={1000}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="my-6"
              />
            </div>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="lg:w-3/4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">Tidak ada produk yang ditemukan</h2>
              <p className="text-muted-foreground mb-6">
                Coba ubah filter atau cari dengan kata kunci yang berbeda
              </p>
              <Button onClick={resetFilters}>Reset Filter</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
