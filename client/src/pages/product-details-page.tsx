import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Truck, 
  RefreshCw, 
  ShieldCheck,
  Star,
  StarHalf,
  ChevronRight,
  Minus,
  Plus,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeaturedProducts from "@/components/home/featured-products";

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
    onError: () => {
      navigate("/shop"); // Redirect to shop page if product not found
    }
  });

  // Fetch categories for breadcrumbs
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3D5A80]" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Find product category for breadcrumbs
  const category = categories?.find(c => c.id === product.categoryId);

  // Calculate full and half stars based on rating
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | CyclePro</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#3D5A80]">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <Link href="/shop" className="text-gray-500 hover:text-[#3D5A80]">Shop</Link>
            
            {category && (
              <>
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                <Link 
                  href={`/shop/${category.slug}`} 
                  className="text-gray-500 hover:text-[#3D5A80]"
                >
                  {category.name}
                </Link>
              </>
            )}
            
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <span className="text-[#293241] font-medium">{product.name}</span>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 bg-gray-100">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain object-center"
                    style={{ maxHeight: '600px' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                {/* Product tags */}
                <div className="flex space-x-2 mb-3">
                  {product.isNew && (
                    <span className="bg-[#EE6C4D] text-white text-xs font-bold px-2 py-1 rounded">
                      New
                    </span>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="bg-[#3D5A80] text-white text-xs font-bold px-2 py-1 rounded">
                      Sale
                    </span>
                  )}
                </div>

                {/* Product title and brand */}
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#293241] mb-2">
                  {product.name}
                </h1>
                
                {product.brand && (
                  <div className="text-gray-500 mb-4">
                    Brand: <span className="font-medium">{product.brand}</span>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(fullStars)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                    ))}
                    {hasHalfStar && (
                      <StarHalf className="h-5 w-5 fill-current text-yellow-400" />
                    )}
                    {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {product.compareAtPrice && product.compareAtPrice > product.price ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-[#293241] mr-2">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatCurrency(product.compareAtPrice)}
                      </span>
                      <span className="ml-2 bg-[#EE6C4D]/10 text-[#EE6C4D] text-sm font-medium px-2 py-1 rounded">
                        {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-[#293241]">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Product description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-medium text-[#293241] mb-2">Description</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Stock status */}
                <div className="mb-6">
                  <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Quantity selector and Add to cart */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || !product.inStock}
                      className="px-3 py-2 h-12 rounded-none border-r"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="px-6 py-3 font-medium">{quantity}</div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={!product.inStock}
                      className="px-3 py-2 h-12 rounded-none border-l"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white h-12"
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={toggleFavorite}
                    className={`h-12 w-12 ${isFavorite ? 'text-red-500 border-red-500' : ''}`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Shipping and returns */}
                <div className="space-y-4 mt-auto pt-6 border-t">
                  <div className="flex items-center text-sm">
                    <Truck className="h-5 w-5 mr-2 text-[#3D5A80]" />
                    <span>
                      Free shipping on orders over <span className="font-medium">{formatCurrency(100)}</span>
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <RefreshCw className="h-5 w-5 mr-2 text-[#3D5A80]" />
                    <span>30-day easy returns</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ShieldCheck className="h-5 w-5 mr-2 text-[#3D5A80]" />
                    <span>2-year warranty</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product details tabs */}
            <div className="border-t">
              <Tabs defaultValue="details" className="p-6 md:p-8">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="details">Product Details</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <h3 className="text-lg font-semibold font-heading">About {product.name}</h3>
                  <p className="text-gray-600">
                    {product.description || 'No detailed description available for this product.'}
                  </p>
                  
                  {/* Additional details could be added here */}
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Premium quality materials</li>
                      <li>Designed for optimal performance</li>
                      <li>Durable construction</li>
                      <li>Easy maintenance</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="space-y-4">
                  <h3 className="text-lg font-semibold font-heading">Technical Specifications</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y">
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">Brand</td>
                            <td className="px-4 py-2">{product.brand || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">Model</td>
                            <td className="px-4 py-2">{product.name}</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">Year</td>
                            <td className="px-4 py-2">2023</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">Weight</td>
                            <td className="px-4 py-2">Varies by size</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">Warranty</td>
                            <td className="px-4 py-2">2 Years</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y">
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">Material</td>
                            <td className="px-4 py-2">Premium Quality</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">Color</td>
                            <td className="px-4 py-2">As shown</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">Compatible with</td>
                            <td className="px-4 py-2">All standard models</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 font-medium">Country of Origin</td>
                            <td className="px-4 py-2">USA</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 font-medium">SKU</td>
                            <td className="px-4 py-2">{product.id}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold font-heading">
                      Customer Reviews ({product.reviewCount})
                    </h3>
                    <Button>Write a Review</Button>
                  </div>
                  
                  {product.reviewCount > 0 ? (
                    <div className="space-y-4">
                      {/* Sample review - in a real app, these would come from the API */}
                      <div className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < 5 ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">Amazing Product!</span>
                          </div>
                          <span className="text-sm text-gray-500">1 month ago</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium">Jane D.</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          This is exactly what I was looking for. Great quality and perfect fit for my bike.
                          I highly recommend this product to anyone in need of an upgrade.
                        </p>
                      </div>
                      
                      {/* More reviews would be added here */}
                      <div className="text-center">
                        <Button variant="outline">Load More Reviews</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-6 text-center">
                      <p className="mb-4 text-gray-600">This product has no reviews yet. Be the first to share your experience!</p>
                      <Button>Write a Review</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Related Products */}
          <div className="pt-8">
            <h2 className="text-2xl font-bold font-heading mb-6">You Might Also Like</h2>
            <FeaturedProducts />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;
