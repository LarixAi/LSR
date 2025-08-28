import { aiService } from '../AIService';
import { TMSContext } from '../AIService';

export interface SearchQuery {
  query: string;
  filters?: {
    category?: string[];
    dateRange?: { start: string; end: string };
    entityType?: 'vehicle' | 'driver' | 'job' | 'inspection' | 'maintenance' | 'document';
    priority?: 'low' | 'medium' | 'high';
  };
  limit?: number;
  includeRelated?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  entityType: 'vehicle' | 'driver' | 'job' | 'inspection' | 'maintenance' | 'document' | 'knowledge';
  relevance: number; // 0-1
  metadata: {
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    author?: string;
    status?: string;
  };
  highlights: Array<{
    field: string;
    snippet: string;
    score: number;
  }>;
  relatedEntities: Array<{
    id: string;
    type: string;
    title: string;
    relevance: number;
  }>;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: 'procedure' | 'policy' | 'guideline' | 'faq' | 'troubleshooting' | 'compliance';
  tags: string[];
  author: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastAccessed?: string;
  accessCount: number;
  relatedEntries: string[];
  aiGenerated: boolean;
  aiInsights: {
    summary: string;
    keyPoints: string[];
    relatedTopics: string[];
    suggestedUpdates: string[];
  };
}

export interface DocumentIndex {
  documentId: string;
  title: string;
  content: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  embeddings: number[];
  lastIndexed: string;
  version: number;
}

export interface SearchAnalytics {
  totalQueries: number;
  popularQueries: Array<{
    query: string;
    count: number;
    avgRelevance: number;
  }>;
  searchPerformance: {
    avgResponseTime: number;
    avgRelevanceScore: number;
    zeroResultQueries: number;
  };
  userBehavior: {
    mostSearchedCategories: Array<{
      category: string;
      count: number;
    }>;
    searchPatterns: Array<{
      pattern: string;
      frequency: number;
    }>;
  };
  aiInsights: {
    searchTrends: string[];
    optimizationSuggestions: string[];
    knowledgeGaps: string[];
  };
}

export class EnterpriseSearchAgent {
  private context: TMSContext | null = null;
  private documentIndex: Map<string, DocumentIndex> = new Map();

  async setContext(context: TMSContext): Promise<void> {
    this.context = context;
  }

  async search(
    searchQuery: SearchQuery
  ): Promise<SearchResult[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildSearchPrompt(searchQuery);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseSearchResults(response, searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search');
    }
  }

  async indexDocument(
    document: {
      id: string;
      title: string;
      content: string;
      entityType: string;
      entityId: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildIndexingPrompt(document);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      const embeddings = this.parseEmbeddings(response);
      
      const documentIndex: DocumentIndex = {
        documentId: document.id,
        title: document.title,
        content: document.content,
        entityType: document.entityType,
        entityId: document.entityId,
        metadata: document.metadata || {},
        embeddings,
        lastIndexed: new Date().toISOString(),
        version: 1
      };

      this.documentIndex.set(document.id, documentIndex);
    } catch (error) {
      console.error('Document indexing error:', error);
      throw new Error('Failed to index document');
    }
  }

