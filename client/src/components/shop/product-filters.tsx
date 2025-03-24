import { useEffect } from "react";
import { FilterX } from "lucide-react";
import { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductFiltersProps {
  categories: Category[];
  filters: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    search?: string;
    sortBy?: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      categoryId?: number;
      minPrice?: number;
      maxPrice?: number;
      brand?: string;
      search?: string;
      sortBy?: string;
    }>
  >;
  loading: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

// Sample brand data - in a real app, this would come from an API
const sampleBrands = [
  { id: 1, name: "Specialized", count: 32 },
  { id: 2, name: "Trek", count: 28 },
  { id: 3, name: "Giant", count: 24 },
  { id: 4, name: "Cannondale", count: 19 },
  { id: 5, name: "Santa Cruz", count: 15 },
  { id: 6, name: "Shimano", count: 22 },
  { id: 7, name: "SRAM", count: 18 },
  { id: 8, name: "Rapha", count: 12 },
];

const ProductFilters = ({
  categories,
  filters,
  setFilters,
  loading,
  onApplyFilters,
  onResetFilters,
}: ProductFiltersProps) => {
  // Min/Max price ranges - would ideally come from API with actual min/max values
  const MIN_PRICE = 0;
  const MAX_PRICE = 5000;

  // Set price range when slider is changed
  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
  };

  // Toggle category filter
  const handleCategoryChange = (categoryId: number) => {
    setFilters((prev) => {
      // If this category is already selected, remove it
      if (prev.categoryId === categoryId) {
        const { categoryId: _, ...rest } = prev;
        return rest;
      }
      // Otherwise set it
      return { ...prev, categoryId };
    });
  };

  // Toggle brand filter
  const handleBrandChange = (brandName: string) => {
    setFilters((prev) => {
      // If this brand is already selected, remove it
      if (prev.brand === brandName) {
        const { brand: _, ...rest } = prev;
        return rest;
      }
      // Otherwise set it
      return { ...prev, brand: brandName };
    });
  };

  // Initialize price range to full range if not set
  useEffect(() => {
    if (filters.minPrice === undefined || filters.maxPrice === undefined) {
      setFilters((prev) => ({
        ...prev,
        minPrice: MIN_PRICE,
        maxPrice: MAX_PRICE,
      }));
    }
  }, [filters.minPrice, filters.maxPrice, setFilters]);

  return (
    <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-bold text-lg">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onResetFilters}
          className="text-[#3D5A80] hover:text-[#3D5A80]/90 flex items-center"
        >
          <FilterX className="mr-1 h-4 w-4" />
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "brands"]} className="space-y-4">
        {/* Category Filter */}
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 font-bold">
            Categories
          </AccordionTrigger>
          <AccordionContent className="space-y-2 py-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="all-categories" 
                    checked={!filters.categoryId}
                    onCheckedChange={() => {
                      const { categoryId, ...rest } = filters;
                      setFilters(rest);
                    }}
                    className="text-[#EE6C4D] border-gray-300"
                  />
                  <Label htmlFor="all-categories" className="cursor-pointer text-[#293241]">
                    All Categories
                  </Label>
                </div>
                
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category.id}`}
                      checked={filters.categoryId === category.id}
                      onCheckedChange={() => handleCategoryChange(category.id)}
                      className="text-[#EE6C4D] border-gray-300"
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="cursor-pointer text-[#293241] flex justify-between w-full"
                    >
                      <span>{category.name}</span>
                      {/* This is a placeholder for number of products per category */}
                      <span className="text-gray-500 text-sm">(24)</span>
                    </Label>
                  </div>
                ))}
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 font-bold">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="space-y-4 py-2">
            <div className="mb-6">
              <div className="mb-4">
                <Slider
                  defaultValue={[filters.minPrice || MIN_PRICE, filters.maxPrice || MAX_PRICE]}
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={50}
                  onValueChange={handlePriceChange}
                  className="my-4"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">${MIN_PRICE}</span>
                  <span className="text-sm text-gray-500">${MAX_PRICE}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <Label htmlFor="min-price" className="text-xs text-gray-500">Min</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="min-price"
                      type="number"
                      value={filters.minPrice || MIN_PRICE}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      min={MIN_PRICE}
                      max={filters.maxPrice || MAX_PRICE}
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <Label htmlFor="max-price" className="text-xs text-gray-500">Max</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="max-price"
                      type="number"
                      value={filters.maxPrice || MAX_PRICE}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      min={filters.minPrice || MIN_PRICE}
                      max={MAX_PRICE}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="py-2 font-bold">
            Brands
          </AccordionTrigger>
          <AccordionContent className="space-y-2 py-2">
            {sampleBrands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`brand-${brand.id}`}
                  checked={filters.brand === brand.name}
                  onCheckedChange={() => handleBrandChange(brand.name)}
                  className="text-[#EE6C4D] border-gray-300"
                />
                <Label 
                  htmlFor={`brand-${brand.id}`}
                  className="cursor-pointer text-[#293241] flex justify-between w-full"
                >
                  <span>{brand.name}</span>
                  <span className="text-gray-500 text-sm">({brand.count})</span>
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating" className="border-none">
          <AccordionTrigger className="py-2 font-bold">
            Rating
          </AccordionTrigger>
          <AccordionContent className="space-y-2 py-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox 
                  id={`rating-${rating}`}
                  className="text-[#EE6C4D] border-gray-300"
                />
                <Label 
                  htmlFor={`rating-${rating}`}
                  className="cursor-pointer text-[#293241] flex items-center"
                >
                  <div className="flex mr-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1">&amp; Up</span>
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator className="my-6" />

      <div className="flex space-x-3">
        <Button
          onClick={onApplyFilters}
          className="bg-[#EE6C4D] hover:bg-[#EE6C4D]/90 text-white flex-1"
        >
          Apply Filters
        </Button>
        <Button
          onClick={onResetFilters}
          variant="outline"
          className="text-[#293241] border-gray-300"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
