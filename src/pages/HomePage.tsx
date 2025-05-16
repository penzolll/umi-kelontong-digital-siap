
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { PromoSlider } from "@/components/PromoSlider";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/lib/store";
import { Product, Category } from "@/lib/types";
import { products, categories } from "@/lib/data";

export default function HomePage() {
  const { setProducts } = useProductStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Set initial products to the store
    setProducts(products);
    
    // Set featured and promo products
    setFeaturedProducts(products.filter(product => product.isFeatured));
    setPromoProducts(products.filter(product => product.isPromo));
  }, [setProducts]);

  return (
    <div className="flex-1">
      <PromoSlider />

      {/* Categories */}
      <div className="container py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Kategori</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
          {categories.map((category: Category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produk Unggulan</h2>
          <Link to="/products" className="text-sm text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Promo Products */}
      {promoProducts.length > 0 && (
        <div className="container py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Sedang Promo</h2>
            <Link to="/products?promo=true" className="text-sm text-primary hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Call to action */}
      <div className="container py-12">
        <div className="bg-muted rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Belanja dari rumah, terima di depan pintu</h2>
            <p className="text-muted-foreground">Gabung sekarang untuk mendapatkan pengalaman belanja terbaik</p>
          </div>
          <Button size="lg" className="bg-umi-blue hover:bg-blue-700">
            Buka Aplikasi UMI Store
          </Button>
        </div>
      </div>
    </div>
  );
}
