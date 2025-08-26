import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VehicleCheckQuestion {
  id: string;
  question: string;
  category: 'exterior' | 'interior' | 'engine' | 'safety' | 'documentation' | 'lights' | 'tires' | 'brakes' | 'fuel' | 'general' | 'driver';
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'number' | 'photo';
  is_required: boolean;
  is_critical: boolean;
  has_photo: boolean;
  has_notes: boolean;
  order_index: number;
  guidance?: string;
  question_set_id: string;
}

export interface VehicleCheckQuestionSet {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  questions?: VehicleCheckQuestion[];
}

// Default fallback questions (matches the mobile component)
const getDefaultVehicleCheckQuestions = (): VehicleCheckQuestion[] => {
  return [
    {
      id: '1',
      question: 'Are there any fuel, oil, or fluid leaks under the vehicle?',
      category: 'exterior',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 1,
      guidance: 'Check for any visible leaks under the vehicle. Look for oil, fuel, coolant, or other fluid stains on the ground. Pay attention to the engine area, transmission, and fuel tank.',
      question_set_id: 'default'
    },
    {
      id: '2',
      question: 'Is the windscreen clean and free from cracks or damage?',
      category: 'exterior',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 2,
      guidance: 'Inspect the windscreen for cracks, chips, or damage. Ensure it\'s clean and provides clear visibility. Check for any delamination or distortion.',
      question_set_id: 'default'
    },
    {
      id: '3',
      question: 'Are the windscreen wipers and washers working correctly?',
      category: 'exterior',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: false,
      has_notes: true,
      order_index: 3,
      guidance: 'Test the wipers by turning them on. Check that they clear the windscreen effectively. Test the washer fluid spray and ensure it reaches the windscreen.',
      question_set_id: 'default'
    },
    {
      id: '4',
      question: 'Are the headlights (main/dip) working and lenses clean?',
      category: 'lights',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 4,
      guidance: 'Turn on the headlights and check both main beam and dipped beam. Ensure lenses are clean and not cracked. Check that both lights are working.',
      question_set_id: 'default'
    },
    {
      id: '5',
      question: 'Are the front indicators including side repeaters working?',
      category: 'lights',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: false,
      has_notes: true,
      order_index: 5,
      guidance: 'Test all front indicators including side repeaters. Ensure they flash at the correct rate and are visible from all angles.',
      question_set_id: 'default'
    },
    {
      id: '6',
      question: 'Is the horn working clearly?',
      category: 'general',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: false,
      has_notes: true,
      order_index: 6,
      guidance: 'Test the horn by pressing it. Ensure it produces a clear, audible sound that can be heard from outside the vehicle.',
      question_set_id: 'default'
    },
    {
      id: '7',
      question: 'Are mirrors fitted, secure, adjusted, and not cracked?',
      category: 'exterior',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 7,
      guidance: 'Check all mirrors are securely fitted and properly adjusted. Ensure they\'re not cracked or damaged. Test that they provide adequate rearward visibility.',
      question_set_id: 'default'
    },
    {
      id: '8',
      question: 'Is the front registration plate present, clean, and secure?',
      category: 'exterior',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 8,
      guidance: 'Verify the front registration plate is present, clean, and securely attached. Check that all numbers and letters are clearly visible and not obscured.',
      question_set_id: 'default'
    },
    {
      id: '9',
      question: 'Are the tyres in good condition with adequate tread depth and proper inflation?',
      category: 'tires',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 9,
      guidance: 'Inspect all tyres on the passenger side. Check tread depth (minimum 1.6mm), look for cuts, bulges, or damage. Check tyre pressure and ensure valve caps are present.',
      question_set_id: 'default'
    },
    {
      id: '10',
      question: 'Are the wheel nuts secure with no cracks, rust marks, or missing nuts?',
      category: 'tires',
      question_type: 'yes_no',
      is_required: true,
      is_critical: true,
      has_photo: true,
      has_notes: true,
      order_index: 10,
      guidance: 'Check all wheel nuts are present and properly tightened. Look for any signs of rust, cracks, or missing nuts. Ensure wheel covers are secure.',
      question_set_id: 'default'
    }
  ];
};

