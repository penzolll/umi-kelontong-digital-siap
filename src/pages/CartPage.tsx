
import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const item = items.find(item => item.product.id === productId);
    if (item && newQuantity > 0 && newQuantity <= item.product.stock) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    toast.success("Produk dihapus dari keranjang");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Keranjang belanja berhasil dikosongkan");
  };

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">Keranjang Belanja Anda Kosong</h1>
        <p className="mb-8 text-muted-foreground">
          Anda belum menambahkan produk apapun ke keranjang belanja.
        </p>
        <Link to="/products">
          <Button size="lg">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="p-4 bg-muted/50 hidden md:grid grid-cols-12 text-sm font-medium">
              <div className="col-span-6">Produk</div>
              <div className="col-span-2 text-center">Harga</div>
              <div className="col-span-2 text-center">Jumlah</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {items.map((item) => (
              <div key={item.product.id} className="border-b last:border-b-0">
                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Product Info - Mobile & Desktop */}
                  <div className="md:col-span-6 flex items-center">
                    <div className="h-16 w-16 bg-muted rounded overflow-hidden mr-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <Link 
                        to={`/product/${item.product.id}`}
                        className="font-medium line-clamp-2 hover:text-primary"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-sm text-destructive flex items-center mt-1 hover:underline md:hidden"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Hapus
                      </button>
                    </div>
                  </div>
                  
                  {/* Price - Desktop */}
                  <div className="hidden md:flex md:col-span-2 justify-center">
                    {formatCurrency(item.product.discountPrice || item.product.price)}
                  </div>
                  
                  {/* Mobile Price & Quantity */}
                  <div className="flex justify-between md:hidden">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Harga</div>
                      <div>{formatCurrency(item.product.discountPrice || item.product.price)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total</div>
                      <div className="font-medium">{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}</div>
                    </div>
                  </div>
                  
                  {/* Quantity - Desktop */}
                  <div className="md:col-span-2 flex items-center justify-center">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <span>-</span>
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            handleQuantityChange(item.product.id, val);
                          }
                        }}
                        className="h-8 w-12 mx-1 text-center"
                        min={1}
                        max={item.product.stock}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <span>+</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Total - Desktop */}
                  <div className="hidden md:flex md:col-span-2 justify-end font-medium">
                    {formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}
                  </div>
                  
                  {/* Remove button - Desktop */}
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="hidden md:block text-destructive hover:bg-destructive/10 rounded-full p-1 transition-colors"
                    title="Hapus produk"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Kosongkan Keranjang
            </Button>
            <Link to="/products">
              <Button variant="outline">
                Lanjutkan Belanja
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="p-4 bg-muted/50 font-medium">
              Ringkasan Belanja
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total ({items.reduce((acc, item) => acc + item.quantity, 0)} item)</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
              
              <Link to="/checkout">
                <Button className="w-full mt-2" size="lg">
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
