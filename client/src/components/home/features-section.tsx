import { motion } from "framer-motion";
import { Truck, RefreshCw, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $100"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy"
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "Your data is protected"
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "Call or email us anytime"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-[#E0FBFC]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="bg-[#3D5A80] p-4 rounded-full text-white mr-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold font-heading">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
