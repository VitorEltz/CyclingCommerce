import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <section className="relative bg-[#3D5A80] text-white" style={{ height: "500px" }}>
      <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60" 
           style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}>
      </div>
      <div className="container mx-auto px-4 h-full flex items-center relative">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
            Gear Up for Your Next Ride
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Professional cycling equipment for riders of all levels. From mountain trails to city streets.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white font-bold shadow-lg">
              <Link href="/shop">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-[#E0FBFC] text-[#3D5A80] font-bold shadow-lg">
              <Link href="/shop">View Collections</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
