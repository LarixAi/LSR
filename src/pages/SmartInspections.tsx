import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Car,
  Wrench,
  Shield,
  Lightbulb,
  Fuel,
  CircleDot,
  Gauge,
  Thermometer,
  Navigation,
  FileText,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  DragHandle,
  GripVertical
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface InspectionQuestion {
  id: string;
  question: string;
  category: string;
  is_required: boolean;
  has_photo: boolean;
  has_notes: boolean;
  order_index: number;
  question_set_id: string;
  created_at: string;
  updated_at: string;
}

interface QuestionSet {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  questions: InspectionQuestion[];
}

// Sortable Question Component
interface SortableQuestionProps {
  question: InspectionQuestion;
  onEdit: (question: InspectionQuestion) => void;
  onDelete: (questionId: string) => void;
  getCategoryColor: (category: string) => string;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  question,
  onEdit,
  onDelete,
  getCategoryColor,
  getCategoryIcon,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const subscriptionAccess = useSubscriptionAccess();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 border rounded-lg ${
        isDragging ? 'shadow-lg bg-blue-50' : 'bg-white'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="flex items-center space-x-2 flex-1">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded ${getCategoryColor(question.category)}`}>
            {getCategoryIcon(question.category)}
          </div>
          <div className="flex-1">
            <p className="font-medium">{question.question}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                #{question.order_index + 1}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {question.category}
              </Badge>
              {question.is_required && (
                <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
              )}
              {question.has_photo && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">Photo</Badge>
              )}
              {question.has_notes && (
                <Badge className="bg-green-100 text-green-800 text-xs">Notes</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(question)}
          disabled={!subscriptionAccess.canEditQuestions}
          title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(question.id)}
          disabled={!subscriptionAccess.canEditQuestions}
          title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const SmartInspections = () => {
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const queryClient = useQueryClient();
  const subscriptionAccess = useSubscriptionAccess();

  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);
  const [isEditSetOpen, setIsEditSetOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InspectionQuestion | null>(null);
  const [orderModified, setOrderModified] = useState(false);

  // Form states
  const [setForm, setSetForm] = useState({
    name: '',
    description: '',
    is_active: true,
    is_default: false
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    category: 'general',
    is_required: true,
    has_photo: false,
    has_notes: true
  });

  // Fetch question sets
  const { data: questionSets = [], isLoading } = useQuery({
    queryKey: ['inspection-question-sets', selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) return [];

      const { data, error } = await supabase
        .from('inspection_question_sets')
        .select(`
          *,
          questions:inspection_questions(*)
        `)
        .eq('organization_id', selectedOrganizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QuestionSet[];
    },
    enabled: !!selectedOrganizationId
  });

  // Create question set mutation
  const createSetMutation = useMutation({
    mutationFn: async (setData: Omit<QuestionSet, 'id' | 'created_at' | 'updated_at' | 'questions'>) => {
      const { data, error } = await supabase
        .from('inspection_question_sets')
        .insert(setData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection-question-sets']);
      setIsCreateSetOpen(false);
      setSetForm({ name: '', description: '', is_active: true, is_default: false });
      toast.success('Question set created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create question set: ${error.message}`);
    }
  });

  // Update question set mutation
  const updateSetMutation = useMutation({
    mutationFn: async ({ id, ...setData }: Partial<QuestionSet> & { id: string }) => {
      const { data, error } = await supabase
        .from('inspection_question_sets')
        .update(setData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection-question-sets']);
      setIsEditSetOpen(false);
      setSelectedSet(null);
      toast.success('Question set updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update question set: ${error.message}`);
    }
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Omit<InspectionQuestion, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('inspection_questions')
        .insert(questionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection-question-sets']);
      setIsAddQuestionOpen(false);
      setQuestionForm({ question: '', category: 'general', is_required: true, has_photo: false, has_notes: true });
      toast.success('Question added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add question: ${error.message}`);
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, ...questionData }: Partial<InspectionQuestion> & { id: string }) => {
      const { data, error } = await supabase
        .from('inspection_questions')
        .update(questionData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection-question-sets']);
      setIsEditQuestionOpen(false);
      setEditingQuestion(null);
      toast.success('Question updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update question: ${error.message}`);
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('inspection_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection-question-sets']);
      toast.success('Question deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    }
  });

  // Mutation for updating question order
  const updateQuestionOrderMutation = useMutation({
    mutationFn: async ({ questionId, newOrderIndex }: { questionId: string; newOrderIndex: number }) => {
      const { error } = await supabase
        .from('inspection_questions')
        .update({ order_index: newOrderIndex })
        .eq('id', questionId);
      
      if (error) throw error;
      return { questionId, newOrderIndex };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-sets'] });
      setOrderModified(false);
      toast.success('Question order updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update question order: ${error.message}`);
    },
  });

  // Handle drag end for reordering questions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && selectedSet) {
      const oldIndex = selectedSet.questions.findIndex(q => q.id === active.id);
      const newIndex = selectedSet.questions.findIndex(q => q.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(selectedSet.questions, oldIndex, newIndex);
        
        // Update the local state immediately for better UX
        setSelectedSet(prev => prev ? { ...prev, questions: newQuestions } : null);
        setOrderModified(true);
        
        // Update order indices in the database
        newQuestions.forEach((question, index) => {
          updateQuestionOrderMutation.mutate({
            questionId: question.id,
            newOrderIndex: index
          });
        });
      }
    }
  };

  // Delete set mutation
  const deleteSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      const { error } = await supabase
        .from('inspection_question_sets')
        .delete()
        .eq('id', setId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inspection-question-sets']);
      setSelectedSet(null);
      toast.success('Question set deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete question set: ${error.message}`);
    }
  });

  const handleCreateSet = () => {
    if (!selectedOrganizationId || !profile?.id) return;

    createSetMutation.mutate({
      ...setForm,
      organization_id: selectedOrganizationId,
      created_by: profile.id
    });
  };

  const handleUpdateSet = () => {
    if (!selectedSet) return;

    updateSetMutation.mutate({
      id: selectedSet.id,
      ...setForm
    });
  };

  const handleAddQuestion = () => {
    if (!selectedSet) return;

    const maxOrder = Math.max(0, ...selectedSet.questions.map(q => q.order_index));
    
    createQuestionMutation.mutate({
      ...questionForm,
      question_set_id: selectedSet.id,
      order_index: maxOrder + 1
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    updateQuestionMutation.mutate({
      id: editingQuestion.id,
      ...questionForm
    });
  };

  const handleEditQuestion = (question: InspectionQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      category: question.category,
      is_required: question.is_required,
      has_photo: question.has_photo,
      has_notes: question.has_notes
    });
    setIsEditQuestionOpen(true);
  };

  const handleEditSet = (set: QuestionSet) => {
    setSelectedSet(set);
    setSetForm({
      name: set.name,
      description: set.description,
      is_active: set.is_active,
      is_default: set.is_default
    });
    setIsEditSetOpen(true);
  };

  // Function to create default question set with comprehensive questions
  const createDefaultQuestionSet = async () => {
    if (!selectedOrganizationId || !profile?.id) {
      toast.error('Authentication required');
      return;
    }

    try {
      // Call the SQL function to create default questions
      const { data, error } = await supabase.rpc('create_default_daily_pretrip_questions', {
        org_id: selectedOrganizationId,
        creator_id: profile.id
      });

      if (error) {
        console.error('Error creating default questions:', error);
        toast.error(`Failed to create default questions: ${error.message}`);
        return;
      }

      // Refresh the question sets
      queryClient.invalidateQueries(['inspection-question-sets']);
      toast.success('Default "Daily Pre-Trip Inspection" question set created with 56 comprehensive questions!');
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create default question set');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'exterior': return <Car className="w-4 h-4" />;
      case 'interior': return <Settings className="w-4 h-4" />;
      case 'engine': return <Gauge className="w-4 h-4" />;
      case 'tires': return <CircleDot className="w-4 h-4" />;
      case 'lights': return <Lightbulb className="w-4 h-4" />;
      case 'brakes': return <Shield className="w-4 h-4" />;
      case 'fuel': return <Fuel className="w-4 h-4" />;
      case 'safety': return <AlertTriangle className="w-4 h-4" />;
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'driver': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'exterior': return 'bg-blue-100 text-blue-800';
      case 'interior': return 'bg-purple-100 text-purple-800';
      case 'engine': return 'bg-orange-100 text-orange-800';
      case 'tires': return 'bg-slate-100 text-slate-800';
      case 'lights': return 'bg-yellow-100 text-yellow-800';
      case 'brakes': return 'bg-red-100 text-red-800';
      case 'fuel': return 'bg-green-100 text-green-800';
      case 'safety': return 'bg-amber-100 text-amber-800';
      case 'documentation': return 'bg-indigo-100 text-indigo-800';
      case 'driver': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading vehicle check questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚗 Vehicle Check Questions Management</h1>
          <p className="text-gray-600 mt-2">Manage vehicle inspection question sets and customize checklists</p>
          {subscriptionAccess.currentPlan && (
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Current Plan: {subscriptionAccess.currentPlan}
              </Badge>
              {subscriptionAccess.upgradeRequired && (
                <Badge variant="destructive" className="text-xs">
                  Upgrade Required
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {questionSets.length}/5 Question Sets
          </Badge>
          <Button 
            onClick={() => setIsCreateSetOpen(true)}
            disabled={questionSets.length >= 5 || !subscriptionAccess.canCreateQuestionSets}
            title={!subscriptionAccess.canCreateQuestionSets ? subscriptionAccess.upgradeMessage : ''}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Question Set
          </Button>
          <Button 
            variant="outline"
            onClick={createDefaultQuestionSet}
            disabled={questionSets.some(set => set.name === 'Daily Pre-Trip Inspection')}
          >
            <Car className="w-4 h-4 mr-2" />
            Import Default Questions
          </Button>
        </div>
      </div>

      {/* Upgrade Notice */}
      {subscriptionAccess.upgradeRequired && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Upgrade Required for Advanced Features
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {subscriptionAccess.upgradeMessage}
              </p>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/subscriptions'}
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Sets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionSets.map((set) => (
          <Card key={set.id} className={`${set.is_active ? 'border-blue-200' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span>{set.name}</span>
                    {set.is_default && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Default</Badge>
                    )}
                    {!set.is_active && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{set.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Questions:</span>
                <Badge variant="outline">{set.questions.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {set.questions.slice(0, 3).map((question) => (
                  <div key={question.id} className="flex items-center space-x-2 text-sm">
                    <div className={`p-1 rounded ${getCategoryColor(question.category)}`}>
                      {getCategoryIcon(question.category)}
                    </div>
                    <span className="text-gray-700 truncate">{question.question}</span>
                  </div>
                ))}
                {set.questions.length > 3 && (
                  <p className="text-xs text-gray-500">+{set.questions.length - 3} more questions</p>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSet(set)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSet(set)}
                    disabled={!subscriptionAccess.canEditQuestions}
                    title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSetMutation.mutate(set.id)}
                  disabled={set.is_default || !subscriptionAccess.canEditQuestions}
                  title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Set Details */}
      {selectedSet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>{selectedSet.name}</span>
                {selectedSet.is_default && (
                  <Badge className="bg-green-100 text-green-800">Default</Badge>
                )}
                {orderModified && (
                  <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                    <Save className="w-3 h-3 mr-1" />
                    Saving...
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddQuestionOpen(true)}
                  disabled={!subscriptionAccess.canEditQuestions}
                  title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSet(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600">{selectedSet.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSet.questions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions in this set yet.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddQuestionOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {subscriptionAccess.canReorderQuestions ? 'Drag to reorder questions' : 'Question reordering requires Professional plan'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedSet.questions.length} questions
                    </Badge>
                  </div>
                  
                  {subscriptionAccess.canReorderQuestions ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={selectedSet.questions
                          .sort((a, b) => a.order_index - b.order_index)
                          .map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {selectedSet.questions
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((question) => (
                            <SortableQuestion
                              key={question.id}
                              question={question}
                              onEdit={handleEditQuestion}
                              onDelete={(questionId) => deleteQuestionMutation.mutate(questionId)}
                              getCategoryColor={getCategoryColor}
                              getCategoryIcon={getCategoryIcon}
                            />
                          ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="space-y-3">
                      {selectedSet.questions
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((question) => (
                          <div key={question.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                            <div className="flex items-center space-x-2 flex-1">
                              <div className={`p-2 rounded ${getCategoryColor(question.category)}`}>
                                {getCategoryIcon(question.category)}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{question.question}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    #{question.order_index + 1}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.category}
                                  </Badge>
                                  {question.is_required && (
                                    <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                                  )}
                                  {question.has_photo && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">Photo</Badge>
                                  )}
                                  {question.has_notes && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Notes</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuestion(question)}
                                disabled={!subscriptionAccess.canEditQuestions}
                                title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteQuestionMutation.mutate(question.id)}
                                disabled={!subscriptionAccess.canEditQuestions}
                                title={!subscriptionAccess.canEditQuestions ? subscriptionAccess.upgradeMessage : ''}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Question Set Dialog */}
      <Dialog open={isCreateSetOpen} onOpenChange={setIsCreateSetOpen}>
        <DialogContent className="max-w-md" aria-describedby="create-set-description">
          <DialogHeader>
            <DialogTitle>Create Question Set</DialogTitle>
            <DialogDescription id="create-set-description">
              Create a new set of inspection questions for your vehicles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="set-name">Set Name</Label>
              <Input
                id="set-name"
                value={setForm.name}
                onChange={(e) => setSetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Pre-Trip Inspection"
              />
            </div>
            <div>
              <Label htmlFor="set-description">Description</Label>
              <Textarea
                id="set-description"
                value={setForm.description}
                onChange={(e) => setSetForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this question set"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={setForm.is_active}
                onCheckedChange={(checked) => setSetForm(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-default"
                checked={setForm.is_default}
                onCheckedChange={(checked) => setSetForm(prev => ({ ...prev, is_default: checked }))}
              />
              <Label htmlFor="is-default">Set as Default</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateSetOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSet}
                disabled={!setForm.name || createSetMutation.isPending}
              >
                {createSetMutation.isPending ? 'Creating...' : 'Create Set'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Set Dialog */}
      <Dialog open={isEditSetOpen} onOpenChange={setIsEditSetOpen}>
        <DialogContent className="max-w-md" aria-describedby="edit-set-description">
          <DialogHeader>
            <DialogTitle>Edit Question Set</DialogTitle>
            <DialogDescription id="edit-set-description">
              Modify the question set details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-set-name">Set Name</Label>
              <Input
                id="edit-set-name"
                value={setForm.name}
                onChange={(e) => setSetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Pre-Trip Inspection"
              />
            </div>
            <div>
              <Label htmlFor="edit-set-description">Description</Label>
              <Textarea
                id="edit-set-description"
                value={setForm.description}
                onChange={(e) => setSetForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this question set"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-active"
                checked={setForm.is_active}
                onCheckedChange={(checked) => setSetForm(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-is-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-default"
                checked={setForm.is_default}
                onCheckedChange={(checked) => setSetForm(prev => ({ ...prev, is_default: checked }))}
              />
              <Label htmlFor="edit-is-default">Set as Default</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditSetOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateSet}
                disabled={!setForm.name || updateSetMutation.isPending}
              >
                {updateSetMutation.isPending ? 'Updating...' : 'Update Set'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
        <DialogContent className="max-w-md" aria-describedby="add-question-description">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
            <DialogDescription id="add-question-description">
              Add a new question to the inspection checklist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                value={questionForm.question}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="e.g., Are all lights working properly?"
              />
            </div>
            <div>
              <Label htmlFor="question-category">Category</Label>
              <Select
                value={questionForm.category}
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="tires">Tires</SelectItem>
                  <SelectItem value="lights">Lights</SelectItem>
                  <SelectItem value="brakes">Brakes</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-required"
                checked={questionForm.is_required}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_required: checked }))}
              />
              <Label htmlFor="is-required">Required Question</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="has-photo"
                checked={questionForm.has_photo}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, has_photo: checked }))}
              />
              <Label htmlFor="has-photo">Require Photo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="has-notes"
                checked={questionForm.has_notes}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, has_notes: checked }))}
              />
              <Label htmlFor="has-notes">Allow Notes</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddQuestion}
                disabled={!questionForm.question || createQuestionMutation.isPending}
              >
                {createQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
        <DialogContent className="max-w-md" aria-describedby="edit-question-description">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription id="edit-question-description">
              Modify the question details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question-text">Question</Label>
              <Textarea
                id="edit-question-text"
                value={questionForm.question}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="e.g., Are all lights working properly?"
              />
            </div>
            <div>
              <Label htmlFor="edit-question-category">Category</Label>
              <Select
                value={questionForm.category}
                onValueChange={(value) => setQuestionForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="tires">Tires</SelectItem>
                  <SelectItem value="lights">Lights</SelectItem>
                  <SelectItem value="brakes">Brakes</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-required"
                checked={questionForm.is_required}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_required: checked }))}
              />
              <Label htmlFor="edit-is-required">Required Question</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-has-photo"
                checked={questionForm.has_photo}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, has_photo: checked }))}
              />
              <Label htmlFor="edit-has-photo">Require Photo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-has-notes"
                checked={questionForm.has_notes}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, has_notes: checked }))}
              />
              <Label htmlFor="edit-has-notes">Allow Notes</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditQuestionOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateQuestion}
                disabled={!questionForm.question || updateQuestionMutation.isPending}
              >
                {updateQuestionMutation.isPending ? 'Updating...' : 'Update Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartInspections;
