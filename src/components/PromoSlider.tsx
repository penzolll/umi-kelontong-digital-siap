
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const promos = [
  {
    id: 1,
    title: "Promo Akhir Bulan",
    description: "Diskon 15% untuk semua produk sembako",
    image: "/placeholder.svg",
    url: "/products?category=sembako",
    color: "bg-gradient-to-r from-blue-500 to-blue-700",
  },
  {
    id: 2,
    title: "Flash Sale Mie Instan",
    description: "Beli 3 Gratis 1 untuk semua mie instan",
    image: "/placeholder.svg",
    url: "/products?category=mie-instan",
    color: "bg-gradient-to-r from-orange-500 to-orange-700",
  },
  {
    id: 3,
    title: "Promo Minuman Segar",
    description: "Diskon 10% untuk semua air mineral",
    image: "/placeholder.svg",
    url: "/products?category=air-minum",
    color: "bg-gradient-to-r from-green-500 to-green-700",
  },
];

export function PromoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === promos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? promos.length - 1 : prev - 1));
  };

  return (
    <div className="relative rounded-lg overflow-hidden h-44 md:h-64 lg:h-72 mb-8">
      <div
        className="h-full w-full transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          display: "flex",
        }}
      >
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`min-w-full h-full flex ${promo.color} relative`}
          >
            <div className="container flex items-center h-full">
              <div className="text-white p-4 md:p-8 max-w-md">
                <h2 className="text-xl md:text-3xl font-bold text-shadow mb-2">
                  {promo.title}
                </h2>
                <p className="text-sm md:text-base mb-4">{promo.description}</p>
                <a
                  href={promo.url}
                  className="inline-block px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Belanja Sekarang
                </a>
              </div>
            </div>
            <div className="absolute right-0 h-full w-1/3 opacity-50 flex justify-center items-center">
              <img
                src={promo.image}
                alt={promo.title}
                className="object-contain h-4/5"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {promos.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
