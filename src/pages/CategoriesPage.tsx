
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/data";
import { Product } from "@/lib/types";

export default function CategoriesPage() {
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    // Group products by category
    const grouped = categories.reduce((acc, category) => {
      acc[category.id] = products.filter(product => product.category === category.id);
      return acc;
    }, {} as Record<string, Product[]>);
    
    setCategoryProducts(grouped);
  }, []);

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Kategori Produk</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            className={`flex flex-col items-center p-3 rounded-lg transition-all ${
              selectedCategory === category.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background border hover:border-primary'
            }`}
            onClick={() => setSelectedCategory(prevCat => 
              prevCat === category.id ? null : category.id
            )}
          >
            <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-2 ${
              selectedCategory === category.id ? 'bg-white/20' : 'bg-muted'
            }`}>
              <img
                src={category.image}
                alt={category.name}
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-xs md:text-sm text-center">{category.name}</span>
          </button>
        ))}
      </div>
      
      {selectedCategory ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-primary hover:underline"
            >
              Tampilkan Semua
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categoryProducts[selectedCategory]?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            
            {(!categoryProducts[selectedCategory] || categoryProducts[selectedCategory].length === 0) && (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                Tidak ada produk dalam kategori ini.
              </div>
            )}
          </div>
        </div>
      ) : (
        // Show all categories with some products
        categories.map(category => (
          <div key={category.id} className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{category.name}</h2>
              <Link 
                to={`/products?category=${category.id}`}
                className="text-sm text-primary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categoryProducts[category.id]?.slice(0, 5).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {(!categoryProducts[category.id] || categoryProducts[category.id].length === 0) && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  Tidak ada produk dalam kategori ini.
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
