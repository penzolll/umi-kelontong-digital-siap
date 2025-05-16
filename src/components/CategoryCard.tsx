
import { Link } from "react-router-dom";
import { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="flex flex-col items-center group"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center mb-2 transition-all group-hover:shadow-md border">
        <img
          src={category.image}
          alt={category.name}
          className="w-10 h-10 md:w-12 md:h-12 object-contain"
        />
      </div>
      <span className="text-xs md:text-sm text-center">{category.name}</span>
    </Link>
  );
}
