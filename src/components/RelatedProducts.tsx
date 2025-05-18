
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Produk Terkait</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="p-4">
              <div className="h-32 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full object-contain"
                  loading="lazy"
                  width="200"
                  height="200"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardTitle className="text-sm line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="mt-2 font-bold">
                {formatCurrency(product.discountPrice || product.price)}
              </CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
              <Link to={`/product/${product.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Detail
                </Button>
              </Link>
              <Button 
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => handleAddToCart(e, product)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
