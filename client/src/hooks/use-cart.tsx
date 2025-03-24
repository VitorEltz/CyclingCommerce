import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

type CartContextType = {
  cartItems: CartItem[];
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

type CartResponse = {
  cartId: number;
  items: CartItem[];
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    data: cartData,
    isLoading,
  } = useQuery<CartResponse>({
    queryKey: ["/api/cart"],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const cartItems = cartData?.items || [];
  
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart/items", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/items/${itemId}`, { quantity });
      if (quantity > 0) {
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = async (productId: number, quantity: number) => {
    await addToCartMutation.mutateAsync({ productId, quantity });
    openCart();
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ itemId, quantity });
  };

  const removeItem = async (itemId: number) => {
    await removeItemMutation.mutateAsync(itemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        itemCount,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
