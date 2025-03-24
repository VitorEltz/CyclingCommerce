import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import ShopPage from "@/pages/shop-page";
import ProductDetailsPage from "@/pages/product-details-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import OrderConfirmationPage from "@/pages/order-confirmation-page";
import ProfilePage from "@/pages/profile-page";
import AdminPage from "@/pages/admin-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartDrawer from "@/components/cart/cart-drawer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CartDrawer />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/shop" component={ShopPage} />
          <Route path="/shop/:category" component={ShopPage} />
          <Route path="/products/:slug" component={ProductDetailsPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/order-confirmation/:id" component={OrderConfirmationPage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
