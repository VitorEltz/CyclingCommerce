import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const PromotionSection = () => {
  return (
    <section className="py-12 md:py-20 bg-[#3D5A80]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 mb-8 md:mb-0 md:pr-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#98C1D9] font-medium mb-2 inline-block">LIMITED TIME OFFER</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Get 20% Off Mountain Bikes</h2>
            <p className="text-[#E0FBFC] mb-6">
              Embrace the adventure with our premium mountain bike collection. Use code <span className="font-bold text-white">TRAILBLAZER</span> at checkout.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white font-bold shadow-lg">
                <Link href="/shop/mountain-bikes">Shop Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#3D5A80] font-bold">
                <Link href="/shop/mountain-bikes">Learn More</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
              alt="Mountain Bike Promotion" 
              className="rounded-lg shadow-lg w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromotionSection;
