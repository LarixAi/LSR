import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/integrations/supabase/client';

// AI Model Providers
export interface AIModelProvider {
  generate(prompt: string, context?: any): Promise<string>;
  stream(prompt: string, context?: any): AsyncGenerator<string>;
}

export class OpenAIProvider implements AIModelProvider {
  private client: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not found. OpenAI provider will not be available.');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Allow browser usage for demo
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      // Don't throw error, just log it and continue without AI functionality
    }
  }

  async generate(prompt: string, context?: any): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI provider is not initialized. Please check your API key configuration.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(context),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async *stream(prompt: string, context?: any): AsyncGenerator<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI provider is not initialized. Please check your API key configuration.');
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(context),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('OpenAI Stream Error:', error);
      throw new Error('Failed to stream AI response');
    }
  }

  private buildSystemPrompt(context?: any): string {
    return `You are an AI assistant for a Transport Management System (TMS) called Upclick. 
    
Your role is to help users manage their fleet operations, including:
- Vehicle management and maintenance
- Driver scheduling and assignments
- Route optimization
- Compliance and safety
- Financial analysis
- Customer service

Current context: ${JSON.stringify(context || {}, null, 2)}

Always provide helpful, accurate, and actionable responses. If you're unsure about something, ask for clarification.`;
  }
}

export class AnthropicProvider implements AIModelProvider {
  private client: Anthropic | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('Anthropic API key not found. Anthropic provider will not be available.');
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Allow browser usage for demo
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Anthropic client:', error);
      // Don't throw error, just log it and continue without AI functionality
    }
  }

  async generate(prompt: string, context?: any): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Anthropic provider is not initialized. Please check your API key configuration.');
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `${this.buildSystemPrompt(context)}\n\nUser: ${prompt}`,
          },
        ],
      });

      return response.content[0]?.type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async *stream(prompt: string, context?: any): AsyncGenerator<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Anthropic provider is not initialized. Please check your API key configuration.');
    }

    try {
      const stream = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `${this.buildSystemPrompt(context)}\n\nUser: ${prompt}`,
          },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('Anthropic Stream Error:', error);
      throw new Error('Failed to stream AI response');
    }
  }

  private buildSystemPrompt(context?: any): string {
    return `You are an AI assistant for a Transport Management System (TMS) called Upclick. 
    
Your role is to help users manage their fleet operations, including:
- Vehicle management and maintenance
- Driver scheduling and assignments
- Route optimization
- Compliance and safety
- Financial analysis
- Customer service

Current context: ${JSON.stringify(context || {}, null, 2)}

Always provide helpful, accurate, and actionable responses. If you're unsure about something, ask for clarification.`;
  }
}

// Context Management
export interface TMSContext {
  user: {
    id: string;
    name: string;
    role: string;
    organization: string;
  };
  fleet: {
    totalVehicles: number;
    activeVehicles: number;
    maintenanceDue: number;
  };
  vehicles: Array<{
    id: string;
    name: string;
    status: string;
    lastInspection: string;
  }>;
  drivers: Array<{
    id: string;
    name: string;
    status: string;
    licenseExpiry: string;
  }>;
  routes: Array<{
    id: string;
    name: string;
    status: string;
    estimatedTime: string;
  }>;
  inspections: Array<{
    id: string;
    vehicleId: string;
    status: string;
    date: string;
  }>;
  maintenance: Array<{
    id: string;
    vehicleId: string;
    type: string;
    dueDate: string;
  }>;
  compliance: {
    dvsaCompliant: boolean;
    licensesValid: boolean;
    inspectionsUpToDate: boolean;
  };
}

export class ContextManager {
  private context: TMSContext | null = null;

