import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Function to call OpenAI API
async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "You are a professional bio writer. Your task is to improve the user's bio to make it more professional and engaging.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Function to call Anthropic API
async function callAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      },
    );

    return response.data.content[0].text.trim();
  } catch (error: any) {
    console.error('Anthropic API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Function to call Groq API
async function callGroq(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model || 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              "You are a professional bio writer. Your task is to improve the user's bio to make it more professional and engaging.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Function to call OpenRouter API
async function callOpenRouter(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model || 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "You are a professional bio writer. Your task is to improve the user's bio to make it more professional and engaging.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://wendertech.com',
          'X-Title': 'Wender Tech Portfolio',
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Helper function to get authenticated Supabase client
async function getAuthenticatedClient(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Tentar obter o cookie de sessão como fallback
      const cookies = request.headers.get('cookie');
      if (!cookies) {
        return { client: null, error: 'Missing or invalid authorization header', status: 401 };
      }

      // Criar cliente Supabase padrão
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      );

      // Tentar obter a sessão atual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        return { client: null, error: 'No valid session found', status: 401 };
      }

      // Usar o token da sessão
      const token = sessionData.session.access_token;

      // Criar cliente autenticado com o token da sessão
      const supabaseWithAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      );

      // Obter o usuário autenticado
      const {
        data: { user },
        error: userError,
      } = await supabaseWithAuth.auth.getUser();

      if (userError || !user) {
        return { client: null, error: userError?.message || 'No user found', status: 401 };
      }

      return { client: supabaseWithAuth, user, error: null };
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Create a new Supabase client with the token
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseWithAuth.auth.getUser();

    if (authError || !user) {
      return {
        client: null,
        error: authError?.message || 'No user found',
        status: 401,
      };
    }

    return { client: supabaseWithAuth, user, error: null };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { client: null, error: error.message || 'Authentication error', status: 500 };
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { bio, title, skills, provider } = body;

    if (!bio) {
      return NextResponse.json({ error: 'Bio is required' }, { status: 400 });
    }

    if (!provider) {
      return NextResponse.json({ error: 'AI provider is required' }, { status: 400 });
    }

    // Get the AI configuration from the database
    const config = await prisma.aIConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      return NextResponse.json({ error: 'AI configuration not found' }, { status: 400 });
    }

    // Check if the selected provider is configured and enabled
    let apiKey = '';
    let model = '';
    let isEnabled = false;

    switch (provider) {
      case 'openai':
        apiKey = config.openaiApiKey || '';
        model = config.openaiModel || 'gpt-3.5-turbo';
        isEnabled = config.openaiEnabled;
        break;
      case 'anthropic':
        apiKey = config.anthropicApiKey || '';
        model = config.anthropicModel || 'claude-3-haiku-20240307';
        isEnabled = config.anthropicEnabled;
        break;
      case 'groq':
        apiKey = config.groqApiKey || '';
        model = config.groqModel || 'llama3-8b-8192';
        isEnabled = config.groqEnabled;
        break;
      case 'openrouter':
        apiKey = config.openrouterApiKey || '';
        model = config.openrouterModel || 'openai/gpt-3.5-turbo';
        isEnabled = config.openrouterEnabled;
        break;
      default:
        return NextResponse.json({ error: 'Invalid AI provider' }, { status: 400 });
    }

    if (!apiKey || !isEnabled) {
      return NextResponse.json(
        { error: `${provider} is not configured or enabled` },
        { status: 400 },
      );
    }

    // Call the appropriate AI API based on the provider
    let improvedBio = '';

    try {
      // Prepare the prompt with context
      const skillsText = skills && skills.length > 0 ? skills.join(', ') : '';
      const prompt = `
I have the following professional bio that I'd like you to improve:

"${bio}"

${title ? `My professional title is: ${title}` : ''}
${skillsText ? `My skills include: ${skillsText}` : ''}

Please improve my bio to make it more professional and engaging. Focus on:
1. Maintaining my original information and tone
2. Making it more concise and impactful
3. Highlighting my expertise based on my skills
4. Only adding relevant information based on my skills (e.g., if I'm a React developer, you can mention JavaScript/TypeScript knowledge)
5. Avoiding unnecessary fluff or exaggeration

Return only the improved bio text without any additional comments or explanations.
`;

      switch (provider) {
        case 'openai':
          improvedBio = await callOpenAI(apiKey, model, prompt);
          break;
        case 'anthropic':
          improvedBio = await callAnthropic(apiKey, model, prompt);
          break;
        case 'groq':
          improvedBio = await callGroq(apiKey, model, prompt);
          break;
        case 'openrouter':
          improvedBio = await callOpenRouter(apiKey, model, prompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error: any) {
      console.error(`Error calling ${provider} API:`, error);
      throw new Error(`Failed to improve bio with ${provider}: ${error.message}`);
    }

    return NextResponse.json({
      improvedBio,
      success: true,
    });
  } catch (error: any) {
    console.error('Exception in POST /api/profile/improve-bio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
