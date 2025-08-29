
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Wrench, User, Phone, Mail } from 'lucide-react';
import { useMechanics } from '@/hooks/useMechanics';

interface MechanicsListProps {
  onAddMechanic: () => void;
}

const MechanicsList = ({ onAddMechanic }: MechanicsListProps) => {
  const { data: mechanics = [], isLoading, error } = useMechanics();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading mechanics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading mechanics: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mechanics</h3>
          <p className="text-sm text-gray-600">Manage mechanics and their specializations</p>
        </div>
        <Button onClick={onAddMechanic}>
          <Plus className="w-4 h-4 mr-2" />
          Add Mechanic
        </Button>
      </div>

      {mechanics.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No mechanics found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mechanic</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mechanics.map((mechanic) => (
                  <TableRow key={mechanic.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {mechanic.profiles?.first_name} {mechanic.profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {mechanic.profiles?.employee_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {mechanic.profiles?.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1" />
                            {mechanic.profiles.email}
                          </div>
                        )}
                        {mechanic.profiles?.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {mechanic.profiles.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mechanic.certification_level ? (
                        <Badge variant="secondary">
                          {mechanic.certification_level.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mechanic.specializations && mechanic.specializations.length > 0 ? (
                          mechanic.specializations.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400">None specified</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mechanic.hourly_rate ? (
                        <span className="font-medium">${mechanic.hourly_rate}/hr</span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mechanic.is_available ? 'default' : 'secondary'}>
                        {mechanic.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MechanicsList;
