
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  
  // Redirect if no order ID is present (direct access)
  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);
  
  if (!orderId) {
    return null;
  }

  return (
    <div className="container py-12 max-w-lg mx-auto text-center">
      <div className="bg-green-100 inline-flex items-center justify-center rounded-full p-6 mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Pesanan Berhasil Dibuat!</h1>
      
      <p className="text-lg mb-2">
        Terima kasih telah berbelanja di UMI Store.
      </p>
      
      <p className="text-muted-foreground mb-8">
        ID Pesanan Anda: <span className="font-mono font-medium">{orderId}</span>
      </p>
      
      <div className="bg-muted p-6 rounded-lg mb-8 text-left">
        <h2 className="font-medium mb-4">Informasi Selanjutnya:</h2>
        
        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
          <li>Pesanan Anda akan segera diproses oleh tim kami.</li>
          <li>Anda akan menerima konfirmasi pesanan melalui SMS atau WhatsApp.</li>
          <li>Untuk pembayaran transfer bank, silakan transfer ke rekening yang tertera pada pesan konfirmasi.</li>
          <li>Untuk pertanyaan lebih lanjut, silakan hubungi layanan pelanggan kami di (021) 123-4567.</li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/">
          <Button variant="default" size="lg">
            Kembali ke Beranda
          </Button>
        </Link>
        
        <Link to="/products">
          <Button variant="outline" size="lg">
            Lanjutkan Belanja
          </Button>
        </Link>
      </div>
    </div>
  );
}
