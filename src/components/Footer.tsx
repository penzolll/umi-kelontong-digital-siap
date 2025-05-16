
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <span className="text-xl font-bold text-umi-blue mr-1">UMI</span>
              <span className="text-xl font-bold text-umi-orange">Store</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Toko kelontong online terlengkap dengan pengiriman cepat ke seluruh Indonesia.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Kategori</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=sembako" className="text-muted-foreground hover:text-foreground">
                  Sembako
                </Link>
              </li>
              <li>
                <Link to="/products?category=air-minum" className="text-muted-foreground hover:text-foreground">
                  Air Minum
                </Link>
              </li>
              <li>
                <Link to="/products?category=mie-instan" className="text-muted-foreground hover:text-foreground">
                  Mie Instan
                </Link>
              </li>
              <li>
                <Link to="/products?category=beras" className="text-muted-foreground hover:text-foreground">
                  Beras
                </Link>
              </li>
              <li>
                <Link to="/products?category=obat-obatan" className="text-muted-foreground hover:text-foreground">
                  Obat-obatan
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Informasi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-foreground">
                  Informasi Pengiriman
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Kontak</h3>
            <address className="not-italic text-sm text-muted-foreground">
              <p>Jl. Kelontong Raya No. 123</p>
              <p>Jakarta, Indonesia</p>
              <p className="mt-2">Phone: (021) 123-4567</p>
              <p>Email: info@umistore.com</p>
            </address>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UMI Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
