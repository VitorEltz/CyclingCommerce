import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  ShoppingCart, 
  ChevronDown, 
  Search, 
  Menu, 
  X, 
  LogOut,
  UserCircle, 
  ShoppingBag,
  Settings 
} from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { openCart, itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileSearchOpen(false);
  };
  
  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };
  
  const toggleMobileSubmenu = () => {
    setMobileSubMenuOpen(!mobileSubMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#3D5A80] font-heading">
              Cycle<span className="text-[#EE6C4D]">Pro</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" 
              className={`text-[#293241] hover:text-[#EE6C4D] font-medium transition duration-150 py-2 ${location === '/' ? 'text-[#EE6C4D]' : ''}`}>
              Home
            </Link>
            <div className="relative group">
              <Link href="/shop" 
                className={`text-[#293241] hover:text-[#EE6C4D] font-medium transition duration-150 py-2 flex items-center ${location.startsWith('/shop') ? 'text-[#EE6C4D]' : ''}`}>
                Shop <ChevronDown className="h-4 w-4 ml-1" />
              </Link>
              <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                <div className="py-1">
                  <Link href="/shop/road-bikes" className="block px-4 py-2 text-sm text-[#293241] hover:bg-[#98C1D9] hover:text-white">
                    Road Bikes
                  </Link>
                  <Link href="/shop/mountain-bikes" className="block px-4 py-2 text-sm text-[#293241] hover:bg-[#98C1D9] hover:text-white">
                    Mountain Bikes
                  </Link>
                  <Link href="/shop/accessories" className="block px-4 py-2 text-sm text-[#293241] hover:bg-[#98C1D9] hover:text-white">
                    Accessories
                  </Link>
                  <Link href="/shop/apparel" className="block px-4 py-2 text-sm text-[#293241] hover:bg-[#98C1D9] hover:text-white">
                    Apparel
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/about" 
              className={`text-[#293241] hover:text-[#EE6C4D] font-medium transition duration-150 py-2 ${location === '/about' ? 'text-[#EE6C4D]' : ''}`}>
              About
            </Link>
            <Link href="/contact" 
              className={`text-[#293241] hover:text-[#EE6C4D] font-medium transition duration-150 py-2 ${location === '/contact' ? 'text-[#EE6C4D]' : ''}`}>
              Contact
            </Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="relative hidden md:block">
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="bg-[#E0FBFC] rounded-full py-2 pl-4 pr-10 w-64 focus:outline-none focus:ring-2 focus:ring-[#EE6C4D]"
              />
              <Button variant="ghost" size="icon" className="absolute right-0 top-0 rounded-full h-full">
                <Search className="h-5 w-5 text-[#293241]" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-[#293241] hover:text-[#EE6C4D]">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <UserCircle className="h-4 w-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/orders" className="flex items-center cursor-pointer">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          <span>Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="icon" className="text-[#293241] hover:text-[#EE6C4D]">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              
              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#293241] hover:text-[#EE6C4D] relative" 
                onClick={openCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#EE6C4D] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-[#293241]" 
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Search - Hidden by default */}
        <div className={`md:hidden pb-4 ${mobileSearchOpen ? 'block' : 'hidden'}`}>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              className="bg-[#E0FBFC] rounded-full py-2 pl-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-[#EE6C4D]"
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 rounded-full h-full">
              <Search className="h-5 w-5 text-[#293241]" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu - Hidden by default */}
      <div className={`md:hidden bg-white shadow-md ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="container mx-auto px-4 py-3">
          <Link href="/" className="block py-2 text-[#293241] hover:text-[#EE6C4D] font-medium">
            Home
          </Link>
          <div className="py-2">
            <div 
              className="flex justify-between items-center text-[#293241] hover:text-[#EE6C4D] font-medium cursor-pointer"
              onClick={toggleMobileSubmenu}
            >
              <span>Shop</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileSubMenuOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className={`pl-4 ${mobileSubMenuOpen ? 'block' : 'hidden'}`}>
              <Link href="/shop/road-bikes" className="block py-2 text-[#293241] hover:text-[#EE6C4D]">
                Road Bikes
              </Link>
              <Link href="/shop/mountain-bikes" className="block py-2 text-[#293241] hover:text-[#EE6C4D]">
                Mountain Bikes
              </Link>
              <Link href="/shop/accessories" className="block py-2 text-[#293241] hover:text-[#EE6C4D]">
                Accessories
              </Link>
              <Link href="/shop/apparel" className="block py-2 text-[#293241] hover:text-[#EE6C4D]">
                Apparel
              </Link>
            </div>
          </div>
          <Link href="/about" className="block py-2 text-[#293241] hover:text-[#EE6C4D] font-medium">
            About
          </Link>
          <Link href="/contact" className="block py-2 text-[#293241] hover:text-[#EE6C4D] font-medium">
            Contact
          </Link>
          <Button 
            variant="outline" 
            className="w-full mt-2 flex items-center justify-center"
            onClick={toggleMobileSearch}
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
