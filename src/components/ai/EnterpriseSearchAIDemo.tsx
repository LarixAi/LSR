import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Lightbulb,
  Loader2,
  AlertCircle,
  Tag,
  Calendar,
  User,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEnterpriseSearchAI } from '@/hooks/useEnterpriseSearchAI';
import { SearchQuery, SearchResult, KnowledgeBaseEntry, SearchAnalytics } from '@/services/ai/agents/EnterpriseSearchAgent';

export const EnterpriseSearchAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [knowledgeBaseEntries, setKnowledgeBaseEntries] = useState<KnowledgeBaseEntry[] | null>(null);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'procedure' as KnowledgeBaseEntry['category'],
    tags: '',
    author: ''
  });

  const {
    isLoading,
    error,
    search,
    createKnowledgeBaseEntry,
    getSearchAnalytics,
    suggestRelatedContent,
    generateSearchInsights,
    clearError
  } = useEnterpriseSearchAI();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const searchQueryObj: SearchQuery = {
      query: searchQuery,
      filters: {
        entityType: 'vehicle',
        priority: 'medium'
      },
      limit: 10,
      includeRelated: true
    };

    const results = await search(searchQueryObj);
    setSearchResults(results);
  };

  const handleCreateKnowledgeEntry = async () => {
    if (!newEntry.title || !newEntry.content) return;

    const entry = {
      title: newEntry.title,
      content: newEntry.content,
      category: newEntry.category,
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      author: newEntry.author || 'Current User'
    };

    const result = await createKnowledgeBaseEntry(entry);
    if (result) {
      setKnowledgeBaseEntries(prev => prev ? [...prev, result] : [result]);
      setNewEntry({
        title: '',
        content: '',
        category: 'procedure',
        tags: '',
        author: ''
      });
    }
  };

  const handleGetAnalytics = async () => {
    const analytics = await getSearchAnalytics({
      start: '2025-01-01',
      end: '2025-01-31'
    });
    setSearchAnalytics(analytics);
  };

  const handleSuggestRelated = async (content: string) => {
    const suggestions = await suggestRelatedContent(content, 'vehicle');
    setSearchResults(suggestions);
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'vehicle': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-green-100 text-green-800';
      case 'job': return 'bg-purple-100 text-purple-800';
      case 'inspection': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      case 'knowledge': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'procedure': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-green-100 text-green-800';
      case 'guideline': return 'bg-purple-100 text-purple-800';
      case 'faq': return 'bg-orange-100 text-orange-800';
      case 'troubleshooting': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enterprise Search & Knowledge Base</h2>
          <p className="text-gray-600">AI-powered search and knowledge management system</p>
        </div>
        {error && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" />
                Enterprise Search
              </CardTitle>
              <p className="text-gray-600">
                AI-powered semantic search across all TMS data and knowledge base.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search vehicles, drivers, jobs, documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !searchQuery.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {searchResults && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Found {searchResults.length} results
                  </div>
                  {searchResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{result.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{result.content.substring(0, 200)}...</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={getEntityTypeColor(result.entityType)}>
                              {result.entityType}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(result.relevance * 100)}% relevant
                            </Badge>
                          </div>
                        </div>

                        {result.highlights.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-medium">Highlights:</span>
                            <div className="mt-1 space-y-1">
                              {result.highlights.map((highlight, hIndex) => (
                                <div key={hIndex} className="text-sm bg-yellow-50 p-2 rounded">
                                  <span className="font-medium">{highlight.field}:</span> {highlight.snippet}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>Category: {result.metadata.category}</span>
                            <span>Created: {new Date(result.metadata.createdAt).toLocaleDateString()}</span>
                            {result.metadata.author && (
                              <span>Author: {result.metadata.author}</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestRelated(result.content)}
                          >
                            Find Related
                          </Button>
                        </div>

                        {result.relatedEntities.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="text-sm font-medium">Related:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.relatedEntities.map((entity, eIndex) => (
                                <Badge key={eIndex} variant="outline" className="text-xs">
                                  {entity.title} ({entity.type})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Create Knowledge Entry
                </CardTitle>
                <p className="text-gray-600">
                  Create AI-enhanced knowledge base entries with automatic insights.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter entry title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newEntry.content}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter entry content"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newEntry.category}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, category: e.target.value as KnowledgeBaseEntry['category'] }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="procedure">Procedure</option>
                      <option value="policy">Policy</option>
                      <option value="guideline">Guideline</option>
                      <option value="faq">FAQ</option>
                      <option value="troubleshooting">Troubleshooting</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newEntry.tags}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>

                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={newEntry.author}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Enter author name"
                    />
                  </div>

                  <Button 
                    onClick={handleCreateKnowledgeEntry} 
                    disabled={isLoading || !newEntry.title || !newEntry.content}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Entry...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Create Knowledge Entry
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  Knowledge Base Entries
                </CardTitle>
                <p className="text-gray-600">
                  AI-enhanced knowledge base with automatic insights and categorization.
                </p>
              </CardHeader>
              <CardContent>
                {knowledgeBaseEntries && knowledgeBaseEntries.length > 0 ? (
                  <div className="space-y-4">
                    {knowledgeBaseEntries.map((entry, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{entry.title}</h4>
                            <Badge className={getCategoryColor(entry.category)}>
                              {entry.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {entry.content.substring(0, 150)}...
                          </p>

                          {entry.aiInsights && (
                            <div className="mb-3">
                              <span className="text-sm font-medium">AI Summary:</span>
                              <p className="text-sm text-gray-700 mt-1">{entry.aiInsights.summary}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{entry.author}</span>
                              <Calendar className="w-4 h-4 ml-2" />
                              <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <span>{entry.accessCount} views</span>
                            </div>
                          </div>

                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No knowledge base entries yet</p>
                    <p className="text-sm">Create your first entry using the form</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Search Analytics
              </CardTitle>
              <p className="text-gray-600">
                AI-powered analytics and insights for search performance and user behavior.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGetAnalytics} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analytics...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Analytics
                  </>
                )}
              </Button>

              {searchAnalytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {searchAnalytics.totalQueries}
                        </div>
                        <div className="text-sm text-gray-600">Total Queries</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {searchAnalytics.searchPerformance.avgRelevanceScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Relevance</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {searchAnalytics.searchPerformance.avgResponseTime.toFixed(1)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Popular Queries</h4>
                        <div className="space-y-2">
                          {searchAnalytics.popularQueries.map((query, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">{query.query}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{query.count}</Badge>
                                <span className="text-xs text-gray-500">
                                  {Math.round(query.avgRelevance * 100)}% relevant
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Most Searched Categories</h4>
                        <div className="space-y-2">
                          {searchAnalytics.userBehavior.mostSearchedCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">{category.category}</span>
                              <Badge variant="outline">{category.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">AI Insights</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Search Trends</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {searchAnalytics.aiInsights.searchTrends.map((trend, index) => (
                              <li key={index}>{trend}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Optimization Suggestions</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {searchAnalytics.aiInsights.optimizationSuggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Knowledge Gaps</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {searchAnalytics.aiInsights.knowledgeGaps.map((gap, index) => (
                              <li key={index}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Search Insights
              </CardTitle>
              <p className="text-gray-600">
                AI-generated insights and recommendations for improving search and knowledge management.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Search insights will be generated based on your search patterns</p>
                <p className="text-sm">Start using the search feature to see insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


