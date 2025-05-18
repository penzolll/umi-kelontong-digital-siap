
import { useState, useEffect } from "react";
import { useProductStore } from "@/lib/store";
import { Product } from "@/lib/types";
import { getProducts, clearApiCache } from "@/lib/api"; 

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
    // Fetch data from API
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        // Clear API cache to ensure fresh data
        clearApiCache('/api/products');
        
        // Get all products from API
        const response = await getProducts();
        const productsData = response.products || [];
        
        // Set products to the store
        setProducts(productsData);
        
        // Set featured and promo products
        setFeaturedProducts(productsData.filter(product => product.isFeatured));
        setPromoProducts(productsData.filter(product => product.isPromo));
      } catch (error) {
        console.error("Error loading product data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [setProducts]);
  
  return {
    featuredProducts,
    promoProducts,
    isLoading
  };
}
