import { useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Package, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { Order, OrderItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type OrderWithItems = {
  order: Order;
  items: (OrderItem & { product: Product })[];
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const orderId = parseInt(id);

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && !isNaN(orderId),
  });

  // Redirect if invalid order ID
  useEffect(() => {
    if (!isLoading && (error || !orderData)) {
      navigate("/");
    }
  }, [isLoading, error, orderData, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3D5A80]" />
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const { order, items } = orderData;

  // Calculate order summary
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 0; // Free shipping for this example
  const tax = order.total - subtotal - shippingCost;

  return (
    <>
      <Helmet>
        <title>Order Confirmation | CyclePro</title>
      </Helmet>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4 font-heading text-[#293241]">
                Thank You for Your Order!
              </h1>
              <p className="text-gray-600 mb-6">
                Your order has been received and is being processed. You will receive an 
                email confirmation shortly.
              </p>
              <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 mb-6">
                <span className="text-sm text-gray-600">Order Number:</span>{" "}
                <span className="font-medium">{order.id}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button asChild variant="outline" className="flex items-center">
                  <Link href="/profile/orders">
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
                  </Link>
                </Button>
                <Button asChild className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90">
                  <Link href="/shop">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold font-heading">Order Details</h2>
              </div>

              {/* Shipping Information */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2 text-[#3D5A80]">Shipping Information</h3>
                    <address className="not-italic text-gray-600">
                      <p>{`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</p>
                      <p>{order.shippingAddress.address1}</p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>{`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`}</p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                    </address>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-[#3D5A80]">Payment Information</h3>
                    <p className="text-gray-600 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                    <p className="text-gray-600">
                      {order.status === "completed" ? "Paid" : "Payment Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h3 className="font-medium mb-4 text-[#3D5A80]">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
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
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Button asChild variant="ghost" className="text-[#3D5A80] hover:text-[#3D5A80]/80">
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
