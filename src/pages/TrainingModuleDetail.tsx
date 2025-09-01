import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StandardPageLayout, { MetricCard } from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Info } from 'lucide-react';

interface ModuleRow {
  id: string;
  name: string;
  description?: string;
  category?: string;
  duration?: number;
  is_required?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ModuleContentRow {
  id: string;
  module_id: string;
  pass_score: number;
  estimated_minutes: number;
  learning_objectives: string[];
  content_md?: string;
}

interface QuestionRow {
  id: string;
  module_id: string;
  question: string;
  options: Record<string,string>;
  correct_option: string;
  explanation?: string;
}

const TrainingModuleDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<ModuleRow | null>(null);
  const [content, setContent] = useState<ModuleContentRow | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id || !profile?.organization_id) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('training_modules')
          .select('*')
          .eq('id', id)
          .eq('organization_id', profile.organization_id)
          .maybeSingle();
        setModule(data as ModuleRow | null);

        if (data) {
          const { data: contentRow } = await supabase
            .from('training_module_content')
            .select('*')
            .eq('module_id', data.id)
            .eq('organization_id', profile.organization_id)
            .maybeSingle();
          setContent(contentRow as ModuleContentRow | null);

          const { data: questionRows } = await supabase
            .from('training_questions')
            .select('*')
            .eq('module_id', data.id)
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: true });
          setQuestions((questionRows || []) as QuestionRow[]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, profile?.organization_id]);

  const metrics: MetricCard[] = useMemo(() => [
    { title: 'Category', value: module?.category || '—', icon: <Info className="w-5 h-5 text-blue-600" />, bgColor: 'bg-blue-100', color: 'text-blue-600' },
    { title: 'Duration', value: module?.duration != null ? `${module.duration} min` : '—', icon: <Clock className="w-5 h-5 text-emerald-600" />, bgColor: 'bg-emerald-100', color: 'text-emerald-600' },
    { title: 'Required', value: module?.is_required ? 'Yes' : 'No', icon: <CheckCircle className="w-5 h-5 text-purple-600" />, bgColor: 'bg-purple-100', color: 'text-purple-600' },
  ], [module]);

  return (
    <StandardPageLayout
      title={module?.name || 'Training Course'}
      description="Course details"
      metricsCards={metrics}
      showMetricsDashboard={true}
      isLoading={loading}
      loadingText="Loading course..."
      customHeaderContent={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Course Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Category</div>
                <div className="font-medium">{module?.category || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Duration</div>
                <div className="font-medium">{module?.duration != null ? `${module.duration} min` : '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Required</div>
                <div className="font-medium">{module?.is_required ? <Badge className="bg-blue-100 text-blue-800">Required</Badge> : 'Optional'}</div>
              </div>
            </div>
            {module?.description && (
              <div className="mt-4 text-sm text-gray-700">{module.description}</div>
            )}
            {content?.content_md && (
              <div className="mt-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.content_md }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives & Pass Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Pass Score</div>
                <div className="font-medium">{content?.pass_score ?? 80}%</div>
              </div>
              <div>
                <div className="text-gray-600">Estimated Time</div>
                <div className="font-medium">{content?.estimated_minutes ?? module?.duration ?? 30} min</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-gray-600 mb-2 text-sm">Learning Objectives</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {(content?.learning_objectives || []).map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-sm text-gray-600">No questions available yet.</div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="border rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">{q.question}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(q.options || {}).map(([key, val]) => (
                        <div key={key} className={`p-2 rounded border ${q.correct_option === key ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                          <span className="font-semibold mr-2">{key}.</span>{val}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-2 text-xs text-gray-600">Explanation: {q.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default TrainingModuleDetail;


