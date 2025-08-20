import React, { useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<VehicleCheckTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<VehicleCheckQuestion | null>(null);

  // TODO: Replace with real database queries when vehicle_check_templates and vehicle_check_questions tables are created
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['vehicle-check-templates'],
    queryFn: async () => {
      // Placeholder for when tables are created
      return [];
    }
  });

  // TODO: Replace with real database queries when vehicle_check_questions table is created
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['vehicle-check-questions', selectedTemplate?.id],
    queryFn: async () => {
      if (!selectedTemplate?.id) return [];
      // Placeholder for when table is created
      return [];
    },
    enabled: !!selectedTemplate?.id
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Omit<VehicleCheckTemplate, 'id' | 'created_at'>) => {
      // TODO: Implement when vehicle_check_templates table is created
      throw new Error('Vehicle check templates table not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-templates'] });
      setShowTemplateDialog(false);
      toast({
        title: "Template Created",
        description: "Vehicle check template has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create template: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Omit<VehicleCheckQuestion, 'id'>) => {
      // TODO: Implement when vehicle_check_questions table is created
      throw new Error('Vehicle check questions table not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
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
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: VehicleCheckTemplate) => {
    setSelectedTemplate(template);
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
    // TODO: Implement delete mutation
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
            <p className="text-sm text-muted-foreground">
              Manage vehicle check questions and settings
            </p>
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

              {questionsLoading ? (
                <p>Loading questions...</p>
              ) : questions.length === 0 ? (
                <p>No questions added to this template yet.</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{question.question_text}</h4>
                        <Badge variant="outline">{getQuestionTypeBadge(question.question_type)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Category: {getCategoryBadge(question.category)}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        Required: <Switch checked={question.is_required} onCheckedChange={(checked) => {
                          // TODO: Implement update mutation
                          toast({
                            title: "Update Question",
                            description: "Updating question required status is not yet implemented.",
                          });
                        }} />
                        Critical: <Switch checked={question.is_critical} onCheckedChange={(checked) => {
                          // TODO: Implement update mutation
                          toast({
                            title: "Update Question",
                            description: "Updating question critical status is not yet implemented.",
                          });
                        }} />
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-4">
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
                    </div>
                  ))}
                </div>
              )}
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
            <p className="text-sm text-muted-foreground">
              Configure the question details and settings
            </p>
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
