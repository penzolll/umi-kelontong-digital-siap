
import { useState, useEffect } from "react";
import { useProductStore } from "@/lib/store";
import { Product } from "@/lib/types";
import { products } from "@/lib/data"; 

/**
 * Custom hook untuk halaman beranda
 * Menangani logika data produk untuk HomePages
 */
export function useHomePage() {
  const { setProducts } = useProductStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulasi loading data
    setIsLoading(true);
    
    try {
      // Set initial products to the store
      setProducts(products);
      
      // Set featured and promo products
      setFeaturedProducts(products.filter(product => product.isFeatured));
      setPromoProducts(products.filter(product => product.isPromo));
    } catch (error) {
      console.error("Error loading product data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setProducts]);
  
  return {
    featuredProducts,
    promoProducts,
    isLoading,
    categories: products
  };
}
