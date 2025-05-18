
import { useState } from "react";
import { Product } from "@/lib/types";
import { createProduct, updateProduct, deleteProduct, clearApiCache } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useProductUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  /**
   * Upload product image to server
   * @param file - Image file to upload
   * @returns Promise with image URL
   */
  const uploadImage = async (file: File): Promise<string> => {
    if (!file) return "";
    
    // Create form data
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      // Implement proper image upload to your EC2 server
      // This is a placeholder implementation
      
      // For demo purposes, create a temporary URL
      const imageUrl = URL.createObjectURL(file);
      
      // In production, you would upload to your server:
      /*
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      const data = await response.json();
      return data.imageUrl;
      */
      
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  /**
   * Save product to API
   * @param product - Product data
   * @param imageFile - Image file (if any)
   * @returns Promise with saved product
   */
  const saveProduct = async (product: Product, imageFile?: File | null): Promise<Product> => {
    setIsUploading(true);
    
    try {
      // Upload image if provided
      let finalProduct = { ...product };
      
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        finalProduct.image = imageUrl;
      }
      
      // Create or update product
      let response;
      
      if (product.id) {
        // Update existing product
        response = await updateProduct(product.id, finalProduct);
      } else {
        // Create new product
        response = await createProduct(finalProduct);
      }
      
      // Clear API cache to ensure fresh data
      clearApiCache('/api/products');
      
      return response.product;
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan produk. Silakan coba lagi.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  /**
   * Delete product from API
   * @param productId - Product ID
   */
  const removeProduct = async (productId: string): Promise<void> => {
    try {
      await deleteProduct(productId);
      
      // Clear API cache to ensure fresh data
      clearApiCache('/api/products');
      
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk. Silakan coba lagi.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return { 
    saveProduct, 
    removeProduct,
    isUploading 
  };
}
