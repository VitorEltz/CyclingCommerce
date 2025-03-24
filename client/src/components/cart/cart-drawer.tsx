import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter, 
  SheetClose 
} from "@/components/ui/sheet";
import { Trash2, Minus, Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CartDrawer = () => {
  const { 
    cartItems, 
    cartTotal, 
    itemCount, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const shippingThreshold = 100;
  const isShippingFree = cartTotal >= shippingThreshold;
  const estimatedTax = cartTotal * 0.08; // 8% tax rate
  const orderTotal = cartTotal + (isShippingFree ? 0 : 10) + estimatedTax;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="border-b pb-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl font-bold font-heading">
              Your Cart ({itemCount})
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-4">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2 3h2l2.6 13.8A2 2 0 0 0 8.6 19h10.8a2 2 0 0 0 2-1.2L23 8H6" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6">Looks like you haven't added any items to your cart yet.</p>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-auto py-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex mb-4 pb-4 border-b">
                  <div className="w-20 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.product.imageUrl && (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-[#293241]">{item.product.name}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-[#F44336]"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {item.product.categoryId && (
                      <p className="text-sm text-gray-500">{item.product.brand}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="px-2 py-1 h-8 rounded-none border-r"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="px-2 py-1 h-8 rounded-none border-l"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold">
                        {formatCurrency(item.product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <SheetFooter className="border-t pt-4 flex-shrink-0 mt-auto">
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{isShippingFree ? 'Free' : formatCurrency(10)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(estimatedTax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
                
                <Button 
                  className="w-full bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
                
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    <Link href="/cart" className="w-full">View Cart</Link>
                  </Button>
                </SheetClose>
                
                {!user && (
                  <div className="text-center text-sm mt-4 text-muted-foreground">
                    <Link href="/auth" className="text-[#3D5A80] hover:underline">
                      Sign in
                    </Link>{" "}
                    to save your cart and earn rewards
                  </div>
                )}
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
