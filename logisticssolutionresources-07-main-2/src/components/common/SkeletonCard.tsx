import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonCardProps {
  showHeader?: boolean;
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard = ({ 
  showHeader = true, 
  showAvatar = false, 
  lines = 3,
  className = ""
}: SkeletonCardProps) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <div className="flex items-center space-x-3">
            {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index} 
            className={`h-3 ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`} 
          />
        ))}
      </CardContent>
    </Card>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-6 w-full" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={`h-4 ${colIndex === 0 ? 'w-3/4' : 'w-full'}`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonList = ({ items = 6, showAvatar = true }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
          {showAvatar && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
};