  async buildContext(userId: string): Promise<TMSContext> {
    try {
      // Fetch user data
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Fetch fleet data
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('organization_id', userData?.organization_id);

      const { data: drivers } = await supabase
        .from('drivers')
        .select('*')
        .eq('organization_id', userData?.organization_id);

      const { data: inspections } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('organization_id', userData?.organization_id);

      const { data: maintenance } = await supabase
        .from('maintenance_schedule')
        .select('*')
        .eq('organization_id', userData?.organization_id);

      this.context = {
        user: {
          id: userData?.id || '',
          name: userData?.full_name || '',
          role: userData?.role || '',
          organization: userData?.organization_id || '',
        },
        fleet: {
          totalVehicles: vehicles?.length || 0,
          activeVehicles: vehicles?.filter(v => v.status === 'active').length || 0,
          maintenanceDue: maintenance?.filter(m => new Date(m.due_date) <= new Date()).length || 0,
        },
        vehicles: vehicles?.map(v => ({
          id: v.id,
          name: v.vehicle_name,
          status: v.status,
          lastInspection: v.last_inspection_date,
        })) || [],
        drivers: drivers?.map(d => ({
          id: d.id,
          name: d.full_name,
          status: d.status,
          licenseExpiry: d.license_expiry_date,
        })) || [],
        routes: [], // TODO: Implement routes
        inspections: inspections?.map(i => ({
          id: i.id,
          vehicleId: i.vehicle_id,
          status: i.status,
          date: i.inspection_date,
        })) || [],
        maintenance: maintenance?.map(m => ({
          id: m.id,
          vehicleId: m.vehicle_id,
          type: m.maintenance_type,
          dueDate: m.due_date,
        })) || [],
        compliance: {
          dvsaCompliant: this.checkDVSACompliance(vehicles, inspections),
          licensesValid: this.checkLicenseValidity(drivers),
          inspectionsUpToDate: this.checkInspectionStatus(inspections),
        },
      };

      return this.context;
    } catch (error) {
      console.error('Error building context:', error);
      throw new Error('Failed to build context');
    }
  }

  getContext(): TMSContext | null {
    return this.context;
  }

  private checkDVSACompliance(vehicles: any[], inspections: any[]): boolean {
    // TODO: Implement DVSA compliance logic
    return true;
  }

  private checkLicenseValidity(drivers: any[]): boolean {
    const now = new Date();
    return drivers.every(driver => {
      const expiryDate = new Date(driver.license_expiry_date);
      return expiryDate > now;
    });
  }

  private checkInspectionStatus(inspections: any[]): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return inspections.every(inspection => {
      const inspectionDate = new Date(inspection.inspection_date);
      return inspectionDate > thirtyDaysAgo;
    });
  }
}

// Response Cache
export class ResponseCache {
  private cache = new Map<string, { response: string; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, response: string): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Model Router
export class ModelRouter {
  private providers: Map<string, AIModelProvider> = new Map();

  constructor() {
    this.providers.set('gpt4', new OpenAIProvider());
    this.providers.set('claude', new AnthropicProvider());
  }

  async route(prompt: string, model: string = 'gpt4', context?: any): Promise<string> {
    const provider = this.providers.get(model);
    if (!provider) {
      throw new Error(`Unknown model: ${model}`);
    }

    return provider.generate(prompt, context);
  }

  async *routeStream(prompt: string, model: string = 'gpt4', context?: any): AsyncGenerator<string> {
    const provider = this.providers.get(model);
    if (!provider) {
      throw new Error(`Unknown model: ${model}`);
    }

    yield* provider.stream(prompt, context);
  }

  getAvailableModels(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Main AI Service
export class AIService {
  private contextManager: ContextManager;
  private cache: ResponseCache;
  private router: ModelRouter;

  constructor() {
    this.contextManager = new ContextManager();
    this.cache = new ResponseCache();
    this.router = new ModelRouter();
  }

  async chat(message: string, userId: string, model: string = 'gpt4'): Promise<string> {
    try {
      // Build context
      const context = await this.contextManager.buildContext(userId);
      
      // Check cache
      const cacheKey = `${userId}:${message}:${model}`;
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Generate response
      const response = await this.router.route(message, model, context);
      
      // Cache response
      this.cache.set(cacheKey, response);
      
      // Save conversation to database
      await this.saveConversation(userId, message, response, model);
      
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async *chatStream(message: string, userId: string, model: string = 'gpt4'): AsyncGenerator<string> {
    try {
      // Build context
      const context = await this.contextManager.buildContext(userId);
      
      // Generate streaming response
      yield* this.router.routeStream(message, model, context);
      
      // Save conversation to database (after completion)
      // Note: We'll need to collect the full response for saving
    } catch (error) {
      console.error('AI Service Stream Error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  private async saveConversation(userId: string, message: string, response: string, model: string): Promise<void> {
    try {
      await supabase.from('ai_conversations').insert({
        user_id: userId,
        message,
        response,
        model,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  getContext(): TMSContext | null {
    return this.contextManager.getContext();
  }

  clearCache(): void {
    this.cache.clear();
  }

  getAvailableModels(): string[] {
    return this.router.getAvailableModels();
  }
}

// Export singleton instance
export const aiService = new AIService();
