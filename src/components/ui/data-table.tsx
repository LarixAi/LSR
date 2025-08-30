import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Link, Eye, Plus } from 'lucide-react';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
}

export interface DataTableProps {
  title: string;
  description?: string;
  columns: DataTableColumn[];
  data: any[];
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    };
  };
  showCheckboxes?: boolean;
  onRowClick?: (record: any) => void;
  highlightRows?: (record: any) => boolean;
}

export function DataTable({
  title,
  description,
  columns,
  data,
  emptyState,
  showCheckboxes = true,
  onRowClick,
  highlightRows
}: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {showCheckboxes && (
                  <th className="text-left p-3 font-medium text-sm">
                    <input type="checkbox" className="rounded" />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.key} className="text-left p-3 font-medium text-sm">
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && <ChevronDown className="h-3 w-3" />}
                    </div>
                  </th>
                ))}
                <th className="text-left p-3 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr 
                  key={record.id || index} 
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${highlightRows && highlightRows(record) ? 'border-l-4 border-l-red-500' : ''}`}
                  onClick={() => onRowClick && onRowClick(record)}
                >
                  {showCheckboxes && (
                    <td className="p-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="p-3">
                      {column.render ? column.render(record[column.key], record) : (
                        <span className="text-sm">{record[column.key] || "—"}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && emptyState && (
          <div className="text-center py-12">
            {emptyState.icon}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
            <p className="text-gray-600 mb-6">{emptyState.description}</p>
            {emptyState.action && (
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                {emptyState.action.icon}
                {emptyState.action.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Common column renderers
export const DataTableRenderers = {
  vehicle: (value: any, record: any) => (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500">🚗</span>
      </div>
      <div>
        <p className="font-medium">{record.vehicle?.id} [{record.vehicle?.name}]</p>
        <p className="text-xs text-gray-500">{record.vehicle?.group}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        record.vehicle?.status === "passed" ? "bg-green-500" :
        record.vehicle?.status === "flagged" ? "bg-orange-500" :
        record.vehicle?.status === "failed" ? "bg-red-500" :
        record.vehicle?.status === "pending" ? "bg-yellow-500" :
        "bg-gray-500"
      }`}></div>
    </div>
  ),
  
  vehicleGroup: (value: any) => (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Sample</Badge>
      <span className="text-sm">{value}</span>
      <Link className="h-3 w-3 text-gray-400" />
    </div>
  ),
  
  date: (value: any, record: any) => (
    <div className="flex items-center gap-1">
      <span className="text-sm">{value}</span>
      {value && <Link className="h-3 w-3 text-gray-400" />}
    </div>
  ),
  
  user: (value: any, record: any) => (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 bg-${record.user?.avatar || 'gray'}-500 rounded-full flex items-center justify-center text-white text-xs font-medium`}>
        {record.user?.initials || 'U'}
      </div>
      <span className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer underline">
        {record.user?.name || value}
      </span>
    </div>
  ),
  
  status: (value: any) => (
    <Badge className={`${
      value === "passed" ? "bg-green-100 text-green-800" :
      value === "pending" ? "bg-yellow-100 text-yellow-800" :
      value === "flagged" ? "bg-orange-100 text-orange-800" :
      value === "failed" ? "bg-red-100 text-red-800" :
      value === "scheduled" ? "bg-blue-100 text-blue-800" :
      "bg-gray-100 text-gray-800"
    }`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </Badge>
  ),
  
  locationException: (value: any) => (
    value ? (
      <span className="text-yellow-600">⚠️</span>
    ) : (
      <span className="text-gray-400">—</span>
    )
  )
};

