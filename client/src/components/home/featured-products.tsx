import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";
import { motion } from "framer-motion";
import ProductCard from "@/components/shop/product-card";

const FeaturedProducts = () => {
  const { data: productsData, isLoading } = useQuery<{ products: Product[], total: number }>({
    queryKey: ['/api/products', { featured: true }],
  });

  const featuredProducts = productsData?.products || [];

  if (isLoading) {
    return (
      <section className="py-12 md:py-20 bg-[#E0FBFC]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-heading">Featured Products</h2>
            <Link href="/shop" className="text-[#EE6C4D] hover:text-[#EE6C4D]/80 font-medium inline-flex items-center transition">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden h-[350px] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-[#E0FBFC]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-heading">Featured Products</h2>
          <Link href="/shop" className="text-[#EE6C4D] hover:text-[#EE6C4D]/80 font-medium inline-flex items-center transition">
            View all <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
