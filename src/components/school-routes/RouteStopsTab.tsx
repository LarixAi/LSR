import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface RouteStop {
  id: string;
  name: string;
  address: string;
  type: 'pickup' | 'dropoff' | 'both';
  order: number;
  estimatedTime: string;
  students: StudentInfo[];
  coordinates: { lat: number; lng: number };
}

interface StudentInfo {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

interface RouteStopsTabProps {
  stops: RouteStop[];
  onAddStop: () => void;
  onEditStop: (stop: RouteStop) => void;
  onDeleteStop: (stopId: string) => void;
  onMoveStopUp: (stopId: string) => void;
  onMoveStopDown: (stopId: string) => void;
}

export const RouteStopsTab: React.FC<RouteStopsTabProps> = ({
  stops,
  onAddStop,
  onEditStop,
  onDeleteStop,
  onMoveStopUp,
  onMoveStopDown
}) => {
  const getStopTypeBadge = (type: string) => {
    switch (type) {
      case 'pickup':
        return <Badge className="bg-blue-100 text-blue-800">Pickup</Badge>;
      case 'dropoff':
        return <Badge className="bg-green-100 text-green-800">Dropoff</Badge>;
      case 'both':
        return <Badge className="bg-purple-100 text-purple-800">Both</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const sortedStops = [...stops].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Route Stops</h3>
          <p className="text-sm text-muted-foreground">
            Manage pickup and dropoff locations for this route
          </p>
        </div>
        <Button onClick={onAddStop}>
          <Plus className="w-4 h-4 mr-2" />
          Add Stop
        </Button>
      </div>

      {/* Stops Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Stops ({stops.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stops configured for this route</p>
              <Button onClick={onAddStop} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First Stop
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStops.map((stop, index) => (
                  <TableRow key={stop.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <span>{stop.order}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveStopUp(stop.id)}
                            disabled={index === 0}
                            className="h-4 w-4 p-0"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveStopDown(stop.id)}
                            disabled={index === stops.length - 1}
                            className="h-4 w-4 p-0"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{stop.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {stop.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStopTypeBadge(stop.type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{stop.estimatedTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{stop.students.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditStop(stop)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteStop(stop.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stop Statistics */}
      {stops.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Stops</p>
                  <p className="text-2xl font-bold">{stops.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">
                    {stops.reduce((total, stop) => total + stop.students.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Stops</p>
                  <p className="text-2xl font-bold">
                    {stops.filter(stop => stop.type === 'pickup' || stop.type === 'both').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Dropoff Stops</p>
                  <p className="text-2xl font-bold">
                    {stops.filter(stop => stop.type === 'dropoff' || stop.type === 'both').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Route Map Preview */}
      {stops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Map Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive map will be displayed here</p>
                <p className="text-sm text-muted-foreground">
                  Showing {stops.length} stops in route order
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
