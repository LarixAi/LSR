import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Search,
  Plus,
  Minus
} from 'lucide-react';
import { usePartsInventory, Part, PartsRequest } from '@/hooks/usePartsInventory';
import { useOrganization } from '@/contexts/OrganizationContext';

interface PartsRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defectId: string;
  defectType: string;
  onRequestCreated?: (request: PartsRequest) => void;
}

const PartsRequestDialog: React.FC<PartsRequestDialogProps> = ({
  open,
  onOpenChange,
  defectId,
  defectType,
  onRequestCreated
}) => {
  const { selectedOrganizationId } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [notes, setNotes] = useState('');

  const {
    parts,
    getPartsForWorkOrder,
    createPartsRequest,
    isCreatingRequest
  } = usePartsInventory(selectedOrganizationId);

  // Get recommended parts based on defect type
  const recommendedParts = getPartsForWorkOrder(defectType);
  
  // Filter parts by search term
  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on_order':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedPart) return;

    try {
      await createPartsRequest({
        defect_id: defectId,
        part_id: selectedPart.id,
        quantity_requested: quantity,
        priority,
        notes
      });

      // Reset form
      setSelectedPart(null);
      setQuantity(1);
      setPriority('medium');
      setNotes('');
      setSearchTerm('');

      // Close dialog
      onOpenChange(false);

      // Notify parent component
      if (onRequestCreated) {
        // We'll need to get the created request data
        // For now, we'll just notify that it was created
        onRequestCreated({
          id: '',
          defect_id: defectId,
          part_id: selectedPart.id,
          quantity_requested: quantity,
          priority,
          status: 'pending',
          requested_by: '',
          requested_date: new Date().toISOString(),
          notes,
          part: {
            part_number: selectedPart.part_number,
            name: selectedPart.name
          }
        });
      }
    } catch (error) {
      console.error('Error creating parts request:', error);
    }
  };

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Request Parts for Repair</span>
          </DialogTitle>
          <DialogDescription>
            Select parts needed for this repair work order. Recommended parts are shown based on the defect type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recommended Parts Section */}
          {recommendedParts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>Recommended Parts</span>
                  <Badge variant="outline">{recommendedParts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendedParts.slice(0, 6).map((part) => (
                    <div
                      key={part.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPart?.id === part.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePartSelect(part)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{part.name}</h4>
                          <p className="text-xs text-gray-600">{part.part_number}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(part.status)}>
                              {part.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              Qty: {part.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">£{part.unit_price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Select Part */}
          <Card>
            <CardHeader>
              <CardTitle>Search Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search parts by name, number, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredParts.map((part) => (
                  <div
                    key={part.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPart?.id === part.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePartSelect(part)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{part.name}</h4>
                        <p className="text-sm text-gray-600">{part.part_number}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {part.category}
                          </Badge>
                          <Badge className={getStatusColor(part.status)}>
                            {part.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            Available: {part.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">£{part.unit_price}</p>
                        {part.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {part.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Part Details */}
          {selectedPart && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Part</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Part Name</Label>
                    <p className="text-sm">{selectedPart.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Part Number</Label>
                    <p className="text-sm">{selectedPart.part_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Badge variant="outline">{selectedPart.category}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedPart.status)}>
                      {selectedPart.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Available Quantity</Label>
                    <p className="text-sm">{selectedPart.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit Price</Label>
                    <p className="text-sm font-medium">£{selectedPart.unit_price}</p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity Requested</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-20 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Total Cost</Label>
                      <p className="text-lg font-bold">£{(selectedPart.unit_price * quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes about this parts request..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRequest}
            disabled={!selectedPart || isCreatingRequest}
            className="min-w-[120px]"
          >
            {isCreatingRequest ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Request Part
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartsRequestDialog;
