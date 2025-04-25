// Tipos para provedores de mensageria
export type MessagingProvider = 'evolution' | 'resend';

export interface EvolutionInstance {
  id: string;
  name: string;
  picture: string;
  status: 'connected' | 'disconnected' | 'connecting';
  number: string;
}

export const EVOLUTION_INSTANCES: EvolutionInstance[] = [
  {
    id: 'default',
    name: 'Instância Padrão',
    picture: '',
    status: 'disconnected',
    number: '',
  },
];

export interface MessagingProviderConfig {
  provider: MessagingProvider;
  name: string;
  apiKey: string;
  isEnabled: boolean;
  baseUrl?: string;
  logoUrl: string;
  description: string;
}

// Configuração do usuário para mensageria
export interface UserMessagingConfig {
  id: string;
  userId: string;
  providers: {
    evolution?: {
      apiKey: string;
      baseUrl: string;
      isEnabled: boolean;
      defaultInstance?: string;
    };
    resend?: {
      apiKey: string;
      isEnabled: boolean;
      defaultFromEmail?: string;
      defaultFromName?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Configurações dos provedores
export const MESSAGING_PROVIDERS: MessagingProviderConfig[] = [
  {
    provider: 'evolution',
    name: 'Evolution API',
    apiKey: '',
    isEnabled: false,
    baseUrl: 'https://api.example.com',
    logoUrl: '/images/messaging/evolution-logo.svg',
    description:
      'Integração com a Evolution API v2 para automação de WhatsApp e comunicação com clientes.',
  },
  {
    provider: 'resend',
    name: 'Resend',
    apiKey: '',
    isEnabled: false,
    logoUrl: '/images/messaging/resend-logo.svg',
    description:
      'Plataforma moderna de envio de emails para desenvolvedores, com alta entregabilidade e análises detalhadas.',
  },
];
