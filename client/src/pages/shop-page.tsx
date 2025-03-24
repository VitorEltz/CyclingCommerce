import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Helmet } from "react-helmet";
import { Category, Product } from "@shared/schema";
import ProductFilters from "@/components/shop/product-filters";
import ProductGrid from "@/components/shop/product-grid";
import ProductPagination from "@/components/shop/product-pagination";
import { Button } from "@/components/ui/button";
import { Loader2, Grid, List, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-mobile";

const PRODUCTS_PER_PAGE = 9;

type FilterState = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
  sortBy?: string;
};

const sortOptions = [
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
];

const ShopPage = () => {
  const { category } = useParams();
  const [location, setLocation] = useLocation();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Find category id from slug
  useEffect(() => {
    if (categories && category) {
      const foundCategory = categories.find((c) => c.slug === category);
      if (foundCategory) {
        setFilters((prev) => ({ ...prev, categoryId: foundCategory.id }));
        setAppliedFilters((prev) => ({ ...prev, categoryId: foundCategory.id }));
      }
    }
  }, [categories, category]);

  // Handle window resize
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // Fetch products with filters
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
  } = useQuery<{ products: Product[]; total: number }>({
    queryKey: [
      "/api/products",
      {
        ...appliedFilters,
        limit: PRODUCTS_PER_PAGE,
        offset: (page - 1) * PRODUCTS_PER_PAGE,
      },
    ],
    keepPreviousData: true,
  });

  // Get current category name
  const currentCategoryName = category
    ? categories?.find((c) => c.slug === category)?.name || "Products"
    : "All Products";

  // Calculate total pages
  const totalPages = productsData?.total
    ? Math.ceil(productsData.total / PRODUCTS_PER_PAGE)
    : 0;

  // Handle sort change
  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setAppliedFilters((prev) => ({ ...prev, sortBy: value }));
    setPage(1);
  };

  // Handle search
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters((prev) => ({ ...prev, search: filters.search }));
    setPage(1);
  };

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    const newFilters = category
      ? { categoryId: appliedFilters.categoryId }
      : {};
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <>
      <Helmet>
        <title>{currentCategoryName} | CyclePro</title>
      </Helmet>

      <div className="bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page header with title and count */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-heading text-[#293241]">
              {currentCategoryName}
            </h1>
            {!productsLoading && (
              <p className="text-gray-500 mt-2">
                <span className="font-medium text-[#293241]">
                  {productsData?.total}
                </span>{" "}
                products found
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters sidebar - hidden on mobile by default */}
            <div
              className={`lg:w-1/4 ${
                showFilters
                  ? "fixed inset-0 z-50 bg-white lg:static lg:bg-transparent lg:z-auto p-4 lg:p-0 overflow-auto"
                  : "hidden lg:block"
              }`}
            >
              {/* Close button for mobile filters */}
              {isMobile && showFilters && (
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 border-b pb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFilters}
                    className="lg:hidden"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Product filters component */}
              <ProductFilters
                categories={categories || []}
                filters={filters}
                setFilters={setFilters}
                loading={categoriesLoading}
                onApplyFilters={applyFilters}
                onResetFilters={resetFilters}
              />
            </div>

            {/* Product listing */}
            <div className="lg:w-3/4">
              {/* Top bar with sorting, view options, and mobile filter toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b">
                <div className="w-full sm:w-auto mb-4 sm:mb-0">
                  <form
                    onSubmit={handleSearch}
                    className="relative flex items-center"
                  >
                    <Input
                      type="text"
                      placeholder="Search products..."
                      className="pr-10 w-full sm:w-64"
                      value={filters.search || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </Button>
                  </form>
                </div>

                <div className="flex space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex-1 sm:flex-none">
                    <Select
                      value={filters.sortBy || "newest"}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View mode and filter toggles */}
                  <div className="flex space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="h-10 w-10"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="h-10 w-10"
                    >
                      <List className="h-4 w-4" />
                    </Button>

                    {/* Mobile filter toggle */}
                    <Button
                      variant="outline"
                      onClick={toggleFilters}
                      className="h-10 lg:hidden flex items-center"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {productsLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#3D5A80]" />
                </div>
              ) : productsData?.products.length === 0 ? (
                // Empty state
                <div className="bg-white rounded-lg p-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button onClick={resetFilters}>Clear All Filters</Button>
                </div>
              ) : (
                // Product grid
                <>
                  <ProductGrid
                    products={productsData.products}
                    viewMode={viewMode}
                    isLoading={isFetching && !productsLoading}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10">
                      <ProductPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
