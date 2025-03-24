import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Product, 
  Order, 
  Category, 
  insertProductSchema, 
  insertCategorySchema 
} from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Check,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  SearchIcon,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Product form schema
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive("Compare at price must be positive").optional().nullable(),
  categoryId: z.coerce.number().positive("Category is required"),
  inStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

// Category form schema
const categoryFormSchema = insertCategorySchema.extend({});

type ProductFormValues = z.infer<typeof productFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const AdminPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Check if user is admin
  if (user && !user.isAdmin) {
    navigate("/");
    return null;
  }

  // Fetch products
  const { data: productsData, isLoading: isProductsLoading } = useQuery<{ products: Product[], total: number }>({
    queryKey: ['/api/products', { search: searchTerm }],
  });

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
  });

  // Product form setup
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      compareAtPrice: null,
      imageUrl: "",
      categoryId: 0,
      brand: "",
      inStock: true,
      isFeatured: false,
      isNew: false,
    },
  });

  // Category form setup
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      setShowAddProduct(false);
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category created",
        description: "The category has been created successfully.",
      });
      setShowAddCategory(false);
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
      setSelectedOrderId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle product form submission
  const onProductSubmit = (values: ProductFormValues) => {
    createProductMutation.mutate(values);
  };

  // Handle category form submission
  const onCategorySubmit = (values: CategoryFormValues) => {
    createCategoryMutation.mutate(values);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Auto-generate slug when name changes
  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "category"
  ) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    
    if (type === "product") {
      productForm.setValue("name", name);
      productForm.setValue("slug", slug);
    } else {
      categoryForm.setValue("name", name);
      categoryForm.setValue("slug", slug);
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };

  // Handle product delete
  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | CyclePro</title>
      </Helmet>

      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-heading">Admin Dashboard</h1>
            <Button asChild variant="outline">
              <a href="/" className="flex items-center">
                <X className="mr-2 h-4 w-4" />
                Exit Admin
              </a>
            </Button>
          </div>

          {/* Dashboard Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-base font-medium">Total Products</CardTitle>
                <ShoppingBag className="h-5 w-5 text-[#3D5A80]" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {isProductsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    productsData?.total || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-base font-medium">Categories</CardTitle>
                <Tag className="h-5 w-5 text-[#3D5A80]" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {isCategoriesLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    categories?.length || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-base font-medium">Total Orders</CardTitle>
                <Package className="h-5 w-5 text-[#3D5A80]" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {isOrdersLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    orders?.length || 0
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-base font-medium">Registered Users</CardTitle>
                <Users className="h-5 w-5 text-[#3D5A80]" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">
                  {/* This would need a users endpoint */}
                  <span>10</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <h2 className="text-xl font-bold mb-4 md:mb-0">Manage Products</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <Button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Product
                    </Button>
                  </div>
                </div>

                {isProductsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3D5A80]" />
                  </div>
                ) : productsData?.products && productsData.products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsData.products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>
                              <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                                {product.imageUrl && (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </TableCell>
                            <TableCell>
                              {categories?.find((c) => c.id === product.categoryId)?.name || "-"}
                            </TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                              >
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No products found</AlertTitle>
                    <AlertDescription>
                      {searchTerm
                        ? `No products match the search term "${searchTerm}"`
                        : "There are no products in the system. Add a product to get started."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Add Product Dialog */}
              <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new product.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={(e) => handleNameChange(e, "product")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                URL-friendly identifier
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter product description"
                                className="min-h-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="compareAtPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compare at Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : null;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Original price before discount
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id.toString()}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                URL to the product image
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={productForm.control}
                          name="inStock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>In Stock</FormLabel>
                                <FormDescription>
                                  Product is available for purchase
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Featured</FormLabel>
                                <FormDescription>
                                  Show on featured section
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="isNew"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>New</FormLabel>
                                <FormDescription>
                                  Mark as new product
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddProduct(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90"
                          disabled={createProductMutation.isPending}
                        >
                          {createProductMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Product"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <h2 className="text-xl font-bold mb-4 md:mb-0">Manage Categories</h2>
                  <Button
                    onClick={() => setShowAddCategory(true)}
                    className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                  </Button>
                </div>

                {isCategoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3D5A80]" />
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.id}</TableCell>
                            <TableCell>
                              <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                                {category.imageUrl && (
                                  <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.slug}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {category.description || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No categories found</AlertTitle>
                    <AlertDescription>
                      There are no categories in the system. Add a category to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Add Category Dialog */}
              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new category.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                onChange={(e) => handleNameChange(e, "category")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL-friendly identifier
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter category description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={categoryForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL to the category image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddCategory(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90"
                          disabled={createCategoryMutation.isPending}
                        >
                          {createCategoryMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Category"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Manage Orders</h2>

                {isOrdersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3D5A80]" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{formatDate(order.createdAt.toString())}</TableCell>
                            <TableCell>
                              {order.userId ? `User #${order.userId}` : "Guest"}
                            </TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusBadgeClass(order.status)}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[#3D5A80]"
                                onClick={() => setSelectedOrderId(order.id)}
                              >
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No orders found</AlertTitle>
                    <AlertDescription>
                      There are no orders in the system yet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Update Order Status Dialog */}
              <Dialog
                open={selectedOrderId !== null}
                onOpenChange={(open) => !open && setSelectedOrderId(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                    <DialogDescription>
                      Change the status of order #{selectedOrderId}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <Label>New Status</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["pending", "processing", "completed", "cancelled"].map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          className={`justify-start ${
                            orders?.find((o) => o.id === selectedOrderId)?.status === status
                              ? "border-2 border-[#3D5A80]"
                              : ""
                          }`}
                          onClick={() => selectedOrderId && handleUpdateOrderStatus(selectedOrderId, status)}
                        >
                          <div className="flex items-center">
                            {status === "completed" && <Check className="mr-2 h-4 w-4 text-green-500" />}
                            {status === "processing" && <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />}
                            {status === "pending" && <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />}
                            {status === "cancelled" && <X className="mr-2 h-4 w-4 text-red-500" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedOrderId(null)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
