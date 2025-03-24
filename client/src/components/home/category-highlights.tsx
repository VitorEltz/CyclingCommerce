import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Category } from "@shared/schema";
import { motion } from "framer-motion";

const CategoryHighlights = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center font-heading">Shop By Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden shadow-md h-64 bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center font-heading">Shop By Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories?.map((category, index) => (
            <motion.div
              key={category.id}
              className="relative rounded-lg overflow-hidden shadow-md group cursor-pointer h-64"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transition duration-300 group-hover:scale-105" 
                style={{ backgroundImage: `url(${category.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#293241]/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <h3 className="text-xl font-bold text-white mb-1 font-heading">{category.name}</h3>
                <p className="text-[#E0FBFC] text-sm mb-3">{category.description}</p>
                <Link href={`/shop/${category.slug}`} className="text-white inline-flex items-center font-medium hover:text-[#EE6C4D] transition-colors">
                  Explore <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryHighlights;
