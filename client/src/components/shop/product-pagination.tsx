import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ProductPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ProductPaginationProps) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate page numbers to show
  const getPageNumbers = () => {
    // Always show current page and a few pages before and after
    const delta = 1; // Number of pages to show before and after current page
    
    let pages = [];
    
    // Always include page 1
    pages.push(1);
    
    // Calculate start and end of page range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Add "..." after page 1 if there's a gap
    if (rangeStart > 2) {
      pages.push(-1); // -1 represents "..."
    }
    
    // Add pages in the middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add "..." before last page if there's a gap
    if (rangeEnd < totalPages - 1) {
      pages.push(-2); // -2 represents "..." (different key from the first one)
    }
    
    // Always include last page if it's not page 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex justify-center">
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page numbers */}
        {pages.map((page, index) => {
          // Render ellipsis
          if (page < 0) {
            return (
              <span key={page} className="px-3 py-2 text-gray-500">
                …
              </span>
            );
          }
          
          // Render page numbers
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              className={
                currentPage === page 
                  ? "bg-[#3D5A80] hover:bg-[#3D5A80]/90" 
                  : "text-[#3D5A80]"
              }
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
        
        {/* Next page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};

export default ProductPagination;
