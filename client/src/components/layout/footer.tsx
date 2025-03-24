import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#3D5A80] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">
              Cycle<span className="text-[#EE6C4D]">Pro</span>
            </h3>
            <p className="mb-4 text-[#E0FBFC]">We provide premium cycling equipment and accessories for enthusiasts and professionals alike.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#EE6C4D] transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#EE6C4D] transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#EE6C4D] transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#EE6C4D] transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 font-heading">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop/road-bikes" className="text-[#E0FBFC] hover:text-white transition">
                  Road Bikes
                </Link>
              </li>
              <li>
                <Link href="/shop/mountain-bikes" className="text-[#E0FBFC] hover:text-white transition">
                  Mountain Bikes
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" className="text-[#E0FBFC] hover:text-white transition">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/shop/apparel" className="text-[#E0FBFC] hover:text-white transition">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-[#E0FBFC] hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?sale=true" className="text-[#E0FBFC] hover:text-white transition">
                  Sale Items
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 font-heading">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-[#E0FBFC] hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-[#E0FBFC] hover:text-white transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-[#E0FBFC] hover:text-white transition">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#E0FBFC] hover:text-white transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-[#E0FBFC] hover:text-white transition">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4 font-heading">Stay Updated</h4>
            <p className="mb-4 text-[#E0FBFC]">Subscribe to our newsletter for the latest products and deals.</p>
            <form className="mb-4">
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white text-[#293241] rounded-l-md focus:outline-none w-full"
                />
                <Button type="submit" className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 px-4 py-2 rounded-r-md transition">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
            <p className="text-sm text-[#E0FBFC]">By subscribing, you agree to our Privacy Policy.</p>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#E0FBFC] text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} CyclePro. All rights reserved.
            </p>
            <div className="flex flex-wrap space-x-4">
              <Link href="/privacy" className="text-[#E0FBFC] hover:text-white text-sm transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#E0FBFC] hover:text-white text-sm transition">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-[#E0FBFC] hover:text-white text-sm transition">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
