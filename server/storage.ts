import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  carts, type Cart, type InsertCart,
  cartItems, type CartItem, type InsertCartItem
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category Operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product Operations
  getProducts(options?: { 
    categoryId?: number; 
    featured?: boolean;
    isNew?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[], total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order Operations
  getOrders(userId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<{ order: Order, items: (OrderItem & { product: Product })[] } | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Cart Operations
  getCart(idOrSessionId: number | string): Promise<{ cart: Cart, items: (CartItem & { product: Product })[] } | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  
  // Session Store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  
  sessionStore: session.SessionStore;
  
  private userId = 1;
  private categoryId = 1;
  private productId = 1;
  private orderId = 1;
  private orderItemId = 1;
  private cartId = 1;
  private cartItemId = 1;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "adminpassword", // This will be hashed in auth.ts
      email: "admin@cyclepro.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
    });
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Category Operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Product Operations
  async getProducts(options: { 
    categoryId?: number; 
    featured?: boolean;
    isNew?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ products: Product[], total: number }> {
    let filtered = Array.from(this.products.values());
    
    // Apply filters
    if (options.categoryId !== undefined) {
      filtered = filtered.filter(product => product.categoryId === options.categoryId);
    }
    
    if (options.featured !== undefined) {
      filtered = filtered.filter(product => product.isFeatured === options.featured);
    }
    
    if (options.isNew !== undefined) {
      filtered = filtered.filter(product => product.isNew === options.isNew);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (options.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= options.minPrice!);
    }
    
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= options.maxPrice!);
    }
    
    if (options.brand) {
      filtered = filtered.filter(product => product.brand === options.brand);
    }
    
    // Apply sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        // Default is by name
        default:
          filtered.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    
    const total = filtered.length;
    
    // Apply pagination
    if (options.limit !== undefined && options.offset !== undefined) {
      filtered = filtered.slice(options.offset, options.offset + options.limit);
    }
    
    return { products: filtered, total };
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const createdAt = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt, 
      rating: 0, 
      reviewCount: 0
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productUpdate };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Order Operations
  async getOrders(userId?: number): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    if (userId !== undefined) {
      orders = orders.filter(order => order.userId === userId);
    }
    return orders;
  }
  
  async getOrder(id: number): Promise<{ order: Order, items: (OrderItem & { product: Product })[] } | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId)!;
        return { ...item, product };
      });
    
    return { order, items };
  }
  
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    
    // Add order items
    for (const item of items) {
      const orderItemId = this.orderItemId++;
      const orderItem: OrderItem = { ...item, id: orderItemId, orderId: id };
      this.orderItems.set(orderItemId, orderItem);
    }
    
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Cart Operations
  async getCart(idOrSessionId: number | string): Promise<{ cart: Cart, items: (CartItem & { product: Product })[] } | undefined> {
    let cart: Cart | undefined;
    
    if (typeof idOrSessionId === 'number') {
      cart = Array.from(this.carts.values()).find(c => c.userId === idOrSessionId);
    } else {
      cart = Array.from(this.carts.values()).find(c => c.sessionId === idOrSessionId);
    }
    
    if (!cart) return undefined;
    
    const items = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cart!.id)
      .map(item => {
        const product = this.products.get(item.productId)!;
        return { ...item, product };
      });
    
    return { cart, items };
  }
  
  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.cartId++;
    const createdAt = new Date();
    const cart: Cart = { ...insertCart, id, createdAt };
    this.carts.set(id, cart);
    return cart;
  }
  
  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === insertCartItem.cartId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead of creating new item
      const updatedItem = { 
        ...existingItem, 
        quantity: existingItem.quantity + insertCartItem.quantity 
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    // Create new item
    const id = this.cartItemId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(cartId: number): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId)
      .map(item => item.id);
    
    itemsToRemove.forEach(id => this.cartItems.delete(id));
    return true;
  }
}

export const storage = new MemStorage();
