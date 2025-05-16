
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Order } from "@/lib/types";
import { generateId } from "@/lib/utils";

const checkoutSchema = z.object({
  customerName: z.string().min(3, {
    message: "Nama harus diisi minimal 3 karakter",
  }),
  phone: z.string().min(10, {
    message: "Nomor telepon harus diisi minimal 10 karakter",
  }),
  address: z.string().min(10, {
    message: "Alamat harus diisi minimal 10 karakter",
  }),
  city: z.string().min(3, {
    message: "Kota harus diisi",
  }),
  paymentMethod: z.enum(["cod", "bank-transfer"], {
    required_error: "Metode pembayaran harus dipilih",
  }),
  notes: z.string().optional(),
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      city: "",
      paymentMethod: "cod",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    if (items.length === 0) {
      toast.error("Keranjang belanja kosong");
      return;
    }

    setIsSubmitting(true);

    // Simulate order creation
    setTimeout(() => {
      const order: Order = {
        id: generateId(),
        items: [...items],
        totalAmount: getTotalPrice(),
        customerName: values.customerName,
        address: `${values.address}, ${values.city}`,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // In a real app, this would send the order to a server
      console.log("Order placed:", order);
      
      // Clear the cart
      clearCart();
      
      // Show success message
      toast.success("Pesanan berhasil dibuat!");
      
      // Navigate to confirmation page
      navigate("/order-confirmation", { state: { orderId: order.id } });
      
      setIsSubmitting(false);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Keranjang Belanja Anda Kosong</h1>
        <p className="mb-8 text-muted-foreground">
          Anda perlu menambahkan produk ke keranjang sebelum checkout.
        </p>
        <Link to="/products">
          <Button size="lg">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Penerima</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Handphone</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 081234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Lengkap</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Masukkan alamat lengkap (jalan, RT/RW, nomor rumah, dll)" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kota/Kabupaten</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kota/kabupaten" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Metode Pembayaran</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="cod" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Cash on Delivery (Bayar saat barang tiba)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="bank-transfer" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Transfer Bank
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tambahkan catatan untuk pesanan Anda" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-4">
                    <Link to="/cart">
                      <Button variant="outline" type="button">
                        Kembali ke Keranjang
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Memproses..." : "Selesaikan Pesanan"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.quantity}x </span>
                      <span className="line-clamp-1">{item.product.name}</span>
                    </div>
                    <span>
                      {formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>Gratis</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
