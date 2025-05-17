
import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCartStore } from "@/lib/store";
import { products, categories } from "@/lib/data";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { getProductDetails, IS_DEMO_MODE } from "@/lib/api";

// Lazy load the related products component
const RelatedProducts = lazy(() => import("@/components/RelatedProducts"));

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addItem } = useCartStore();

  // Prefetch product data
  useEffect(() => {
    // Add page metadata for SEO
    document.title = product ? `${product.name} | UMI Store` : "Product Detail | UMI Store";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && product) {
      metaDescription.setAttribute('content', product.description?.substring(0, 160) || 'Detail produk UMI Store');
    }
    
    // Clean up function
    return () => {
      document.title = "UMI Store - Toko Kelontong Online";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'UMI Store - Toko kelontong online terlengkap dengan pengiriman cepat');
      }
    };
  }, [product]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (IS_DEMO_MODE) {
          // For demo: use static data but with a slight delay to simulate network
          const fetchStart = performance.now();
          
          const foundProduct = products.find(p => p.id === id);
          
          if (!foundProduct) {
            setError("Produk tidak ditemukan");
            return;
          }
          
          setProduct(foundProduct);
          
          // Find related products (same category)
          const related = products
            .filter(p => p.category === foundProduct.category && p.id !== id)
            .slice(0, 4);
          setRelatedProducts(related);
          
          console.log(`Demo product fetch took ${performance.now() - fetchStart}ms`);
        } else {
          // For production: use API with performance measurement
          const fetchStart = performance.now();
          const data = await getProductDetails(id || '');
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          console.log(`API product fetch took ${performance.now() - fetchStart}ms`);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      if (product && value <= product.stock) {
        setQuantity(value);
      }
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${quantity} ${product.name} ditambahkan ke keranjang`);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-80"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h1 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h1>
        <p className="mb-8 text-muted-foreground">
          {error || "Produk yang Anda cari tidak tersedia atau telah dihapus."}
        </p>
        <Link to="/products">
          <Button>Kembali ke Daftar Produk</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-4">
        <Link to="/products" className="text-primary hover:underline text-sm">
          &larr; Kembali ke Daftar Produk
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image with loading optimization */}
        <div className="bg-white rounded-lg border overflow-hidden flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="object-contain max-h-[400px] w-full"
            loading="eager"
            width="600"
            height="600"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-sm text-muted-foreground mb-4">
            Kategori: {categories.find(c => c.id === product.category)?.name || product.category}
          </div>

          <div className="mb-6">
            {product.discountPrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold">{formatCurrency(product.discountPrice)}</span>
                <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.price)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            )}
          </div>

          <div className="flex items-center mb-6">
            <Package className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-medium mb-2">Deskripsi</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="font-medium mb-2">Jumlah</h2>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                className="w-20 mx-2 text-center"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={product.stock}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="lg"
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Tambahkan ke Keranjang
          </Button>
        </div>
      </div>

      {/* Related Products - Lazy loaded */}
      {relatedProducts.length > 0 && (
        <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 rounded-lg"></div>}>
          <RelatedProducts products={relatedProducts} />
        </Suspense>
      )}
    </div>
  );
}
