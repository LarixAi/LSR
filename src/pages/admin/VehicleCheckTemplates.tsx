import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VehicleCheckTemplate {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  question_count: number;
  created_at: string;
}

interface VehicleCheckQuestion {
  id: string;
  question_text: string;
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  is_required: boolean;
  is_critical: boolean;
  order_index: number;
  category: string;
}

const VehicleCheckTemplates: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<VehicleCheckTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<VehicleCheckTemplate | null>(null);
  const [questions, setQuestions] = useState<VehicleCheckQuestion[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<VehicleCheckQuestion | null>(null);

  // Mock data - replace with actual API calls
  const mockTemplates: VehicleCheckTemplate[] = [
    {
      id: '1',
      name: 'Standard Vehicle Check',
      description: 'Comprehensive daily vehicle inspection checklist',
      is_active: true,
      question_count: 14,
      created_at: '2025-08-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Quick Daily Check',
      description: 'Basic safety inspection for daily use',
      is_active: true,
      question_count: 8,
      created_at: '2025-08-14T09:00:00Z'
    },
    {
      id: '3',
      name: 'Comprehensive Weekly Check',
      description: 'Detailed weekly inspection with additional checks',
      is_active: false,
      question_count: 25,
      created_at: '2025-08-13T14:00:00Z'
    }
  ];

  const mockQuestions: VehicleCheckQuestion[] = [
    {
      id: '1',
      question_text: 'Are all lights working?',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      order_index: 1,
      category: 'exterior'
    },
    {
      id: '2',
      question_text: 'Are tires in good condition with adequate tread?',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      order_index: 2,
      category: 'exterior'
    },
    {
      id: '3',
      question_text: 'What is the current mileage?',
      question_type: 'number',
      is_required: true,
      is_critical: false,
      order_index: 3,
      category: 'documentation'
    },
    {
      id: '4',
      question_text: 'Are you fit to drive?',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      order_index: 14,
      category: 'driver'
    }
  ];

  const handleCreateTemplate = () => {
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: VehicleCheckTemplate) => {
    setSelectedTemplate(template);
    setQuestions(mockQuestions);
    setShowTemplateDialog(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (question: VehicleCheckQuestion) => {
    setEditingQuestion(question);
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    toast({
      title: "Question Deleted",
      description: "The question has been removed from the template.",
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      exterior: 'bg-blue-100 text-blue-800',
      interior: 'bg-green-100 text-green-800',
      engine: 'bg-orange-100 text-orange-800',
      safety: 'bg-red-100 text-red-800',
      documentation: 'bg-purple-100 text-purple-800',
      driver: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const getQuestionTypeBadge = (type: string) => {
    const colors = {
      yes_no: 'bg-green-100 text-green-800',
      multiple_choice: 'bg-blue-100 text-blue-800',
      text: 'bg-purple-100 text-purple-800',
      number: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Check Templates</h1>
          <p className="text-muted-foreground">
            Manage vehicle inspection templates and questions
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">{template.question_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Questions Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? `Edit Template: ${selectedTemplate.name}` : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Manage vehicle check questions and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Template Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input 
                  id="template-name" 
                  defaultValue={selectedTemplate?.name || ''}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-status">Status</Label>
                <Select defaultValue={selectedTemplate?.is_active ? 'active' : 'inactive'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea 
                id="template-description" 
                defaultValue={selectedTemplate?.description || ''}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Button onClick={handleAddQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Critical</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.order_index}</TableCell>
                      <TableCell className="max-w-xs truncate">{question.question_text}</TableCell>
                      <TableCell>{getQuestionTypeBadge(question.question_type)}</TableCell>
                      <TableCell>{getCategoryBadge(question.category)}</TableCell>
                      <TableCell>
                        {question.is_required ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {question.is_critical ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button>
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              Configure the question details and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">Question Text</Label>
              <Textarea 
                id="question-text" 
                defaultValue={editingQuestion?.question_text || ''}
                placeholder="Enter the question text"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="question-type">Question Type</Label>
                <Select defaultValue={editingQuestion?.question_type || 'yes_no'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_no">Yes/No</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="number">Number Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-category">Category</Label>
                <Select defaultValue={editingQuestion?.category || 'general'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="question-order">Order</Label>
                <Input 
                  id="question-order" 
                  type="number"
                  defaultValue={editingQuestion?.order_index || 1}
                  min={1}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input 
                  type="checkbox" 
                  id="question-required"
                  defaultChecked={editingQuestion?.is_required || false}
                  className="rounded"
                />
                <Label htmlFor="question-required">Required</Label>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input 
                  type="checkbox" 
                  id="question-critical"
                  defaultChecked={editingQuestion?.is_critical || false}
                  className="rounded"
                />
                <Label htmlFor="question-critical">Critical (Fails check if No)</Label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                Cancel
              </Button>
              <Button>
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleCheckTemplates;
