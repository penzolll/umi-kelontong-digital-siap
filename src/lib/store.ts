
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from './types';

/**
 * Interface untuk state dan method di cart store
 */
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/**
 * Store untuk mengelola keranjang belanja
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      /**
       * Menambahkan produk ke keranjang
       * @param product - Produk yang ditambahkan
       * @param quantity - Jumlah yang ditambahkan (default: 1)
       */
      addItem: (product, quantity = 1) => {
        if (quantity <= 0) {
          console.warn("Quantity must be greater than 0");
          return;
        }
        
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          
          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((item) => 
                item.product.id === product.id 
                  ? { ...item, quantity: item.quantity + quantity } 
                  : item
              ),
            };
          } else {
            // Add new item if it doesn't exist
            return {
              items: [...state.items, { product, quantity }],
            };
          }
        });
      },
      
      /**
       * Menghapus produk dari keranjang
       * @param productId - ID produk yang dihapus
       */
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      /**
       * Memperbarui jumlah produk di keranjang
       * @param productId - ID produk yang diperbarui
       * @param quantity - Jumlah baru
       */
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // When quantity is 0 or negative, remove the item instead
          return get().removeItem(productId);
        }
        
        set((state) => ({
          items: state.items.map((item) => 
            item.product.id === productId 
              ? { ...item, quantity } 
              : item
          ),
        }));
      },
      
      /**
       * Mengosongkan keranjang
       */
      clearCart: () => {
        set({ items: [] });
      },
      
      /**
       * Menghitung total item di keranjang
       * @returns Total jumlah item di keranjang
       */
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      /**
       * Menghitung total harga di keranjang
       * @returns Total harga di keranjang
       */
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

/**
 * Interface untuk state dan method di product store
 */
interface ProductStore {
  products: Product[];
  categories: string[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

/**
 * Store untuk mengelola produk
 */
export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  categories: [],
  
  /**
   * Mengatur list produk
   * @param products - List produk
   */
  setProducts: (products) => set({ 
    products,
    // Extract unique categories from products
    categories: [...new Set(products.map(p => p.category))]
  }),
  
  /**
   * Menambahkan produk baru
   * @param product - Produk baru
   */
  addProduct: (product) => set((state) => {
    if (state.products.some(p => p.id === product.id)) {
      console.warn(`Product with id ${product.id} already exists`);
      return state;
    }
    return { 
      products: [...state.products, product],
      categories: [...new Set([...state.categories, product.category])]
    };
  }),
  
  /**
   * Memperbarui produk
   * @param updatedProduct - Produk yang diperbarui
   */
  updateProduct: (updatedProduct) => set((state) => {
    if (!state.products.some(p => p.id === updatedProduct.id)) {
      console.warn(`Product with id ${updatedProduct.id} does not exist`);
      return state;
    }
    const newProducts = state.products.map((product) => 
      product.id === updatedProduct.id ? updatedProduct : product
    );
    return { 
      products: newProducts,
      categories: [...new Set(newProducts.map(p => p.category))]
    };
  }),
  
  /**
   * Menghapus produk
   * @param productId - ID produk yang dihapus
   */
  deleteProduct: (productId) => set((state) => {
    const newProducts = state.products.filter((product) => product.id !== productId);
    return { 
      products: newProducts,
      categories: [...new Set(newProducts.map(p => p.category))]
    };
  }),
}));
