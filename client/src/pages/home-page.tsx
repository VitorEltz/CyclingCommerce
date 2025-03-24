import HeroBanner from "@/components/home/hero-banner";
import CategoryHighlights from "@/components/home/category-highlights";
import FeaturedProducts from "@/components/home/featured-products";
import PromotionSection from "@/components/home/promotion-section";
import FeaturesSection from "@/components/home/features-section";
import { Helmet } from "react-helmet";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>CyclePro - Premium Cycling Gear</title>
        <meta name="description" content="Professional cycling equipment for riders of all levels. From mountain trails to city streets." />
      </Helmet>
      
      <HeroBanner />
      <CategoryHighlights />
      <FeaturedProducts />
      <PromotionSection />
      <FeaturesSection />
    </>
  );
};

export default HomePage;
