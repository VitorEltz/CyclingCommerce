import { Product } from "@shared/schema";
import ProductCard from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  isLoading?: boolean;
}

const ProductGrid = ({ products, viewMode, isLoading = false }: ProductGridProps) => {
  // Render loading skeletons
  if (isLoading) {
    return viewMode === "grid" ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductListSkeleton key={i} />
        ))}
      </div>
    );
  }

  return viewMode === "grid" ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListView key={product.id} product={product} />
      ))}
    </div>
  );
};

// List view variant of product card
const ProductListView = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 md:w-1/4 bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-48 sm:h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="sm:w-2/3 md:w-3/4 p-6">
          <div className="mb-2">
            {product.isNew && (
              <span className="inline-block bg-[#EE6C4D] text-white text-xs font-bold px-2 py-1 rounded mr-2">
                New
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="inline-block bg-[#3D5A80] text-white text-xs font-bold px-2 py-1 rounded">
                Sale
              </span>
            )}
          </div>
          
          <h3 className="font-heading font-bold text-xl mb-2">{product.name}</h3>
          
          {product.brand && (
            <div className="text-gray-500 mb-2">{product.brand}</div>
          )}
          
          {product.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-[#293241]">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-gray-400 line-through mr-2 text-sm">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
              ${product.price.toFixed(2)}
            </div>
            
            <div className="flex space-x-2">
              <button className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white py-2 px-4 rounded-md transition">
                Add to Cart
              </button>
              
              <button className="border border-gray-300 hover:border-[#3D5A80] text-[#3D5A80] p-2 rounded-md transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Grid view skeleton loader
const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

// List view skeleton loader
const ProductListSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-gray-200" />
        <div className="sm:w-2/3 md:w-3/4 p-6">
          <div className="mb-2">
            <div className="h-6 bg-gray-200 rounded w-16 inline-block" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-4" />
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