  async createKnowledgeBaseEntry(
    entry: {
      title: string;
      content: string;
      category: KnowledgeBaseEntry['category'];
      tags: string[];
      author: string;
    }
  ): Promise<KnowledgeBaseEntry> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildKnowledgeBasePrompt(entry);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseKnowledgeBaseEntry(response, entry);
    } catch (error) {
      console.error('Knowledge base creation error:', error);
      throw new Error('Failed to create knowledge base entry');
    }
  }

  async updateKnowledgeBaseEntry(
    entryId: string,
    updates: Partial<KnowledgeBaseEntry>
  ): Promise<KnowledgeBaseEntry> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildKnowledgeBaseUpdatePrompt(entryId, updates);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseKnowledgeBaseEntry(response, updates);
    } catch (error) {
      console.error('Knowledge base update error:', error);
      throw new Error('Failed to update knowledge base entry');
    }
  }

  async getSearchAnalytics(
    timeRange: { start: string; end: string }
  ): Promise<SearchAnalytics> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildSearchAnalyticsPrompt(timeRange);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseSearchAnalytics(response);
    } catch (error) {
      console.error('Search analytics error:', error);
      throw new Error('Failed to get search analytics');
    }
  }

  async suggestRelatedContent(
    content: string,
    entityType: string
  ): Promise<SearchResult[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildRelatedContentPrompt(content, entityType);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseSearchResults(response, { query: content });
    } catch (error) {
      console.error('Related content suggestion error:', error);
      throw new Error('Failed to suggest related content');
    }
  }

  async generateSearchInsights(
    searchHistory: Array<{ query: string; results: number; timestamp: string }>
  ): Promise<any> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildSearchInsightsPrompt(searchHistory);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseSearchInsights(response);
    } catch (error) {
      console.error('Search insights generation error:', error);
      throw new Error('Failed to generate search insights');
    }
  }

  private buildSearchPrompt(searchQuery: SearchQuery): string {
    return `As an Enterprise Search AI Agent, perform a comprehensive search across the TMS knowledge base:

SEARCH QUERY: "${searchQuery.query}"

FLEET CONTEXT:
- Total Vehicles: ${this.context?.vehicles.length || 0}
- Total Drivers: ${this.context?.drivers.length || 0}
- Total Jobs: ${this.context?.inspections.length || 0}
- Knowledge Base Entries: ${this.documentIndex.size}

SEARCH FILTERS:
${searchQuery.filters ? JSON.stringify(searchQuery.filters, null, 2) : 'None specified'}

Please search across:
1. Vehicle information and status
2. Driver records and compliance
3. Job and inspection data
4. Maintenance records
5. Knowledge base articles
6. Policy and procedure documents
7. Compliance guidelines

Consider semantic meaning, context, and relevance. Return results with:
- Relevance scores (0-1)
- Highlighted matching content
- Related entities
- Metadata and categorization

Return the response in JSON format with the following structure:
{
  "searchResults": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "entityType": "vehicle|driver|job|inspection|maintenance|document|knowledge",
      "relevance": number,
      "metadata": {
        "category": "string",
        "tags": ["string"],
        "createdAt": "string",
        "updatedAt": "string",
        "author": "string",
        "status": "string"
      },
      "highlights": [
        {
          "field": "string",
          "snippet": "string",
          "score": number
        }
      ],
      "relatedEntities": [
        {
          "id": "string",
          "type": "string",
          "title": "string",
          "relevance": number
        }
      ]
    }
  ]
}`;
  }

  private buildIndexingPrompt(document: any): string {
    return `As an Enterprise Search AI Agent, create embeddings for document indexing:

DOCUMENT TO INDEX:
- ID: ${document.id}
- Title: ${document.title}
- Content: ${document.content.substring(0, 500)}...
- Entity Type: ${document.entityType}
- Entity ID: ${document.entityId}

Please analyze this document and create semantic embeddings that capture:
1. Key concepts and topics
2. Entity relationships
3. Contextual meaning
4. Searchable keywords
5. Categorization tags

Return the embeddings as a JSON array of numbers representing the semantic vector.`;
  }

  private buildKnowledgeBasePrompt(entry: any): string {
    return `As an Enterprise Search AI Agent, create a comprehensive knowledge base entry:

ENTRY DETAILS:
- Title: ${entry.title}
- Content: ${entry.content}
- Category: ${entry.category}
- Tags: ${entry.tags.join(', ')}
- Author: ${entry.author}

Please enhance this entry with:
1. AI-generated summary
2. Key points extraction
3. Related topics identification
4. Suggested updates and improvements
5. Semantic analysis for better searchability

Return the enhanced entry in JSON format with the following structure:
{
  "id": "generated-uuid",
  "title": "string",
  "content": "string",
  "category": "procedure|policy|guideline|faq|troubleshooting|compliance",
  "tags": ["string"],
  "author": "string",
  "version": "1.0",
  "status": "published",
  "createdAt": "string",
  "updatedAt": "string",
  "accessCount": 0,
  "relatedEntries": ["string"],
  "aiGenerated": true,
  "aiInsights": {
    "summary": "string",
    "keyPoints": ["string"],
    "relatedTopics": ["string"],
    "suggestedUpdates": ["string"]
  }
}`;
  }

  private buildKnowledgeBaseUpdatePrompt(entryId: string, updates: any): string {
    return `As an Enterprise Search AI Agent, update a knowledge base entry:

ENTRY ID: ${entryId}
UPDATES: ${JSON.stringify(updates, null, 2)}

Please analyze the updates and:
1. Maintain consistency with existing content
2. Update AI insights if content changed
3. Adjust related entries if needed
4. Update version and timestamps
5. Preserve important metadata

Return the updated entry in JSON format.`;
  }

  private buildSearchAnalyticsPrompt(timeRange: { start: string; end: string }): string {
    return `As an Enterprise Search AI Agent, generate search analytics:

TIME RANGE: ${timeRange.start} to ${timeRange.end}

Please analyze search patterns and provide:
1. Popular queries and trends
2. Search performance metrics
3. User behavior insights
4. AI-powered optimization suggestions
5. Knowledge gap identification

Return the analytics in JSON format with the following structure:
{
  "totalQueries": number,
  "popularQueries": [
    {
      "query": "string",
      "count": number,
      "avgRelevance": number
    }
  ],
  "searchPerformance": {
    "avgResponseTime": number,
    "avgRelevanceScore": number,
    "zeroResultQueries": number
  },
  "userBehavior": {
    "mostSearchedCategories": [
      {
        "category": "string",
        "count": number
      }
    ],
    "searchPatterns": [
      {
        "pattern": "string",
        "frequency": number
      }
    ]
  },
  "aiInsights": {
    "searchTrends": ["string"],
    "optimizationSuggestions": ["string"],
    "knowledgeGaps": ["string"]
  }
}`;
  }

  private buildRelatedContentPrompt(content: string, entityType: string): string {
    return `As an Enterprise Search AI Agent, suggest related content:

CONTENT: ${content.substring(0, 300)}...
ENTITY TYPE: ${entityType}

Please find related content based on:
1. Semantic similarity
2. Entity relationships
3. Contextual relevance
4. User behavior patterns
5. Knowledge base connections

Return related content suggestions in the same format as search results.`;
  }

  private buildSearchInsightsPrompt(searchHistory: any[]): string {
    return `As an Enterprise Search AI Agent, generate search insights:

SEARCH HISTORY: ${JSON.stringify(searchHistory, null, 2)}

Please analyze this search history and provide:
1. Pattern recognition
2. User intent analysis
3. Content gap identification
4. Optimization recommendations
5. Predictive insights

Return the insights in JSON format.`;
  }

  private parseSearchResults(response: string, searchQuery: SearchQuery): SearchResult[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.searchResults || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing search results:', error);
      return [];
    }
  }

  private parseEmbeddings(response: string): number[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback: generate simple embeddings
      return Array.from({ length: 128 }, () => Math.random());
    } catch (error) {
      console.error('Error parsing embeddings:', error);
      return Array.from({ length: 128 }, () => Math.random());
    }
  }

  private parseKnowledgeBaseEntry(response: string, entry: any): KnowledgeBaseEntry {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        id: entry.id || `kb-${Date.now()}`,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        tags: entry.tags,
        author: entry.author,
        version: '1.0',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessCount: 0,
        relatedEntries: [],
        aiGenerated: true,
        aiInsights: {
          summary: response.substring(0, 200),
          keyPoints: [],
          relatedTopics: [],
          suggestedUpdates: []
        }
      };
    } catch (error) {
      console.error('Error parsing knowledge base entry:', error);
      return {
        id: entry.id || `kb-${Date.now()}`,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        tags: entry.tags,
        author: entry.author,
        version: '1.0',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessCount: 0,
        relatedEntries: [],
        aiGenerated: true,
        aiInsights: {
          summary: 'Failed to parse AI insights',
          keyPoints: [],
          relatedTopics: [],
          suggestedUpdates: []
        }
      };
    }
  }

  private parseSearchAnalytics(response: string): SearchAnalytics {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        totalQueries: 0,
        popularQueries: [],
        searchPerformance: {
          avgResponseTime: 0,
          avgRelevanceScore: 0,
          zeroResultQueries: 0
        },
        userBehavior: {
          mostSearchedCategories: [],
          searchPatterns: []
        },
        aiInsights: {
          searchTrends: [response.substring(0, 100)],
          optimizationSuggestions: [],
          knowledgeGaps: []
        }
      };
    } catch (error) {
      console.error('Error parsing search analytics:', error);
      return {
        totalQueries: 0,
        popularQueries: [],
        searchPerformance: {
          avgResponseTime: 0,
          avgRelevanceScore: 0,
          zeroResultQueries: 0
        },
        userBehavior: {
          mostSearchedCategories: [],
          searchPatterns: []
        },
        aiInsights: {
          searchTrends: ['Failed to parse analytics'],
          optimizationSuggestions: [],
          knowledgeGaps: []
        }
      };
    }
  }

  private parseSearchInsights(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { insights: response };
    } catch (error) {
      console.error('Error parsing search insights:', error);
      return { insights: 'Failed to parse search insights' };
    }
  }
}

// Export singleton instance
export const enterpriseSearchAgent = new EnterpriseSearchAgent();



