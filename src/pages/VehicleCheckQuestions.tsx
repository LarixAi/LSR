import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
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
  HelpCircle,
  Edit,
  Trash2,
  X,
  Wrench,
  Shield,
  Lightbulb,
  Fuel,
  CircleDot,
  Gauge,
  Thermometer,
  Navigation,
  ClipboardCheck,
  AlertCircle,
  CheckSquare,
  Square,
  Folder,
  Download
} from 'lucide-react';
import StandardPageLayout, { 
  MetricCard, 
  NavigationTab, 
  ActionButton, 
  FilterOption,
  TableColumn 
} from '@/components/layout/StandardPageLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Form Components
const AddQuestionForm: React.FC<{
  onSubmit: (data: {
    question: string;
    category: string;
    is_required: boolean;
    question_set_id: string;
  }) => void;
  onCancel: () => void;
  questionSets: InspectionQuestionSet[];
  categories: string[];
}> = ({ onSubmit, onCancel, questionSets, categories }) => {
  const [formData, setFormData] = useState({
    question: '',
    category: 'general',
    is_required: true,
    question_set_id: questionSets.find(set => set.is_default)?.id || questionSets[0]?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="Enter the inspection question..."
          value={formData.question}
          onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionSet">Question Set</Label>
          <Select value={formData.question_set_id} onValueChange={(value) => setFormData(prev => ({ ...prev, question_set_id: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionSets.map(set => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={formData.is_required}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
        />
        <Label htmlFor="required">Required Question</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.question.trim()}>
          Add Question
        </Button>
      </div>
    </form>
  );
};

const EditQuestionForm: React.FC<{
  question: EnhancedInspectionQuestion;
  onSubmit: (updates: Partial<EnhancedInspectionQuestion>) => void;
  onCancel: () => void;
  questionSets: InspectionQuestionSet[];
  categories: string[];
}> = ({ question, onSubmit, onCancel, questionSets, categories }) => {
  const [formData, setFormData] = useState({
    question: question.question,
    category: question.category,
    is_required: question.is_required,
    question_set_id: question.question_set_id
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.question.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-question">Question</Label>
        <Textarea
          id="edit-question"
          placeholder="Enter the inspection question..."
          value={formData.question}
          onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-questionSet">Question Set</Label>
          <Select value={formData.question_set_id} onValueChange={(value) => setFormData(prev => ({ ...prev, question_set_id: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionSets.map(set => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="edit-required"
          checked={formData.is_required}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
        />
        <Label htmlFor="edit-required">Required Question</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.question.trim()}>
          Update Question
        </Button>
      </div>
    </form>
  );
};

// Interface for the enhanced inspection questions
interface EnhancedInspectionQuestion {
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

// Interface for question sets
interface InspectionQuestionSet {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  questions: EnhancedInspectionQuestion[];
}

export default function VehicleCheckQuestions() {
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();

  // State for StandardPageLayout
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<string>('all');

  // State for questions and question sets
  const [questions, setQuestions] = useState<EnhancedInspectionQuestion[]>([]);
  const [questionSets, setQuestionSets] = useState<InspectionQuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for question management
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EnhancedInspectionQuestion | null>(null);

  // Fetch question sets and questions from backend
  useEffect(() => {
    const fetchQuestionSetsAndQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching data for organization:', selectedOrganizationId);
        
        // First, fetch all question sets for the organization
        const { data: setsData, error: setsError } = await supabase
          .from('inspection_question_sets')
          .select('*')
          .eq('organization_id', selectedOrganizationId)
          .order('created_at', { ascending: false });

        if (setsError) {
          console.error('Error fetching question sets:', setsError);
          throw setsError;
        }

        console.log('Question sets fetched:', setsData);
        
        // If no custom question sets exist, create a default set for drivers
        let finalQuestionSets = setsData || [];
        let finalQuestions: EnhancedInspectionQuestion[] = [];
        
        if (finalQuestionSets.length === 0) {
          console.log('No custom question sets found - creating default set for drivers');
          
          // Create default Daily Pre-Trip Inspection questions
          const defaultQuestions: EnhancedInspectionQuestion[] = [
            {
              id: 'default-1',
              question_set_id: 'default-set',
              question: 'Are all lights working properly? (headlights, taillights, turn signals, brake lights)',
              category: 'lights',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-2',
              question_set_id: 'default-set',
              question: 'Are tires in good condition with adequate tread depth?',
              category: 'tires',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-3',
              question_set_id: 'default-set',
              question: 'Are brakes functioning properly? (no unusual noises, adequate brake pedal feel)',
              category: 'brakes',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-4',
              question_set_id: 'default-set',
              question: 'Is the engine running smoothly with no unusual noises or warning lights?',
              category: 'engine',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 4,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-5',
              question_set_id: 'default-set',
              question: 'Is fuel level adequate for the planned trip?',
              category: 'fuel',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-6',
              question_set_id: 'default-set',
              question: 'Are all mirrors properly adjusted and clean?',
              category: 'general',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 6,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-7',
              question_set_id: 'default-set',
              question: 'Is the windshield clean and free of cracks or damage?',
              category: 'general',
              is_required: true,
              has_photo: false,
              has_notes: false,
              order_index: 7,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          // Create default question set
          const defaultSet: InspectionQuestionSet = {
            id: 'default-set',
            organization_id: selectedOrganizationId || 'default',
            name: 'Daily Pre-Trip Inspection (Default)',
            description: 'Essential safety questions for daily vehicle checks - automatically provided for all drivers',
            is_default: true,
            is_active: true,
            created_by: profile?.id || 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            questions: defaultQuestions
          };
          
          finalQuestionSets = [defaultSet];
          finalQuestions = defaultQuestions;
          
          console.log('✅ Created default question set with 7 essential questions');
          toast.success('No custom questions found - showing default Daily Pre-Trip Inspection questions');
        } else {
          // Fetch questions from existing custom sets
          const { data: questionsData, error: questionsError } = await supabase
            .from('inspection_questions')
            .select('*')
            .order('order_index', { ascending: true });

          if (questionsError) {
            console.error('Error fetching questions:', questionsError);
            throw questionsError;
          }

          console.log('Questions fetched:', questionsData);
          finalQuestions = questionsData || [];
        }
        
        setQuestionSets(finalQuestionSets);
        setQuestions(finalQuestions);
        
        console.log('✅ Successfully loaded:');
        console.log('- Questions:', finalQuestions.length);
        console.log('- Question Sets:', finalQuestionSets.length);
        console.log('- Categories:', [...new Set(finalQuestions.map(q => q.category))]);
        
        if (finalQuestionSets.length === 1 && finalQuestionSets[0].is_default) {
          toast.success(`Showing default Daily Pre-Trip Inspection with ${finalQuestions.length} essential questions`);
        } else {
          toast.success(`Loaded ${finalQuestions.length} questions from ${finalQuestionSets.length} question sets`);
        }
        
      } catch (err) {
        console.error('❌ Error fetching questions and question sets:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch questions');
        toast.error('Failed to load vehicle check questions');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedOrganizationId) {
      fetchQuestionSetsAndQuestions();
    } else {
      console.log('No organization ID available yet');
      setIsLoading(false);
    }
  }, [selectedOrganizationId]);

  // StandardPageLayout Configuration
  const pageTitle = "Enhanced Vehicle Check Questions";
  const pageDescription = "Comprehensive vehicle inspection questions including walk-around checks, daily pre-trip inspections, and enhanced safety protocols. Drivers always have access to essential safety questions.";

  const primaryAction: ActionButton = {
    label: "Add Question",
    onClick: () => setIsAddingQuestion(true),
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
          {
        label: "Refresh Data",
        onClick: () => {
          setIsLoading(true);
          setError(null);
          // Trigger a re-fetch using the same logic as useEffect
          const fetchData = async () => {
            try {
              const { data: setsData, error: setsError } = await supabase
                .from('inspection_question_sets')
                .select('*')
                .eq('organization_id', selectedOrganizationId)
                .order('created_at', { ascending: false });

              if (setsError) throw setsError;

              let finalQuestionSets = setsData || [];
              let finalQuestions: EnhancedInspectionQuestion[] = [];
              
              if (finalQuestionSets.length === 0) {
                // Recreate default questions if none exist
                const defaultQuestions: EnhancedInspectionQuestion[] = [
                  {
                    id: 'default-1',
                    question_set_id: 'default-set',
                    question: 'Are all lights working properly? (headlights, taillights, turn signals, brake lights)',
                    category: 'lights',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    id: 'default-2',
                    question_set_id: 'default-set',
                    question: 'Are tires in good condition with adequate tread depth?',
                    category: 'tires',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    id: 'default-3',
                    question_set_id: 'default-set',
                    question: 'Are brakes functioning properly? (no unusual noises, adequate brake pedal feel)',
                    category: 'brakes',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 3,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    id: 'default-4',
                    question_set_id: 'default-set',
                    question: 'Is the engine running smoothly with no unusual noises or warning lights?',
                    category: 'engine',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 4,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    id: 'default-5',
                    question_set_id: 'default-set',
                    question: 'Is fuel level adequate for the planned trip?',
                    category: 'fuel',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 5,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    id: 'default-6',
                    question_set_id: 'default-set',
                    question: 'Are all mirrors properly adjusted and clean?',
                    category: 'general',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 6,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  },
                  {
                    id: 'default-7',
                    question_set_id: 'default-set',
                    question: 'Is the windshield clean and free of cracks or damage?',
                    category: 'general',
                    is_required: true,
                    has_photo: false,
                    has_notes: false,
                    order_index: 7,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                ];
                
                const defaultSet: InspectionQuestionSet = {
                  id: 'default-set',
                  organization_id: selectedOrganizationId || 'default',
                  name: 'Daily Pre-Trip Inspection (Default)',
                  description: 'Essential safety questions for daily vehicle checks - automatically provided for all drivers',
                  is_default: true,
                  is_active: true,
                  created_by: profile?.id || 'system',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  questions: defaultQuestions
                };
                
                finalQuestionSets = [defaultSet];
                finalQuestions = defaultQuestions;
                toast.success('Refreshed: Showing default Daily Pre-Trip Inspection questions');
              } else {
                const { data: questionsData, error: questionsError } = await supabase
                  .from('inspection_questions')
                  .select('*')
                  .order('order_index', { ascending: true });

                if (questionsError) throw questionsError;
                finalQuestions = questionsData || [];
                toast.success(`Refreshed: ${questionsData?.length || 0} questions from ${setsData?.length || 0} sets`);
              }
              
              setQuestionSets(finalQuestionSets);
              setQuestions(finalQuestions);
              
            } catch (err) {
              toast.error('Failed to refresh data');
              console.error('Refresh error:', err);
            } finally {
              setIsLoading(false);
            }
          };
          fetchData();
        },
        icon: <Activity className="w-4 h-4" />,
        variant: "outline"
      },
    {
      label: "Export Questions",
      onClick: () => console.log("Export clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    
      {
        label: "Settings",
        onClick: () => console.log("Settings clicked"),
        icon: <Settings className="w-4 h-4" />,
        variant: "outline"
      }
  ];

  // Calculate metrics
  const totalQuestions = questions.length;
  const requiredQuestions = questions.filter(q => q.is_required).length;
  const photoQuestions = questions.filter(q => q.has_photo).length;
  const categories = [...new Set(questions.map(q => q.category))];

  const metricsCards: MetricCard[] = [
    {
      title: "Total Questions",
      value: totalQuestions.toString(),
      subtitle: "Enhanced Vehicle Checks",
      icon: <ClipboardCheck className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Required Questions",
      value: requiredQuestions.toString(),
      subtitle: "Must be answered",
      icon: <CheckSquare className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Photo Questions",
      value: photoQuestions.toString(),
      subtitle: "Require photo evidence",
      icon: <Eye className="w-5 h-5" />,
      bgColor: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      title: "Categories",
      value: categories.length.toString(),
      subtitle: "Question groups",
      icon: <Folder className="w-5 h-5" />,
      bgColor: "bg-orange-100",
      color: "text-orange-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "questions", label: "All Questions", badge: totalQuestions },
    { value: "question-sets", label: "Question Sets", badge: questionSets.length },
    { value: "categories", label: "Categories" },
    { value: "templates", label: "Templates" }
  ];

  const searchConfig = {
    placeholder: "Search questions by text, category, or type...",
    value: searchTerm,
    onChange: setSearchTerm,
    showSearch: true
  };

  const filters: FilterOption[] = [
    {
      label: "Category",
      value: categoryFilter,
      options: [
        { value: "all", label: "All Categories" },
        ...categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))
      ],
      placeholder: "Filter by category"
    },
    {
      label: "Question Set",
      value: selectedQuestionSet,
      options: [
        { value: "all", label: "All Question Sets" },
        ...questionSets.map(set => ({ value: set.id, label: set.name }))
      ],
      placeholder: "Filter by question set"
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "Category") setCategoryFilter(value);
    if (filterKey === "Question Set") setSelectedQuestionSet(value);
  };

  // Question management functions
  const handleAddQuestion = async (questionData: {
    question: string;
    category: string;
    is_required: boolean;
    question_set_id: string;
  }) => {
    try {
      const newQuestion: Omit<EnhancedInspectionQuestion, 'id' | 'created_at' | 'updated_at'> = {
        ...questionData,
        has_photo: false,
        has_notes: false,
        order_index: questions.length + 1,
        question_set_id: questionData.question_set_id || 'default-set'
      };

      // Add to local state first for immediate UI update
      const tempQuestion: EnhancedInspectionQuestion = {
        ...newQuestion,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setQuestions(prev => [...prev, tempQuestion]);
      setIsAddingQuestion(false);
      toast.success('Question added successfully!');

      // TODO: In production, save to backend here
      console.log('New question to save:', newQuestion);
    } catch (err) {
      toast.error('Failed to add question');
      console.error('Add question error:', err);
    }
  };

  const handleEditQuestion = async (questionId: string, updates: Partial<EnhancedInspectionQuestion>) => {
    try {
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, ...updates, updated_at: new Date().toISOString() } : q
      ));
      setEditingQuestion(null);
      toast.success('Question updated successfully!');

      // TODO: In production, save to backend here
      console.log('Question updates to save:', { questionId, updates });
    } catch (err) {
      toast.error('Failed to update question');
      console.error('Update question error:', err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast.success('Question deleted successfully!');

      // TODO: In production, delete from backend here
      console.log('Question to delete:', questionId);
    } catch (err) {
      toast.error('Failed to delete question');
      console.error('Delete question error:', err);
    }
  };



  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || question.category === categoryFilter;
    
    const matchesQuestionSet = selectedQuestionSet === 'all' || question.question_set_id === selectedQuestionSet;
    
    return matchesSearch && matchesCategory && matchesQuestionSet;
  });

  // Table data for questions
  const questionsTableData = filteredQuestions.map(question => ({
    id: question.id,
    question: question.question,
    category: question.category,
    required: question.is_required,
    photo: question.has_photo,
    notes: question.has_notes,
    order: question.order_index,
    questionSet: questionSets.find(set => set.id === question.question_set_id)?.name || 'Unknown'
  }));

  const questionsColumns: TableColumn[] = [
    { key: 'order', label: 'Order' },
    { key: 'question', label: 'Question' },
    { key: 'category', label: 'Category' },
    { key: 'questionSet', label: 'Question Set' },
    { 
      key: 'required', 
      label: 'Required',
      render: (item: any) => (
        <Badge className={item.required ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {item.required ? 'Yes' : 'No'}
        </Badge>
      )
    },
    { 
      key: 'photo', 
      label: 'Photo',
      render: (item: any) => (
        <Badge className={item.photo ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
          {item.photo ? 'Required' : 'Optional'}
        </Badge>
      )
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading enhanced vehicle check questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Questions</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchConfig={searchConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
      showTable={activeTab === 'questions'}
      tableData={questionsTableData}
      tableColumns={questionsColumns}
    >
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">


          {/* Question Sets Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Question Sets</CardTitle>
              <CardDescription>Available inspection question sets for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {questionSets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No question sets found for your organization.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questionSets.map((set) => (
                    <div key={set.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{set.name}</h3>
                        {set.is_default && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{set.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {questions.filter(q => q.question_set_id === set.id).length} questions
                        </span>
                        <Badge variant="outline" className={set.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {set.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Questions</CardTitle>
              <CardDescription>Latest additions to the inspection checklists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions.slice(0, 5).map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        question.is_required ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {question.category} • {questionSets.find(set => set.id === question.question_set_id)?.name || 'Unknown Set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {question.is_required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      {question.has_photo && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Photo</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Simple Question List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Questions</CardTitle>
                  <CardDescription>Manage your vehicle inspection questions</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddingQuestion(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{question.question}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {question.category}
                          </Badge>
                          {question.is_required && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                          className="h-8 px-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'question-sets' && (
        <div className="space-y-6">
          {questionSets.map((set) => {
            const setQuestions = questions.filter(q => q.question_set_id === set.id);
            const requiredCount = setQuestions.filter(q => q.is_required).length;
            const photoCount = setQuestions.filter(q => q.has_photo).length;
            
            return (
              <Card key={set.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {set.name}
                    {set.is_default && (
                      <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{set.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{setQuestions.length}</div>
                      <div className="text-sm text-blue-600">Total Questions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{requiredCount}</div>
                      <div className="text-sm text-green-600">Required</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{photoCount}</div>
                      <div className="text-sm text-purple-600">Photo Required</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {setQuestions.map((question) => (
                      <div key={question.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{question.question}</span>
                        <div className="flex space-x-1">
                          {question.is_required && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>
                          )}
                          {question.has_photo && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Photo</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryQuestions = questions.filter(q => q.category === category);
            const requiredCount = categoryQuestions.filter(q => q.is_required).length;
            const photoCount = categoryQuestions.filter(q => q.has_photo).length;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {category === 'lights' && <Lightbulb className="w-5 h-5" />}
                    {category === 'tires' && <CircleDot className="w-5 h-5" />}
                    {category === 'brakes' && <Shield className="w-5 h-5" />}
                    {category === 'engine' && <Gauge className="w-5 h-5" />}
                    {category === 'fuel' && <Fuel className="w-5 h-5" />}
                    {category === 'general' && <Car className="w-5 h-5" />}
                    {category === 'navigation' && <Navigation className="w-5 h-5" />}
                    {category}
                    <Badge variant="outline">{categoryQuestions.length} questions</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{categoryQuestions.length}</div>
                      <div className="text-sm text-blue-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{requiredCount}</div>
                      <div className="text-sm text-green-600">Required</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{photoCount}</div>
                      <div className="text-sm text-purple-600">Photo Required</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryQuestions.map((question) => (
                      <div key={question.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{question.question}</span>
                        <div className="flex space-x-1">
                          {question.is_required && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>
                          )}
                          {question.has_photo && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Photo</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Templates</CardTitle>
              <CardDescription>
                Pre-configured question sets for different types of vehicles and inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Template management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Add a new question to the Daily Pre-Trip Inspection. This question will be available to all drivers.
            </DialogDescription>
          </DialogHeader>
          
          <AddQuestionForm 
            onSubmit={handleAddQuestion}
            onCancel={() => setIsAddingQuestion(false)}
            questionSets={questionSets}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Modify the question properties. Changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>
          
          {editingQuestion && (
            <EditQuestionForm 
              question={editingQuestion}
              onSubmit={(updates) => handleEditQuestion(editingQuestion.id, updates)}
              onCancel={() => setEditingQuestion(null)}
              questionSets={questionSets}
              categories={categories}
            />
          )}
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
