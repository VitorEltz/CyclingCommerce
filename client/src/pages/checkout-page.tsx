import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { addressSchema, type Address, type OrderItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form schema for checkout
const checkoutFormSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  sameAsShipping: z.boolean().default(true),
  paymentMethod: z.enum(["credit_card", "paypal"]),
  saveInfo: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CheckoutPage = () => {
  const [, navigate] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get cart data
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Shipping calculations
  const shippingThreshold = 100;
  const isShippingFree = cartTotal >= shippingThreshold;
  const shippingCost = isShippingFree ? 0 : 10;
  const estimatedTax = cartTotal * 0.08; // 8% tax rate
  const orderTotal = cartTotal + shippingCost + estimatedTax;

  // Form setup with default values
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
      billingAddress: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
      sameAsShipping: true,
      paymentMethod: "credit_card",
      saveInfo: false,
    },
    mode: "onChange",
  });

  // Watch for "same as shipping" checkbox changes
  const sameAsShipping = form.watch("sameAsShipping");

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (order) => {
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been confirmed.`,
      });
      navigate(`/order-confirmation/${order.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // If same as shipping is selected, use shipping address for billing
    const finalData = {
      ...data,
      billingAddress: data.sameAsShipping ? data.shippingAddress : data.billingAddress,
      total: orderTotal,
    };

    createOrderMutation.mutate(finalData);
  };

  // Redirect if cart is empty (except during loading)
  if (!isCartLoading && cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  // Loading state
  if (isCartLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3D5A80]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | CyclePro</title>
      </Helmet>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 font-heading">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Checkout Form */}
              <div className="lg:w-2/3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-bold mb-6 font-heading">Shipping Address</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingAddress.lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.address1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1 *</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.address2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2</FormLabel>
                              <FormControl>
                                <Input placeholder="Apt 4B" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingAddress.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province *</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingAddress.country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="UK">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold font-heading">Billing Address</h2>
                        <FormField
                          control={form.control}
                          name="sameAsShipping"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer">
                                Same as shipping address
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {!sameAsShipping && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="billingAddress.firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingAddress.lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="billingAddress.address1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1 *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="billingAddress.address2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 2</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apt 4B" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="billingAddress.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingAddress.state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State/Province *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="billingAddress.postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingAddress.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country *</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="US">United States</SelectItem>
                                      <SelectItem value="CA">Canada</SelectItem>
                                      <SelectItem value="UK">United Kingdom</SelectItem>
                                      <SelectItem value="AU">Australia</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="billingAddress.phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="(123) 456-7890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-bold mb-6 font-heading">Payment Method</h2>

                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className="flex items-center space-x-2 border rounded-md p-4">
                                  <RadioGroupItem value="credit_card" id="credit_card" />
                                  <label htmlFor="credit_card" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Credit/Debit Card</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      Pay securely with your credit card
                                    </div>
                                  </label>
                                  <div className="flex space-x-2">
                                    <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                                      <rect width="40" height="24" rx="4" fill="#016FD0" />
                                      <path d="M20 18H16V6H20V18Z" fill="white" />
                                      <path d="M16.5 12C16.5 9.5 18 7.5 20 6H18C15.5 6 13.5 8.5 13.5 12C13.5 15.5 15.5 18 18 18H20C18 16.5 16.5 14.5 16.5 12Z" fill="white" />
                                      <path d="M26 18H24V17.5C23.5 18 22.5 18 22 18C19.5 18 18 16 18 13.5C18 11 19.5 9 22 9C22.5 9 23.5 9 24 9.5V6H26V18ZM22.5 16C24 16 24.5 14.5 24.5 13.5C24.5 12.5 24 11 22.5 11C21 11 20.5 12.5 20.5 13.5C20.5 14.5 21 16 22.5 16Z" fill="white" />
                                    </svg>
                                    <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                                      <rect width="40" height="24" rx="4" fill="#EB001B" />
                                      <circle cx="16" cy="12" r="6" fill="#EB001B" />
                                      <circle cx="24" cy="12" r="6" fill="#F79E1B" />
                                      <path d="M20 8C22 10 22 14 20 16C18 14 18 10 20 8Z" fill="#FF5F00" />
                                    </svg>
                                    <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                                      <rect width="40" height="24" rx="4" fill="#1434CB" />
                                      <path d="M15.5 17L16.5 7H19.5L18.5 17H15.5Z" fill="white" />
                                      <path d="M25.5 7.5C24.5 7 23 7 22 7.5C22 7.5 22 7 20.5 7H18L17 15.5V16H19C19 15.5 20.5 10.5 20.5 10.5C20.5 11 22 11 22.5 10.5C22.5 10.5 22 15 22 16C22.5 16.5 24 16.5 25 16C25.5 16 26.5 7.5 25.5 7.5Z" fill="white" />
                                      <path d="M28 11C28 8.5 25.5 7 23.5 7L22 16C24 16.5 28 14.5 28 11Z" fill="white" />
                                    </svg>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 border rounded-md p-4">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <label htmlFor="paypal" className="flex-1 cursor-pointer">
                                    <div className="font-medium">PayPal</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      Pay with your PayPal account
                                    </div>
                                  </label>
                                  <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
                                    <rect width="40" height="24" rx="4" fill="#F0F0F0" />
                                    <path d="M12 8H15C16.6 8 17.3 8.8 17.2 10C17 12.5 15.5 13.5 13.5 13.5H12.7L12.3 16H10L11 8ZM12.7 9.3L12.4 11.8H13.4C14.4 11.8 14.9 11.3 15 10C15.1 9.5 14.8 9.3 14.2 9.3H12.7Z" fill="#253B80" />
                                    <path d="M17.5 8H20.5C22.1 8 22.8 8.8 22.7 10C22.5 12.5 21 13.5 19 13.5H18.2L17.8 16H15.5L16.5 8ZM18.2 9.3L17.9 11.8H18.9C19.9 11.8 20.4 11.3 20.5 10C20.6 9.5 20.3 9.3 19.7 9.3H18.2Z" fill="#253B80" />
                                    <path d="M23 8H26C27.6 8 27.8 8.8 27.5 10L26.5 16H24L24.3 14H23C21.5 14 20.5 12.5 20.8 10.5C21 9 22 8 23 8ZM23.5 10C23.4 10.5 23.3 11.5 24.3 11.5H24.8L25.2 10C25.3 9.5 25 9 24.5 9H24C23.6 9 23.6 9.8 23.5 10Z" fill="#253B80" />
                                  </svg>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Credit Card Form - shown only when credit_card payment method is selected */}
                      {form.watch("paymentMethod") === "credit_card" && (
                        <div className="mt-6 space-y-4">
                          <div>
                            <FormLabel>Card Number *</FormLabel>
                            <Input placeholder="1234 5678 9012 3456" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Expiration Date *</FormLabel>
                              <Input placeholder="MM/YY" />
                            </div>
                            <div>
                              <FormLabel>CVV *</FormLabel>
                              <Input placeholder="123" />
                            </div>
                          </div>

                          <div>
                            <FormLabel>Cardholder Name *</FormLabel>
                            <Input placeholder="John Doe" />
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="saveInfo"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal text-sm cursor-pointer">
                                  Save my information for faster checkout
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-10">
                  <h2 className="text-xl font-bold mb-6 font-heading">Order Summary</h2>

                  {/* Item List */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden mr-4 flex-shrink-0">
                            {item.product.imageUrl && (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Price Calculations */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(cartTotal)}</span>
                    </div>
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

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-bold text-[#293241]">
                      {formatCurrency(orderTotal)}
                    </span>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white font-bold py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By placing your order, you agree to our{" "}
                    <a href="/terms" className="text-[#3D5A80] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-[#3D5A80] hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
