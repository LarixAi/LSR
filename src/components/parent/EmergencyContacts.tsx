import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Mail, MapPin, Plus, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { useEmergencyContacts, useCreateEmergencyContact, useUpdateEmergencyContact, useDeleteEmergencyContact, type EmergencyContact } from '@/hooks/useEmergencyContacts';
import { useParentData } from '@/hooks/useParentData';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContactsProps {
  className?: string;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ className }) => {
  const { toast } = useToast();
  const { children } = useParentData();
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    contact_name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    is_primary: false
  });

  // Fetch emergency contacts for selected child or all children
  const { data: emergencyContacts = [], isLoading } = useEmergencyContacts(selectedChild);
  const createContactMutation = useCreateEmergencyContact();
  const updateContactMutation = useUpdateEmergencyContact();
  const deleteContactMutation = useDeleteEmergencyContact();

  const handleAddContact = async () => {
    if (!selectedChild) {
      toast({
        title: "Error",
        description: "Please select a child first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createContactMutation.mutateAsync({
        child_id: selectedChild,
        ...formData
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add emergency contact:', error);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      await updateContactMutation.mutateAsync({
        id: editingContact.id,
        ...formData
      });
      setIsEditDialogOpen(false);
      setEditingContact(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update emergency contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      try {
        await deleteContactMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete emergency contact:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      contact_name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      is_primary: false
    });
  };

  const openEditDialog = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      contact_name: contact.contact_name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || '',
      address: contact.address || '',
      is_primary: contact.is_primary
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const getChildName = (childId: number) => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.first_name} ${child.last_name}` : 'Unknown Child';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Emergency Contacts</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <select
                value={selectedChild || ''}
                onChange={(e) => setSelectedChild(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Children</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
              <Button onClick={openAddDialog} disabled={!selectedChild}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Emergency Contacts List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading emergency contacts...</span>
            </div>
          ) : emergencyContacts.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-600 mb-4">
                {selectedChild 
                  ? "No emergency contacts found for this child." 
                  : "No emergency contacts found. Select a child to add contacts."
                }
              </p>
              {selectedChild && (
                <Button onClick={openAddDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emergencyContacts.map((contact) => (
                <Card key={contact.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{contact.contact_name}</h3>
                        {contact.is_primary && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {contact.relationship}
                        </Badge>
                        {!selectedChild && (
                          <Badge variant="secondary" className="text-xs">
                            {getChildName(contact.child_id)}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-xs">{contact.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>
              Add a new emergency contact for {selectedChild ? getChildName(selectedChild) : 'your child'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Mother, Father, Grandparent"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_primary">Primary contact</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddContact}
                disabled={!formData.contact_name || !formData.relationship || !formData.phone || createContactMutation.isPending}
              >
                {createContactMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Emergency Contact</DialogTitle>
            <DialogDescription>
              Update the emergency contact information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_contact_name">Contact Name</Label>
              <Input
                id="edit_contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="edit_relationship">Relationship</Label>
              <Input
                id="edit_relationship"
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Mother, Father, Grandparent"
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Phone Number</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email (Optional)</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label htmlFor="edit_address">Address (Optional)</Label>
              <Textarea
                id="edit_address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit_is_primary">Primary contact</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateContact}
                disabled={!formData.contact_name || !formData.relationship || !formData.phone || updateContactMutation.isPending}
              >
                {updateContactMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyContacts;
