import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Settings, 
  MoreHorizontal, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Car,
  FileText,
  Database,
  Zap
} from 'lucide-react';

// Standard interfaces for the layout
export interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  bgColor?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface NavigationTab {
  value: string;
  label: string;
  badge?: number;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  render?: (item: any) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  width?: string;
}

export interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export interface StandardPageLayoutProps {
  // Page Identity
  title: string;
  description?: string;
  
  // Header Actions
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  
  // Metrics Dashboard
  metricsCards?: MetricCard[];
  showMetricsDashboard?: boolean;
  
  // Navigation
  navigationTabs?: NavigationTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  
  // Search & Filters
  searchConfig?: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    showSearch?: boolean;
  };
  filters?: FilterOption[];
  onFilterChange?: (filterKey: string, value: string) => void;
  
  // Content
  children: ReactNode;
  
  // Table Configuration (if using tables)
  tableData?: any[];
  tableColumns?: TableColumn[];
  showTable?: boolean;
  
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  
  // Loading States
  isLoading?: boolean;
  loadingText?: string;
  
  // Empty States
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ActionButton;
  };
  
  // Custom Header Content
  customHeaderContent?: ReactNode;
  
  // Custom Footer Content
  customFooterContent?: ReactNode;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  metricsCards = [],
  showMetricsDashboard = true,
  navigationTabs = [],
  activeTab,
  onTabChange,
  searchConfig,
  filters = [],
  onFilterChange,
  children,
  tableData = [],
  tableColumns = [],
  showTable = false,
  pagination,
  isLoading = false,
  loadingText = "Loading...",
  emptyState,
  customHeaderContent,
  customFooterContent
}) => {
  // Get metric card color classes
  const getMetricCardClasses = (card: MetricCard) => {
    const baseClasses = "flex items-center space-x-3";
    const iconClasses = `w-10 h-10 rounded-lg flex items-center justify-center ${card.bgColor || 'bg-gray-100'}`;
    const textClasses = card.color ? `text-${card.color}` : 'text-gray-900';
    
    return { baseClasses, iconClasses, textClasses };
  };

  // Get trend icon and color
  const getTrendIndicator = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  // Render search and filters
  const renderSearchAndFilters = () => {
    if (!searchConfig?.showSearch && filters.length === 0) return null;

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {searchConfig?.showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={searchConfig.placeholder}
                    value={searchConfig.value}
                    onChange={(e) => searchConfig.onChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            {filters.map((filter, index) => (
              <Select 
                key={index} 
                value={filter.value || ''} 
                onValueChange={(value) => onFilterChange?.(filter.label, value)}
              >
                <SelectTrigger className={filter.width || "w-[180px]"}>
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            
            {filters.length > 0 && (
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render table
  const renderTable = () => {
    if (!showTable || !tableData || !tableColumns) return null;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Data Table</CardTitle>
          {pagination && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>
                {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={pagination.currentPage === 1}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHead key={column.key} className={column.width || ''}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow key={index}>
                  {tableColumns.map((column) => (
                    <TableCell key={column.key} className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (emptyState && (!tableData || tableData.length === 0)) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          {primaryAction && (
            <Button onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
              {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
              {primaryAction.label}
            </Button>
          )}
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              {emptyState.icon && <div className="mb-4">{emptyState.icon}</div>}
              <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
              <p className="text-gray-600 mb-6">{emptyState.description}</p>
              {emptyState.action && (
                <Button onClick={emptyState.action.onClick} disabled={emptyState.action.disabled}>
                  {emptyState.action.icon && <span className="mr-2">{emptyState.action.icon}</span>}
                  {emptyState.action.label}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        <div className="flex items-center space-x-2">
          {secondaryActions.map((action, index) => (
            <Button 
              key={index}
              variant={action.variant || 'outline'} 
              size={action.size || 'sm'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
          {primaryAction && (
            <Button 
              onClick={primaryAction.onClick} 
              disabled={primaryAction.disabled}
              variant={primaryAction.variant || 'default'}
              size={primaryAction.size || 'default'}
            >
              {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Custom Header Content */}
      {customHeaderContent}

      {/* Metrics Dashboard */}
      {showMetricsDashboard && metricsCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsCards.map((card, index) => {
            const { baseClasses, iconClasses, textClasses } = getMetricCardClasses(card);
            
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className={baseClasses}>
                    <div className={iconClasses}>
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <div className="flex items-center space-x-2">
                        <p className={`text-2xl font-bold ${textClasses}`}>{card.value}</p>
                        {getTrendIndicator(card.trend)}
                      </div>
                      {card.subtitle && (
                        <p className="text-xs text-gray-500">{card.subtitle}</p>
                      )}
                      {card.trendValue && (
                        <p className="text-xs text-gray-500">{card.trendValue}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Navigation Tabs */}
      {navigationTabs.length > 0 && (
        <div className="flex items-center space-x-4 border-b">
          {navigationTabs.map((tab) => (
            <Button 
              key={tab.value}
              variant="ghost" 
              className={activeTab === tab.value ? 'border-b-2 border-blue-600' : ''} 
              onClick={() => onTabChange?.(tab.value)}
              disabled={tab.disabled}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tab.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Main Content */}
      <div className="space-y-6">
        {children}
        {renderTable()}
      </div>

      {/* Custom Footer Content */}
      {customFooterContent}
    </div>
  );
};

export default StandardPageLayout;
