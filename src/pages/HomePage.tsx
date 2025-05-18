
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { PromoSlider } from "@/components/PromoSlider";
import { Button } from "@/components/ui/button";
import { useHomePage } from "@/hooks/useHomePage";
import { Category } from "@/lib/types";
import { categories } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Halaman utama situs
 */
export default function HomePage() {
  const { featuredProducts, promoProducts, isLoading } = useHomePage();

  // Loading skeletons for products
  const ProductSkeleton = () => (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );

  return (
    <div className="flex-1">
      <PromoSlider />

      {/* Categories */}
      <section aria-labelledby="categories-heading" className="container py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 id="categories-heading" className="text-xl font-bold">Kategori</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
          {categories.map((category: Category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section aria-labelledby="featured-heading" className="container py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 id="featured-heading" className="text-xl font-bold">Produk Unggulan</h2>
          <Link to="/products" className="text-sm text-primary hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center py-8 text-muted-foreground">
              Tidak ada produk unggulan saat ini.
            </p>
          )}
        </div>
      </section>

      {/* Promo Products */}
      {(isLoading || promoProducts.length > 0) && (
        <section aria-labelledby="promo-heading" className="container py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="promo-heading" className="text-xl font-bold">Sedang Promo</h2>
            <Link to="/products?promo=true" className="text-sm text-primary hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              <>
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
              </>
            ) : (
              promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="container py-12">
        <div className="bg-muted rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Belanja dari rumah, terima di depan pintu</h2>
            <p className="text-muted-foreground">Gabung sekarang untuk mendapatkan pengalaman belanja terbaik</p>
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Buka Aplikasi UMI Store
          </Button>
        </div>
      </section>
    </div>
  );
}
