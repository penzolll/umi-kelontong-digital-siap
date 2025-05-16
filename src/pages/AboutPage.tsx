
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Tentang UMI Store</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-lg mb-4">
            UMI Store adalah toko kelontong online yang menyediakan berbagai kebutuhan sehari-hari dengan harga terjangkau dan pengiriman cepat.
          </p>
          
          <p className="text-muted-foreground mb-4">
            Didirikan pada tahun 2020, UMI Store memiliki misi untuk memudahkan masyarakat Indonesia dalam memenuhi kebutuhan rumah tangga tanpa perlu keluar rumah. Kami berkomitmen untuk memberikan pelayanan terbaik dengan pilihan produk berkualitas dan harga yang kompetitif.
          </p>
          
          <p className="text-muted-foreground mb-6">
            Dengan jaringan pemasok yang luas dan sistem pengiriman yang efisien, UMI Store mampu menjangkau berbagai wilayah di Indonesia. Kami terus berkembang dan berinovasi untuk memberikan pengalaman berbelanja online yang nyaman dan memuaskan.
          </p>
          
          <Link to="/products">
            <Button>Mulai Belanja Sekarang</Button>
          </Link>
        </div>
        
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <img
            src="/placeholder.svg"
            alt="UMI Store"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="bg-card border rounded-lg p-6 md:p-8 mb-10">
        <h2 className="text-2xl font-bold mb-6">Keunggulan UMI Store</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary text-xl font-bold">1</span>
            </div>
            <h3 className="font-bold mb-2">Produk Berkualitas</h3>
            <p className="text-sm text-muted-foreground">
              Semua produk yang kami jual dipilih dengan teliti untuk memastikan kualitas terbaik.
            </p>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary text-xl font-bold">2</span>
            </div>
            <h3 className="font-bold mb-2">Pengiriman Cepat</h3>
            <p className="text-sm text-muted-foreground">
              Kami memiliki sistem pengiriman yang cepat dan efisien untuk memastikan pesanan Anda tiba tepat waktu.
            </p>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary text-xl font-bold">3</span>
            </div>
            <h3 className="font-bold mb-2">Harga Bersaing</h3>
            <p className="text-sm text-muted-foreground">
              Kami menawarkan harga yang kompetitif dan sering mengadakan promo menarik untuk pelanggan kami.
            </p>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary text-xl font-bold">4</span>
            </div>
            <h3 className="font-bold mb-2">Layanan Pelanggan</h3>
            <p className="text-sm text-muted-foreground">
              Tim layanan pelanggan kami siap membantu Anda dengan pertanyaan dan masalah yang mungkin Anda miliki.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Hubungi Kami</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold mb-2">Alamat</h3>
            <address className="not-italic text-muted-foreground mb-4">
              <p>Jl. Kelontong Raya No. 123</p>
              <p>Jakarta Selatan, Indonesia 12345</p>
            </address>
            
            <h3 className="font-bold mb-2">Kontak</h3>
            <p className="text-muted-foreground mb-1">Telepon: (021) 123-4567</p>
            <p className="text-muted-foreground mb-4">Email: info@umistore.com</p>
            
            <h3 className="font-bold mb-2">Jam Operasional</h3>
            <p className="text-muted-foreground">
              Senin - Jumat: 08.00 - 20.00 WIB<br />
              Sabtu: 09.00 - 18.00 WIB<br />
              Minggu: 10.00 - 16.00 WIB
            </p>
          </div>
          
          <form className="bg-card border rounded-lg p-6">
            <h3 className="font-bold mb-4">Kirim Pesan</h3>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm mb-1">Nama</label>
              <input
                type="text"
                id="name"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                placeholder="Nama lengkap"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm mb-1">Email</label>
              <input
                type="email"
                id="email"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                placeholder="email@example.com"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm mb-1">Pesan</label>
              <textarea
                id="message"
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2"
                placeholder="Tulis pesan Anda di sini..."
              ></textarea>
            </div>
            
            <Button className="w-full">Kirim Pesan</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
