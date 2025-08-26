import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, Settings, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { 
  useVehicleCheckTemplates,
  useVehicleCheckTemplate,
  useCreateVehicleCheckTemplate,
  useUpdateVehicleCheckTemplate,
  useDeleteVehicleCheckTemplate,
  useVehicleCheckTemplateStats,
  type VehicleCheckTemplate,
  type CreateVehicleCheckTemplateData,
  type UpdateVehicleCheckTemplateData
} from '@/hooks/useVehicleCheckTemplates';
import { useVehicleCheckQuestions } from '@/hooks/useVehicleCheckQuestions';

interface VehicleCheckQuestion {
  id: string;
  template_id: string;
  question_text: string;
  question_type: 'yes_no' | 'number' | 'text' | 'multiple_choice';
  is_required: boolean;
  is_critical: boolean;
  order_index: number;
  category: string;
  options?: string[];
}

export default function VehicleCheckTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<VehicleCheckTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<VehicleCheckQuestion | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<VehicleCheckTemplate | null>(null);

  // Use real backend data
  const { data: templates = [], isLoading: templatesLoading } = useVehicleCheckTemplates();
  const { data: questions = [], isLoading: questionsLoading } = useVehicleCheckQuestions(selectedTemplate?.id);
  const { data: stats } = useVehicleCheckTemplateStats();

  const createTemplateMutation = useCreateVehicleCheckTemplate();
  const updateTemplateMutation = useUpdateVehicleCheckTemplate();
  const deleteTemplateMutation = useDeleteVehicleCheckTemplate();

  // Handle template creation success
  useEffect(() => {
    if (createTemplateMutation.isSuccess) {
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      toast({
        title: "Template Created",
        description: "Vehicle check template has been created successfully.",
      });
    }
  }, [createTemplateMutation.isSuccess, toast]);

  // Handle template creation error
  useEffect(() => {
    if (createTemplateMutation.isError) {
      toast({
        title: "Error",
        description: `Failed to create template: ${createTemplateMutation.error?.message}`,
        variant: "destructive"
      });
    }
  }, [createTemplateMutation.isError, createTemplateMutation.error, toast]);

  // Handle template update success
  useEffect(() => {
    if (updateTemplateMutation.isSuccess) {
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      toast({
        title: "Template Updated",
        description: "Vehicle check template has been updated successfully.",
      });
    }
  }, [updateTemplateMutation.isSuccess, toast]);

  // Handle template update error
  useEffect(() => {
    if (updateTemplateMutation.isError) {
      toast({
        title: "Error",
        description: `Failed to update template: ${updateTemplateMutation.error?.message}`,
        variant: "destructive"
      });
    }
  }, [updateTemplateMutation.isError, updateTemplateMutation.error, toast]);

  // Handle template deletion success
  useEffect(() => {
    if (deleteTemplateMutation.isSuccess) {
      toast({
        title: "Template Deleted",
        description: "Vehicle check template has been deleted successfully.",
      });
    }
  }, [deleteTemplateMutation.isSuccess, toast]);

  // Handle template deletion error
  useEffect(() => {
    if (deleteTemplateMutation.isError) {
      toast({
        title: "Error",
        description: `Failed to delete template: ${deleteTemplateMutation.error?.message}`,
        variant: "destructive"
      });
    }
  }, [deleteTemplateMutation.isError, deleteTemplateMutation.error, toast]);

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Omit<VehicleCheckQuestion, 'id'>) => {
      // TODO: Implement when vehicle_check_questions table is created
      throw new Error('Vehicle check questions table not yet implemented');
    },
    onSuccess: () => {
      setShowQuestionDialog(false);
      setEditingQuestion(null);
      toast({
        title: "Question Added",
        description: "Question has been added to the template.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add question: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: VehicleCheckTemplate) => {
    setEditingTemplate(template);
    setShowTemplateDialog(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteTemplateMutation.mutate(templateId);
    }
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
    // TODO: Implement delete mutation
    toast({
      title: "Question Deleted",
      description: "The question has been removed from the template.",
    });
  };

  const handleSubmitTemplate = (formData: any) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        templateId: editingTemplate.id,
        templateData: formData
      });
    } else {
      createTemplateMutation.mutate(formData);
    }
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

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

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

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Default Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.defaultTemplates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{template.category}</Badge>
                {template.is_default && <Badge variant="secondary">Default</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Version:</span>
                  <span className="font-medium">{template.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Required Checks:</span>
                  <span className="font-medium">{template.required_checks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Optional Checks:</span>
                  <span className="font-medium">{template.optional_checks}</span>
                </div>
                {template.estimated_completion_time_minutes && (
                  <div className="flex justify-between text-sm">
                    <span>Est. Time:</span>
                    <span className="font-medium">{template.estimated_completion_time_minutes} min</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  disabled={deleteTemplateMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm
            template={editingTemplate}
            onSubmit={handleSubmitTemplate}
            isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Questions Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Template Questions: {selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            <TemplateQuestions
              template={selectedTemplate}
              questions={questions}
              isLoading={questionsLoading}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Question Form Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>
          <QuestionForm
            question={editingQuestion}
            templateId={selectedTemplate?.id}
            onSubmit={(data) => createQuestionMutation.mutate(data)}
            isLoading={createQuestionMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Form Component
function TemplateForm({ 
  template, 
  onSubmit, 
  isLoading 
}: { 
  template: VehicleCheckTemplate | null; 
  onSubmit: (data: CreateVehicleCheckTemplateData | UpdateVehicleCheckTemplateData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'pre_trip' as const,
    vehicle_types: template?.vehicle_types || [],
    is_active: template?.is_active ?? true,
    is_default: template?.is_default ?? false,
    safety_critical: template?.safety_critical ?? false,
    compliance_required: template?.compliance_required ?? false,
    required_checks: template?.required_checks || 0,
    optional_checks: template?.optional_checks || 0,
    estimated_completion_time_minutes: template?.estimated_completion_time_minutes || 0,
    compliance_standards: template?.compliance_standards || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pre_trip">Pre-Trip</SelectItem>
              <SelectItem value="post_trip">Post-Trip</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="required_checks">Required Checks</Label>
          <Input
            id="required_checks"
            type="number"
            value={formData.required_checks}
            onChange={(e) => setFormData({ ...formData, required_checks: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="optional_checks">Optional Checks</Label>
          <Input
            id="optional_checks"
            type="number"
            value={formData.optional_checks}
            onChange={(e) => setFormData({ ...formData, optional_checks: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="estimated_time">Estimated Completion Time (minutes)</Label>
        <Input
          id="estimated_time"
          type="number"
          value={formData.estimated_completion_time_minutes}
          onChange={(e) => setFormData({ ...formData, estimated_completion_time_minutes: parseInt(e.target.value) || 0 })}
          min="0"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_default"
            checked={formData.is_default}
            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
          />
          <Label htmlFor="is_default">Default Template</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="safety_critical"
            checked={formData.safety_critical}
            onCheckedChange={(checked) => setFormData({ ...formData, safety_critical: checked })}
          />
          <Label htmlFor="safety_critical">Safety Critical</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="compliance_required"
            checked={formData.compliance_required}
            onCheckedChange={(checked) => setFormData({ ...formData, compliance_required: checked })}
          />
          <Label htmlFor="compliance_required">Compliance Required</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
        </Button>
      </div>
    </form>
  );
}

// Template Questions Component
function TemplateQuestions({
  template,
  questions,
  isLoading,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion
}: {
  template: VehicleCheckTemplate;
  questions: VehicleCheckQuestion[];
  isLoading: boolean;
  onAddQuestion: () => void;
  onEditQuestion: (question: VehicleCheckQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
        <Button onClick={onAddQuestion} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No questions added to this template yet.</p>
          <Button onClick={onAddQuestion} className="mt-2">
            Add First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{question.question_text}</span>
                      {getQuestionTypeBadge(question.question_type)}
                      {getCategoryBadge(question.category)}
                      {question.is_required && <Badge variant="destructive">Required</Badge>}
                      {question.is_critical && <Badge variant="destructive">Critical</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order: {question.order_index} | Type: {question.question_type}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditQuestion(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Question Form Component
function QuestionForm({
  question,
  templateId,
  onSubmit,
  isLoading
}: {
  question: VehicleCheckQuestion | null;
  templateId?: string;
  onSubmit: (data: Omit<VehicleCheckQuestion, 'id'>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'yes_no' as const,
    is_required: question?.is_required ?? false,
    is_critical: question?.is_critical ?? false,
    order_index: question?.order_index || 1,
    category: question?.category || 'safety',
    options: question?.options || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) return;
    
    onSubmit({
      ...formData,
      template_id: templateId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question_text">Question Text</Label>
        <Textarea
          id="question_text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="question_type">Question Type</Label>
          <Select
            value={formData.question_type}
            onValueChange={(value) => setFormData({ ...formData, question_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes_no">Yes/No</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
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
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="order_index">Order Index</Label>
        <Input
          id="order_index"
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
          min="1"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_required"
            checked={formData.is_required}
            onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
          />
          <Label htmlFor="is_required">Required</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_critical"
            checked={formData.is_critical}
            onCheckedChange={(checked) => setFormData({ ...formData, is_critical: checked })}
          />
          <Label htmlFor="is_critical">Critical</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !templateId}>
          {isLoading ? 'Saving...' : (question ? 'Update Question' : 'Add Question')}
        </Button>
      </div>
    </form>
  );
}
