// Tipos para provedores de IA
export type AIProvider = 'openai' | 'anthropic' | 'groq' | 'openrouter';

export type AIModelTier = 'free' | 'basic' | 'standard' | 'premium' | 'enterprise';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  maxTokens: number;
  isRecommended?: boolean;
  isFree?: boolean;
  tier: AIModelTier;
  contextWindow?: number;
  costPer1kTokensInput?: number;
  costPer1kTokensOutput?: number;
}

export interface AIProviderConfig {
  provider: AIProvider;
  name: string;
  apiKey: string;
  isEnabled: boolean;
  models: AIModel[];
  baseUrl?: string;
  logoUrl: string;
  description: string;
}

// Configuração do usuário para IA
export interface UserAIConfig {
  id: string;
  userId: string;
  defaultProvider: AIProvider;
  defaultModel: string;
  providers: {
    openai?: {
      apiKey: string;
      isEnabled: boolean;
      defaultModel?: string;
    };
    anthropic?: {
      apiKey: string;
      isEnabled: boolean;
      defaultModel?: string;
    };
    groq?: {
      apiKey: string;
      isEnabled: boolean;
      defaultModel?: string;
    };
    openrouter?: {
      apiKey: string;
      isEnabled: boolean;
      defaultModel?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para mensagens de chat
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Tipos para respostas da API
export interface AICompletionRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  id: string;
  model: string;
  choices: {
    message: AIMessage;
    finishReason: string;
  }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Modelos disponíveis por provedor
export const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Bom equilíbrio entre capacidade e custo',
    maxTokens: 4096,
    isRecommended: true,
    tier: 'standard',
    contextWindow: 16385,
    costPer1kTokensInput: 0.0015,
    costPer1kTokensOutput: 0.002,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Modelo mais avançado da OpenAI',
    maxTokens: 8192,
    isRecommended: true,
    tier: 'premium',
    contextWindow: 128000,
    costPer1kTokensInput: 0.005,
    costPer1kTokensOutput: 0.015,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Versão mais rápida do GPT-4',
    maxTokens: 4096,
    tier: 'premium',
    contextWindow: 128000,
    costPer1kTokensInput: 0.01,
    costPer1kTokensOutput: 0.03,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Modelo original GPT-4',
    maxTokens: 8192,
    tier: 'premium',
    contextWindow: 8192,
    costPer1kTokensInput: 0.03,
    costPer1kTokensOutput: 0.06,
  },
];

export const ANTHROPIC_MODELS: AIModel[] = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Modelo mais poderoso da Anthropic',
    maxTokens: 4096,
    tier: 'premium',
    contextWindow: 200000,
    costPer1kTokensInput: 0.015,
    costPer1kTokensOutput: 0.075,
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Bom equilíbrio entre capacidade e custo',
    maxTokens: 4096,
    isRecommended: true,
    tier: 'standard',
    contextWindow: 200000,
    costPer1kTokensInput: 0.003,
    costPer1kTokensOutput: 0.015,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Modelo mais rápido e econômico',
    maxTokens: 4096,
    tier: 'basic',
    contextWindow: 200000,
    costPer1kTokensInput: 0.00025,
    costPer1kTokensOutput: 0.00125,
  },
  {
    id: 'claude-2.1',
    name: 'Claude 2.1',
    provider: 'anthropic',
    description: 'Versão anterior do Claude',
    maxTokens: 4096,
    tier: 'standard',
    contextWindow: 100000,
    costPer1kTokensInput: 0.008,
    costPer1kTokensOutput: 0.024,
  },
];

export const GROQ_MODELS: AIModel[] = [
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B',
    provider: 'groq',
    description: 'Modelo Llama 3 de 70 bilhões de parâmetros',
    maxTokens: 4096,
    isRecommended: true,
    tier: 'premium',
    contextWindow: 8192,
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B',
    provider: 'groq',
    description: 'Modelo Llama 3 de 8 bilhões de parâmetros',
    maxTokens: 4096,
    tier: 'standard',
    contextWindow: 8192,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Modelo Mixtral de 8x7 bilhões de parâmetros',
    maxTokens: 4096,
    tier: 'standard',
    contextWindow: 32768,
  },
  {
    id: 'gemma-7b-it',
    name: 'Gemma 7B',
    provider: 'groq',
    description: 'Modelo Gemma de 7 bilhões de parâmetros',
    maxTokens: 4096,
    tier: 'basic',
    contextWindow: 8192,
    isFree: true,
  },
];

export const OPENROUTER_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (via OpenRouter)',
    provider: 'openrouter',
    description: 'GPT-4o através do OpenRouter',
    maxTokens: 4096,
    isRecommended: true,
    tier: 'premium',
    contextWindow: 128000,
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus (via OpenRouter)',
    provider: 'openrouter',
    description: 'Claude 3 Opus através do OpenRouter',
    maxTokens: 4096,
    tier: 'premium',
    contextWindow: 200000,
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B (via OpenRouter)',
    provider: 'openrouter',
    description: 'Llama 3 70B através do OpenRouter',
    maxTokens: 4096,
    tier: 'premium',
    contextWindow: 8192,
  },
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B (via OpenRouter)',
    provider: 'openrouter',
    description: 'Mistral 7B através do OpenRouter',
    maxTokens: 4096,
    tier: 'basic',
    contextWindow: 8192,
    isFree: true,
  },
];

// Configurações dos provedores
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    provider: 'openai',
    name: 'OpenAI',
    apiKey: '',
    isEnabled: false,
    models: OPENAI_MODELS,
    logoUrl: '/images/ai/openai-logo.svg',
    description: 'Acesso aos modelos GPT da OpenAI, incluindo GPT-4o e GPT-3.5 Turbo.',
  },
  {
    provider: 'anthropic',
    name: 'Anthropic',
    apiKey: '',
    isEnabled: false,
    models: ANTHROPIC_MODELS,
    logoUrl: '/images/ai/anthropic-logo.svg',
    description: 'Acesso aos modelos Claude da Anthropic, incluindo Claude 3 Opus, Sonnet e Haiku.',
  },
  {
    provider: 'groq',
    name: 'Groq',
    apiKey: '',
    isEnabled: false,
    models: GROQ_MODELS,
    logoUrl: '/images/ai/groq-logo.svg',
    description: 'Acesso aos modelos Llama e Mixtral através da Groq, com inferência extremamente rápida.',
  },
  {
    provider: 'openrouter',
    name: 'OpenRouter',
    apiKey: '',
    isEnabled: false,
    models: OPENROUTER_MODELS,
    logoUrl: '/images/ai/openrouter-logo.svg',
    description: 'Acesso a diversos modelos de IA através de uma única API, incluindo modelos gratuitos.',
  },
];
