
import { Link } from "react-router-dom";
import { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group relative rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md"
    >
      {(product.isPromo || product.discountPrice) && (
        <Badge className="absolute top-2 right-2 bg-umi-orange" variant="secondary">
          Promo
        </Badge>
      )}
      
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        
        <div className="mt-2 flex flex-col">
          {product.discountPrice ? (
            <div className="space-x-2 flex items-center">
              <span className="text-lg font-bold">{formatCurrency(product.discountPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
            </div>
          ) : (
            <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">
            Stok: {product.stock}
          </div>
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full mt-3"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          <span>Tambah</span>
        </Button>
      </div>
    </Link>
  );
}