// Hook to fetch question sets for the organization
export const useVehicleCheckQuestionSets = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['vehicle-check-question-sets', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization ID available');
      }

      const { data, error } = await supabase
        .from('inspection_question_sets')
        .select(`
          *,
          questions:inspection_questions(*)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching question sets:', error);
        throw error;
      }

      return data as VehicleCheckQuestionSet[];
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch questions for vehicle checks (prioritizes admin-controlled questions)
export const useVehicleCheckQuestions = (questionSetId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['vehicle-check-questions', profile?.organization_id, questionSetId],
    queryFn: async () => {
      if (!profile?.organization_id) {
        console.log('No organization ID, using default questions');
        return getDefaultVehicleCheckQuestions();
      }

      try {
        // First, try to get questions from a specific set
        if (questionSetId) {
          const { data: questions, error } = await supabase
            .from('inspection_questions')
            .select('*')
            .eq('question_set_id', questionSetId)
            .order('order_index', { ascending: true });

          if (error) {
            console.error('Error fetching specific question set:', error);
            throw error;
          }

          if (questions && questions.length > 0) {
            console.log(`Using questions from set ${questionSetId}:`, questions.length, 'questions');
            return questions.map(q => ({
              id: q.id,
              question: q.question,
              category: q.category as VehicleCheckQuestion['category'],
              question_type: q.question_type as VehicleCheckQuestion['question_type'],
              is_required: q.is_required,
              is_critical: q.is_critical,
              has_photo: q.has_photo,
              has_notes: q.has_notes,
              order_index: q.order_index,
              guidance: q.guidance,
              question_set_id: q.question_set_id
            })) as VehicleCheckQuestion[];
          }
        }

        // If no specific set or set is empty, get default questions from org
        const { data: questionSets, error: setsError } = await supabase
          .from('inspection_question_sets')
          .select(`
            id,
            questions:inspection_questions(*)
          `)
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .eq('is_default', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (setsError) {
          console.error('Error fetching default question sets:', setsError);
          throw setsError;
        }

        if (questionSets && questionSets.length > 0 && questionSets[0].questions?.length > 0) {
          const questions = questionSets[0].questions;
          console.log('Using default organization questions:', questions.length, 'questions');
          return questions
            .sort((a, b) => a.order_index - b.order_index)
            .map(q => ({
              id: q.id,
              question: q.question,
              category: q.category as VehicleCheckQuestion['category'],
              question_type: q.question_type as VehicleCheckQuestion['question_type'],
              is_required: q.is_required,
              is_critical: q.is_critical,
              has_photo: q.has_photo,
              has_notes: q.has_notes,
              order_index: q.order_index,
              guidance: q.guidance,
              question_set_id: q.question_set_id
            })) as VehicleCheckQuestion[];
        }

        // Fallback to default questions
        console.log('No admin questions found, using default fallback questions');
        return getDefaultVehicleCheckQuestions();

      } catch (error) {
        console.error('Error fetching vehicle check questions:', error);
        console.log('Falling back to default questions');
        return getDefaultVehicleCheckQuestions();
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new question set
export const useCreateQuestionSet = () => {
  const { profile } = useAuth();

  return {
    create: async (data: Partial<VehicleCheckQuestionSet>) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Authentication required');
      }

      const { data: result, error } = await supabase
        .from('inspection_question_sets')
        .insert({
          name: data.name!,
          description: data.description,
          is_active: data.is_active ?? true,
          is_default: data.is_default ?? false,
          organization_id: profile.organization_id,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result;
    }
  };
};

// Hook to create questions in a set
export const useCreateQuestions = () => {
  return {
    create: async (questions: Partial<VehicleCheckQuestion>[]) => {
      const { data: result, error } = await supabase
        .from('inspection_questions')
        .insert(questions)
        .select();

      if (error) {
        throw error;
      }

      return result;
    }
  };
};