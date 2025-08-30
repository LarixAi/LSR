import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InspectionQuestion {
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

export interface QuestionSet {
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

export interface CreateQuestionSetData {
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  organization_id: string;
  created_by: string;
}

export interface CreateQuestionData {
  question: string;
  category: string;
  is_required: boolean;
  has_photo: boolean;
  has_notes: boolean;
  question_set_id: string;
  order_index: number;
}

export interface UpdateQuestionSetData {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface UpdateQuestionData {
  id: string;
  question?: string;
  category?: string;
  is_required?: boolean;
  has_photo?: boolean;
  has_notes?: boolean;
  order_index?: number;
}

export const useVehicleCheckQuestions = (organizationId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch question sets with questions
  const {
    data: questionSets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vehicle-check-questions', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('inspection_question_sets')
        .select(`
          *,
          questions:inspection_questions(*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching question sets:', error);
        throw error;
      }

      return data as QuestionSet[];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create question set mutation
  const createQuestionSetMutation = useMutation({
    mutationFn: async (setData: CreateQuestionSetData) => {
      const { data, error } = await supabase
        .from('inspection_question_sets')
        .insert(setData)
        .select()
        .single();

      if (error) {
        console.error('Error creating question set:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question set created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating question set:', error);
      toast.error(`Failed to create question set: ${error.message}`);
    }
  });

  // Update question set mutation
  const updateQuestionSetMutation = useMutation({
    mutationFn: async (setData: UpdateQuestionSetData) => {
      const { id, ...updateData } = setData;
      const { data, error } = await supabase
        .from('inspection_question_sets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating question set:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question set updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating question set:', error);
      toast.error(`Failed to update question set: ${error.message}`);
    }
  });

  // Delete question set mutation
  const deleteQuestionSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      const { error } = await supabase
        .from('inspection_question_sets')
        .delete()
        .eq('id', setId);

      if (error) {
        console.error('Error deleting question set:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question set deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting question set:', error);
      toast.error(`Failed to delete question set: ${error.message}`);
    }
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: CreateQuestionData) => {
      const { data, error } = await supabase
        .from('inspection_questions')
        .insert(questionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating question:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question added successfully');
    },
    onError: (error: any) => {
      console.error('Error creating question:', error);
      toast.error(`Failed to add question: ${error.message}`);
    }
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async (questionData: UpdateQuestionData) => {
      const { id, ...updateData } = questionData;
      const { data, error } = await supabase
        .from('inspection_questions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating question:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating question:', error);
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

      if (error) {
        console.error('Error deleting question:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting question:', error);
      toast.error(`Failed to delete question: ${error.message}`);
    }
  });

  // Update question order mutation
  const updateQuestionOrderMutation = useMutation({
    mutationFn: async ({ questionId, newOrderIndex }: { questionId: string; newOrderIndex: number }) => {
      const { error } = await supabase
        .from('inspection_questions')
        .update({ order_index: newOrderIndex })
        .eq('id', questionId);

      if (error) {
        console.error('Error updating question order:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Question order updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating question order:', error);
      toast.error(`Failed to update question order: ${error.message}`);
    }
  });

  // Create default question set with comprehensive questions
  const createDefaultQuestionSetMutation = useMutation({
    mutationFn: async ({ organizationId, createdBy }: { organizationId: string; createdBy: string }) => {
      // First create the question set
      const { data: setData, error: setError } = await supabase
        .from('inspection_question_sets')
        .insert({
          name: 'Daily Pre-Trip Inspection',
          description: 'Comprehensive daily vehicle inspection covering all safety-critical areas',
          is_active: true,
          is_default: true,
          organization_id: organizationId,
          created_by: createdBy
        })
        .select()
        .single();

      if (setError) {
        console.error('Error creating default question set:', setError);
        throw setError;
      }

      // Define comprehensive questions
      const defaultQuestions = [
        // Exterior Checks
        { question: 'Are there any fuel, oil, or fluid leaks under the vehicle?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 1 },
        { question: 'Is the windscreen clean and free from cracks or damage?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 2 },
        { question: 'Are all mirrors clean, secure, and properly adjusted?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 3 },
        { question: 'Are the headlights working and lenses clean?', category: 'lights', is_required: true, has_photo: true, has_notes: true, order_index: 4 },
        { question: 'Are the brake lights working properly?', category: 'lights', is_required: true, has_photo: true, has_notes: true, order_index: 5 },
        { question: 'Are the indicators working correctly?', category: 'lights', is_required: true, has_photo: true, has_notes: true, order_index: 6 },
        { question: 'Are the hazard lights functioning?', category: 'lights', is_required: true, has_photo: true, has_notes: true, order_index: 7 },
        { question: 'Are the tyres in good condition with adequate tread depth?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 8 },
        { question: 'Are the tyre pressures correct?', category: 'exterior', is_required: true, has_photo: false, has_notes: true, order_index: 9 },
        { question: 'Are the wheels and wheel nuts secure?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 10 },
        
        // Engine Checks
        { question: 'Is the engine oil level correct?', category: 'engine', is_required: true, has_photo: false, has_notes: true, order_index: 11 },
        { question: 'Is the coolant level adequate?', category: 'engine', is_required: true, has_photo: false, has_notes: true, order_index: 12 },
        { question: 'Is the brake fluid level correct?', category: 'engine', is_required: true, has_photo: false, has_notes: true, order_index: 13 },
        { question: 'Is the power steering fluid level adequate?', category: 'engine', is_required: true, has_photo: false, has_notes: true, order_index: 14 },
        { question: 'Is the fuel level sufficient for the journey?', category: 'engine', is_required: true, has_photo: false, has_notes: true, order_index: 15 },
        
        // Interior Checks
        { question: 'Are all seat belts in good condition and working properly?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 16 },
        { question: 'Are all seats secure and in good condition?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 17 },
        { question: 'Is the steering wheel secure and in good condition?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 18 },
        { question: 'Are all dashboard instruments working correctly?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 19 },
        { question: 'Is the horn working?', category: 'interior', is_required: true, has_photo: false, has_notes: true, order_index: 20 },
        
        // Safety Equipment
        { question: 'Is the fire extinguisher present and in date?', category: 'safety', is_required: true, has_photo: true, has_notes: true, order_index: 21 },
        { question: 'Is the first aid kit present and complete?', category: 'safety', is_required: true, has_photo: true, has_notes: true, order_index: 22 },
        { question: 'Are warning triangles present?', category: 'safety', is_required: true, has_photo: true, has_notes: true, order_index: 23 },
        { question: 'Is the high-visibility vest present?', category: 'safety', is_required: true, has_photo: true, has_notes: true, order_index: 24 },
        
        // Brake Checks
        { question: 'Do the brakes feel firm and responsive?', category: 'brakes', is_required: true, has_photo: false, has_notes: true, order_index: 25 },
        { question: 'Is there any unusual brake noise or vibration?', category: 'brakes', is_required: true, has_photo: false, has_notes: true, order_index: 26 },
        { question: 'Is the handbrake working effectively?', category: 'brakes', is_required: true, has_photo: false, has_notes: true, order_index: 27 },
        
        // Documentation
        { question: 'Is the vehicle registration document present?', category: 'documentation', is_required: true, has_photo: true, has_notes: true, order_index: 28 },
        { question: 'Is the insurance certificate present and valid?', category: 'documentation', is_required: true, has_photo: true, has_notes: true, order_index: 29 },
        { question: 'Is the MOT certificate present and valid?', category: 'documentation', is_required: true, has_photo: true, has_notes: true, order_index: 30 },
        { question: 'Is the tachograph card present and valid?', category: 'documentation', is_required: true, has_photo: true, has_notes: true, order_index: 31 },
        
        // Driver Checks
        { question: 'Is the driver\'s license present and valid?', category: 'driver', is_required: true, has_photo: true, has_notes: true, order_index: 32 },
        { question: 'Is the driver fit and well to drive?', category: 'driver', is_required: true, has_photo: false, has_notes: true, order_index: 33 },
        { question: 'Has the driver had adequate rest?', category: 'driver', is_required: true, has_photo: false, has_notes: true, order_index: 34 },
        { question: 'Is the driver wearing appropriate footwear?', category: 'driver', is_required: true, has_photo: false, has_notes: true, order_index: 35 },
        
        // Additional Checks
        { question: 'Are all doors closing properly and securely?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 36 },
        { question: 'Is the exhaust system secure and not leaking?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 37 },
        { question: 'Are all windows clean and free from damage?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 38 },
        { question: 'Is the wiper system working correctly?', category: 'exterior', is_required: true, has_photo: true, has_notes: true, order_index: 39 },
        { question: 'Is the washer fluid level adequate?', category: 'exterior', is_required: true, has_photo: false, has_notes: true, order_index: 40 },
        { question: 'Are all air vents working and clear?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 41 },
        { question: 'Is the heating/cooling system working?', category: 'interior', is_required: true, has_photo: false, has_notes: true, order_index: 42 },
        { question: 'Are all interior lights working?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 43 },
        { question: 'Is the radio/entertainment system working?', category: 'interior', is_required: false, has_photo: false, has_notes: true, order_index: 44 },
        { question: 'Is the satellite navigation working?', category: 'interior', is_required: false, has_photo: false, has_notes: true, order_index: 45 },
        { question: 'Are all storage compartments secure?', category: 'interior', is_required: true, has_photo: true, has_notes: true, order_index: 46 },
        { question: 'Is the load secure and properly distributed?', category: 'general', is_required: true, has_photo: true, has_notes: true, order_index: 47 },
        { question: 'Are all tools and equipment present?', category: 'general', is_required: true, has_photo: true, has_notes: true, order_index: 48 },
        { question: 'Is the vehicle clean and presentable?', category: 'general', is_required: true, has_photo: true, has_notes: true, order_index: 49 },
        { question: 'Are all warning lights off when engine is running?', category: 'engine', is_required: true, has_photo: true, has_notes: true, order_index: 50 },
        { question: 'Is the battery secure and terminals clean?', category: 'engine', is_required: true, has_photo: true, has_notes: true, order_index: 51 },
        { question: 'Are all belts and hoses in good condition?', category: 'engine', is_required: true, has_photo: true, has_notes: true, order_index: 52 },
        { question: 'Is the air filter clean and secure?', category: 'engine', is_required: true, has_photo: true, has_notes: true, order_index: 53 },
        { question: 'Are all electrical connections secure?', category: 'engine', is_required: true, has_photo: true, has_notes: true, order_index: 54 },
        { question: 'Is the fuel cap secure and not leaking?', category: 'engine', is_required: true, has_photo: true, has_notes: true, order_index: 55 },
        { question: 'Is the vehicle ready for the journey?', category: 'general', is_required: true, has_photo: false, has_notes: true, order_index: 56 }
      ];

      // Insert all questions
      const questionsWithSetId = defaultQuestions.map(q => ({
        ...q,
        question_set_id: setData.id
      }));

      const { error: questionsError } = await supabase
        .from('inspection_questions')
        .insert(questionsWithSetId);

      if (questionsError) {
        console.error('Error creating default questions:', questionsError);
        throw questionsError;
      }

      return setData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-check-questions'] });
      toast.success('Default "Daily Pre-Trip Inspection" question set created with 56 comprehensive questions!');
    },
    onError: (error: any) => {
      console.error('Error creating default question set:', error);
      toast.error(`Failed to create default question set: ${error.message}`);
    }
  });

  return {
    // Data
    questionSets,
    isLoading,
    error,
    
    // Actions
    refetch,
    createQuestionSet: createQuestionSetMutation.mutate,
    updateQuestionSet: updateQuestionSetMutation.mutate,
    deleteQuestionSet: deleteQuestionSetMutation.mutate,
    createQuestion: createQuestionMutation.mutate,
    updateQuestion: updateQuestionMutation.mutate,
    deleteQuestion: deleteQuestionMutation.mutate,
    updateQuestionOrder: updateQuestionOrderMutation.mutate,
    createDefaultQuestionSet: createDefaultQuestionSetMutation.mutate,
    
    // Loading states
    isCreatingSet: createQuestionSetMutation.isPending,
    isUpdatingSet: updateQuestionSetMutation.isPending,
    isDeletingSet: deleteQuestionSetMutation.isPending,
    isCreatingQuestion: createQuestionMutation.isPending,
    isUpdatingQuestion: updateQuestionMutation.isPending,
    isDeletingQuestion: deleteQuestionMutation.isPending,
    isUpdatingOrder: updateQuestionOrderMutation.isPending,
    isCreatingDefault: createDefaultQuestionSetMutation.isPending
  };
};