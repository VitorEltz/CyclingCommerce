import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const CartPage = () => {
  const { cartItems, cartTotal, itemCount, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  
  const shippingThreshold = 100;
  const isShippingFree = cartTotal >= shippingThreshold;
  const shippingCost = isShippingFree ? 0 : 10;
  const estimatedTax = (cartTotal - promoDiscount) * 0.08; // 8% tax rate
  const orderTotal = cartTotal - promoDiscount + shippingCost + estimatedTax;

  const handleApplyPromo = () => {
    if (!promoCode) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    // Simulate API call to validate promo code
    setTimeout(() => {
      if (promoCode.toUpperCase() === "TRAILBLAZER") {
        // Apply 20% discount for the "TRAILBLAZER" promo code
        setPromoDiscount(cartTotal * 0.2);
      } else {
        setPromoError("Invalid promo code");
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3D5A80]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Cart | CyclePro</title>
        </Helmet>
        
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mb-6">
                <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto">
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4 font-heading">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button asChild className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Your Cart | CyclePro</title>
      </Helmet>
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 font-heading">Your Cart</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Cart Header */}
                <div className="px-6 py-4 border-b hidden md:grid md:grid-cols-12 text-sm font-medium text-gray-500">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                {/* Cart Items */}
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Product */}
                      <div className="md:col-span-6 mb-4 md:mb-0 flex">
                        <div className="w-20 h-20 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                          {item.product.imageUrl && (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <Link href={`/products/${item.product.slug}`} className="font-medium text-[#293241] hover:text-[#3D5A80]">
                            {item.product.name}
                          </Link>
                          {item.product.brand && (
                            <p className="text-sm text-gray-500">{item.product.brand}</p>
                          )}
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-500 hover:text-red-700 flex items-center mt-2 md:hidden"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="md:col-span-2 md:text-center flex justify-between md:block mb-4 md:mb-0">
                        <span className="md:hidden text-gray-500">Price:</span>
                        <span className="font-medium">
                          {formatCurrency(item.product.price)}
                        </span>
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:col-span-2 md:text-center flex justify-between md:block mb-4 md:mb-0">
                        <span className="md:hidden text-gray-500">Quantity:</span>
                        <div className="flex items-center border rounded md:inline-flex">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 h-8 w-8 rounded-none border-r"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 h-8 w-8 rounded-none border-l"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="md:col-span-2 md:text-right flex justify-between md:block">
                        <span className="md:hidden text-gray-500">Total:</span>
                        <div className="flex items-center justify-end">
                          <span className="font-medium text-[#293241]">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="ml-4 text-gray-400 hover:text-red-500 hidden md:block"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Cart Actions */}
                <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => clearCart()}
                    className="text-sm"
                  >
                    Clear Cart
                  </Button>
                  <Link href="/shop" className="flex items-center text-[#3D5A80] hover:text-[#3D5A80]/80 text-sm font-medium">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4 font-heading">Order Summary</h2>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (TRAILBLAZER)</span>
                      <span>-{formatCurrency(promoDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {isShippingFree ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Tax</span>
                    <span>{formatCurrency(estimatedTax)}</span>
                  </div>
                </div>
                
                {/* Free shipping message */}
                {!isShippingFree && (
                  <div className="mb-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-xs text-blue-700">
                        Add {formatCurrency(shippingThreshold - cartTotal)} more to qualify for free shipping!
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Promo code */}
                <div className="mb-6">
                  <label htmlFor="promo" className="block text-sm font-medium mb-2">
                    Promo Code
                  </label>
                  <div className="flex">
                    <Input
                      id="promo"
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button 
                      onClick={handleApplyPromo} 
                      disabled={isApplyingPromo}
                      className="rounded-l-none bg-[#3D5A80] hover:bg-[#3D5A80]/90"
                    >
                      {isApplyingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" /> 
                      {promoError}
                    </p>
                  )}
                  {promoDiscount > 0 && (
                    <p className="text-green-600 text-xs mt-1">
                      20% discount applied successfully!
                    </p>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                {/* Order total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-[#293241]">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
                
                {/* Checkout button */}
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white font-bold py-3"
                >
                  Proceed to Checkout
                </Button>
                
                {!user && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <Link href="/auth" className="text-[#3D5A80] hover:underline">
                      Sign in
                    </Link>{" "}
                    to earn points and track your order
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
