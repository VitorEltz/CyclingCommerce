import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertCartItemSchema,
  insertOrderSchema,
  addressSchema
} from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

// Helper function to get or create cart
async function getOrCreateCart(req: Request) {
  // Try to get cart by user ID if authenticated
  if (req.isAuthenticated()) {
    const cartData = await storage.getCart(req.user.id);
    if (cartData) return cartData;
    
    // Create new cart for user
    const cart = await storage.createCart({ userId: req.user.id });
    return { cart, items: [] };
  }
  
  // Try to get cart by session ID
  let sessionId = req.session.cartId;
  if (!sessionId) {
    sessionId = nanoid();
    req.session.cartId = sessionId;
  }
  
  const cartData = await storage.getCart(sessionId);
  if (cartData) return cartData;
  
  // Create new cart for session
  const cart = await storage.createCart({ sessionId });
  return { cart, items: [] };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });
  
  app.get("/api/categories/:slug", async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  });
  
  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.put("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteCategory(id);
    
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(204).end();
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    const options = {
      categoryId: req.query.category ? parseInt(req.query.category as string) : undefined,
      featured: req.query.featured === "true",
      isNew: req.query.new === "true",
      search: req.query.search as string | undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      brand: req.query.brand as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    
    const { products, total } = await storage.getProducts(options);
    res.json({ products, total });
  });
  
  app.get("/api/products/:slug", async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });
  
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProduct(id);
    
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(204).end();
  });
  
  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const { cart, items } = await getOrCreateCart(req);
      res.json({ cartId: cart.id, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve cart" });
    }
  });
  
  app.post("/api/cart/items", async (req, res) => {
    try {
      const { cart } = await getOrCreateCart(req);
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      const cartItem = await storage.addCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.put("/api/cart/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (quantity === undefined || isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItemQuantity(id, quantity);
      
      if (!cartItem && quantity > 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(quantity > 0 ? 200 : 204).json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeCartItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  
  app.delete("/api/cart", async (req, res) => {
    try {
      const { cart } = await getOrCreateCart(req);
      await storage.clearCart(cart.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = await storage.getOrder(id);
      
      if (!orderData) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to user (unless admin)
      if (orderData.order.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized access to order" });
      }
      
      res.json(orderData);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate shipping and billing addresses
      const shippingAddress = addressSchema.parse(req.body.shippingAddress);
      const billingAddress = addressSchema.parse(req.body.billingAddress);
      
      // Get cart
      const { cart, items } = await getOrCreateCart(req);
      
      if (items.length === 0) {
        return res.status(400).json({ message: "Cannot create order with empty cart" });
      }
      
      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      // Create order
      const orderData = insertOrderSchema.parse({
        userId: req.isAuthenticated() ? req.user.id : undefined,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod: req.body.paymentMethod || "credit_card",
        status: "pending"
      });
      
      // Create order items
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const order = await storage.createOrder(orderData, orderItems);
      
      // Clear cart after successful order
      await storage.clearCart(cart.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Admin - Get all orders
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });
  
  // Admin - Update order status
  app.put("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Create initial demo data
  await createInitialData();

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to create initial demo data
async function createInitialData() {
  // Check if data already exists
  const { products } = await storage.getProducts();
  if (products.length > 0) return;
  
  // Create categories
  const categories = [
    {
      name: "Road Bikes",
      slug: "road-bikes",
      description: "Speed and efficiency for every road",
      imageUrl: "https://images.unsplash.com/photo-1511994298241-608e28f14fde"
    },
    {
      name: "Mountain Bikes",
      slug: "mountain-bikes",
      description: "Conquer any terrain with confidence",
      imageUrl: "https://images.unsplash.com/photo-1605825831039-08b1cc0c3737"
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Essential gear for every ride",
      imageUrl: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91"
    },
    {
      name: "Apparel",
      slug: "apparel",
      description: "Performance clothing for cyclists",
      imageUrl: "https://images.unsplash.com/photo-1489914099268-1dad649f76bf"
    }
  ];
  
  const categoryMap = new Map();
  for (const category of categories) {
    const createdCategory = await storage.createCategory(category);
    categoryMap.set(category.slug, createdCategory.id);
  }
  
  // Create products
  const productList = [
    {
      name: "Carbon Elite Road Bike",
      slug: "carbon-elite-road-bike",
      description: "Lightweight carbon frame with precision handling for speed enthusiasts.",
      price: 2499.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      categoryId: categoryMap.get("road-bikes"),
      brand: "Specialized",
      inStock: true,
      isFeatured: true,
      isNew: true
    },
    {
      name: "Speed Master X5",
      slug: "speed-master-x5",
      description: "Professional-grade road bike with aerodynamic design and premium components.",
      price: 1599.99,
      compareAtPrice: 1899.99,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      categoryId: categoryMap.get("road-bikes"),
      brand: "Trek",
      inStock: true,
      isFeatured: true,
      isNew: false
    },
    {
      name: "Pro Trail Helmet",
      slug: "pro-trail-helmet",
      description: "Ventilated, lightweight helmet with adjustable fit system for maximum comfort and protection.",
      price: 149.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1616778639452-bdee7e2b48f8",
      categoryId: categoryMap.get("accessories"),
      brand: "Giro",
      inStock: true,
      isFeatured: true,
      isNew: false
    },
    {
      name: "Elite Cycling Jersey",
      slug: "elite-cycling-jersey",
      description: "Breathable, moisture-wicking fabric with aerodynamic fit for performance cycling.",
      price: 89.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1496147433903-1e62fdb6f4be",
      categoryId: categoryMap.get("apparel"),
      brand: "Rapha",
      inStock: true,
      isFeatured: true,
      isNew: false
    },
    {
      name: "Trail Blazer XL",
      slug: "trail-blazer-xl",
      description: "Durable mountain bike with full suspension and responsive handling for challenging trails.",
      price: 1899.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8",
      categoryId: categoryMap.get("mountain-bikes"),
      brand: "Santa Cruz",
      inStock: true,
      isFeatured: false,
      isNew: false
    },
    {
      name: "Aero Road Helmet",
      slug: "aero-road-helmet",
      description: "Sleek, aerodynamic helmet designed for road cycling with integrated ventilation channels.",
      price: 129.99,
      compareAtPrice: 169.99,
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      categoryId: categoryMap.get("accessories"),
      brand: "POC",
      inStock: true,
      isFeatured: false,
      isNew: false
    },
    {
      name: "Pro Cycling Shoes",
      slug: "pro-cycling-shoes",
      description: "Lightweight cycling shoes with stiff carbon sole and precision fit for power transfer.",
      price: 149.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1508190074303-c0c4e4cf4c3e",
      categoryId: categoryMap.get("apparel"),
      brand: "Shimano",
      inStock: true,
      isFeatured: false,
      isNew: false
    },
    {
      name: "Ultra Bright Bike Lights",
      slug: "ultra-bright-bike-lights",
      description: "High-powered, water-resistant bike lights for visibility and safety in all conditions.",
      price: 79.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4",
      categoryId: categoryMap.get("accessories"),
      brand: "Light & Motion",
      inStock: true,
      isFeatured: false,
      isNew: false
    },
    {
      name: "Carbon Fiber Pedals",
      slug: "carbon-fiber-pedals",
      description: "Ultralight carbon pedals with durable bearings and wide platform for power and control.",
      price: 119.99,
      compareAtPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1589236782461-414748c7a674",
      categoryId: categoryMap.get("accessories"),
      brand: "Crank Brothers",
      inStock: true,
      isFeatured: false,
      isNew: true
    }
  ];
  
  for (const product of productList) {
    await storage.createProduct(product);
  }
}
