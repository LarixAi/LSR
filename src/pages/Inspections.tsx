import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Car,
  Users,
  Settings,
  Activity,
  Calendar,
  Eye,
  ChevronDown,
  Truck,
  Link
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function Inspections() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  const inspectionStats = {
    totalInspections: 5,
    completedInspections: 3,
    pendingInspections: 0,
    failedInspections: 0,
    upcomingInspections: 0,
    complianceRate: 60
  };

  // Mock inspection records data
  const inspectionRecords = [
    {
      id: 1,
      vehicle: { id: "VAN002", name: "Ford Transit", status: "passed" },
      submitted: "Aug 22, 2025",
      duration: "9m",
      inspectionForm: "Daily Inspection",
      user: { name: "larone laing", initials: "LL" },
      locationException: false,
      failedItems: null,
      status: "passed",
      registration: "XYZ789",
      frequency: "daily"
    },
    {
      id: 2,
      vehicle: { id: "VH001", name: "Mercedes-Benz Sprinter", status: "flagged" },
      submitted: "Aug 18, 2025",
      duration: "15m",
      inspectionForm: "4 Weekly Inspection",
      user: { name: "larone laing", initials: "LL" },
      locationException: true,
      failedItems: "Defects Found",
      status: "flagged",
      registration: "AB12 CDE",
      frequency: "4 weekly"
    },
    {
      id: 3,
      vehicle: { id: "BUS001", name: "Blue Bird Vision", status: "flagged" },
      submitted: "Aug 18, 2025",
      duration: "12m",
      inspectionForm: "4 Weekly Inspection",
      user: { name: "larone laing", initials: "LL" },
      locationException: true,
      failedItems: "Defects Found",
      status: "flagged",
      registration: "ABC123",
      frequency: "4 weekly"
    },
    {
      id: 4,
      vehicle: { id: "VH001", name: "Mercedes-Benz Sprinter", status: "passed" },
      submitted: "Aug 13, 2025",
      duration: "10m",
      inspectionForm: "6 Weekly Inspection",
      user: { name: "larone laing", initials: "LL" },
      locationException: false,
      failedItems: null,
      status: "passed",
      registration: "AB12 CDE",
      frequency: "6 weekly"
    },
    {
      id: 5,
      vehicle: { id: "BUS001", name: "Blue Bird Vision", status: "passed" },
      submitted: "Aug 13, 2025",
      duration: "8m",
      inspectionForm: "6 Weekly Inspection",
      user: { name: "larone laing", initials: "LL" },
      locationException: false,
      failedItems: null,
      status: "passed",
      registration: "ABC123",
      frequency: "6 weekly"
    }
  ];

  const filteredRecords = activeTab === "all" ? inspectionRecords : inspectionRecords.filter(record => record.status === activeTab);

  return (
    <PageLayout
      title="Vehicle Inspections"
      description="Manage vehicle inspections, compliance monitoring, and safety checks"
      actionButton={{
        label: "Schedule Inspection",
        onClick: () => console.log("Schedule inspection"),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        { title: "Total Inspections", value: inspectionStats.totalInspections, icon: <FileText className="h-4 w-4" />, color: "text-blue-600" },
        { title: "Completed", value: inspectionStats.completedInspections, icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600" },
        { title: "Pending", value: inspectionStats.pendingInspections, icon: <Clock className="h-4 w-4" />, color: "text-yellow-600" },
        { title: "Failed", value: inspectionStats.failedInspections, icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600" },
        { title: "Upcoming", value: inspectionStats.upcomingInspections, icon: <Calendar className="h-4 w-4" />, color: "text-purple-600" },
        { title: "Compliance Rate", value: `${inspectionStats.complianceRate}%`, icon: <Activity className="h-4 w-4" />, color: "text-indigo-600" }
      ]}
      searchPlaceholder="Search vehicles, drivers, or license plates..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "Status",
          value: viewFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
            { value: "upcoming", label: "Upcoming" }
          ],
          onChange: setViewFilter
        }
      ]}
      tabs={[
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "passed", label: "Passed" },
        { value: "flagged", label: "Flagged" },
        { value: "failed", label: "Failed" },
        { value: "scheduled", label: "Scheduled" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
      emptyState={null}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Inspections
          </CardTitle>
          <CardDescription>
            {activeTab === "all" && "All vehicle inspection records"}
            {activeTab === "pending" && "Pending inspections awaiting completion"}
            {activeTab === "passed" && "Successfully completed inspections"}
            {activeTab === "flagged" && "Inspections with issues requiring attention"}
            {activeTab === "failed" && "Failed inspections requiring action"}
            {activeTab === "scheduled" && "Upcoming scheduled inspections"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Vehicle
                    </div>
                  </th>
                  <th className="text-left p-3 font-medium text-sm">Vehicle Group</th>
                  <th className="text-left p-3 font-medium text-sm">
                    <div className="flex items-center gap-1">
                      Submitted
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left p-3 font-medium text-sm">Duration</th>
                  <th className="text-left p-3 font-medium text-sm">Inspection Form</th>
                  <th className="text-left p-3 font-medium text-sm">User</th>
                  <th className="text-left p-3 font-medium text-sm">Location Exception</th>
                  <th className="text-left p-3 font-medium text-sm">Failed Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      (record.status === "flagged" || record.status === "failed") ? 'border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center relative">
                            <div className="w-8 h-6 bg-gray-200 rounded-sm"></div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              record.vehicle.status === "passed" ? "bg-green-500" :
                              record.vehicle.status === "flagged" ? "bg-orange-500" :
                              record.vehicle.status === "failed" ? "bg-red-500" :
                              record.vehicle.status === "pending" ? "bg-yellow-500" :
                              "bg-gray-500"
                            }`}></div>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{record.vehicle.id} - {record.vehicle.name}</p>
                            <p className="text-xs text-gray-500">{record.registration} • {record.user.name}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Sample</Badge>
                        <span className="text-sm">Management</span>
                        <Link className="h-3 w-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm underline cursor-pointer">
                          {record.submitted}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{record.duration}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{record.inspectionForm}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {record.user.initials}
                        </div>
                        <span className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer underline">
                          {record.user.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {record.locationException ? (
                        <span className="text-orange-600">⚠️</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{record.failedItems || "—"}</span>
                        {record.status === "flagged" && record.failedItems === "Defects Found" && (
                          <Button variant="destructive" size="sm" className="h-6 px-2 text-xs">
                            Defects Found
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} inspections found</h3>
              <p className="text-gray-600 mb-6">No inspection records available.</p>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}