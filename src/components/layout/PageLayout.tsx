import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus } from 'lucide-react';

interface SummaryCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface TabOption {
  value: string;
  label: string;
  badge?: number;
}

interface PageLayoutProps {
  // Header
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  
  // Summary Cards
  summaryCards: SummaryCard[];
  
  // Filters
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  
  // Tabs
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  
  // Content
  children: React.ReactNode;
  isLoading?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export default function PageLayout({
  title,
  description,
  actionButton,
  summaryCards,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  tabs,
  activeTab,
  onTabChange,
  children,
  isLoading = false,
  emptyState
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        {actionButton && (
          <Button onClick={actionButton.onClick}>
            {actionButton.icon || <Plus className="w-4 h-4 mr-2" />}
            {actionButton.label}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={card.color || "text-muted-foreground"}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color || ""}`}>
                {card.value}
              </div>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      {(searchValue !== undefined || filters.length > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {searchValue !== undefined && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              {filters.map((filter, index) => (
                <Select key={index} value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filter.label} />
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : emptyState ? (
            <div className="text-center py-8">
              {emptyState.icon}
              <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
              <p className="text-gray-500 mb-4">{emptyState.description}</p>
              {emptyState.action && (
                <Button onClick={emptyState.action.onClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  {emptyState.action.label}
                </Button>
              )}
            </div>
          ) : (
            children
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
