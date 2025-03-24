import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Heart, Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Calculate full and half stars based on rating
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative">
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-[#EE6C4D] text-white">New</Badge>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Badge className="absolute top-2 left-2 bg-[#3D5A80] text-white">Sale</Badge>
          )}
          <button 
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 bg-white p-1.5 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-[#EE6C4D]'}`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <div className="w-full h-48 bg-gray-100">
            {product.imageUrl && (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">
            {/* This would ideally display the category name */}
            {product.brand}
          </div>
          <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-bold text-[#293241]">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-gray-400 line-through mr-2 text-sm">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {formatCurrency(product.price)}
            </div>
            <div className="flex items-center">
              {[...Array(fullStars)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
              ))}
              {hasHalfStar && (
                <StarHalf className="h-4 w-4 fill-current text-yellow-400" />
              )}
              {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400" />
              ))}
              {product.reviewCount > 0 && (
                <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
              )}
            </div>
          </div>
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white"
          >
            Add to Cart
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
