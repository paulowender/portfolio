'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import Button from '@/components/Button';
import AuthShell from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const router = useRouter();
  const { updatePassword } = useAuth();

  // Extrair tokens da URL
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);

  // Extrair tokens da URL quando o componente é montado
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');
    const refresh = hashParams.get('refresh_token');
    const tokenType = hashParams.get('token_type');

    // Extrair parâmetros da URL

    if (token) {
      setAccessToken(token);
    }

    if (refresh) {
      setRefreshToken(refresh);
    }

    if (tokenType) {
      setTokenType(tokenType);
    }
  }, []);

  // Check if the user is authenticated via the password reset token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          setIsAuthenticated(true);
          setCheckingAuth(false);
          return;
        }

        // Se temos um token de acesso na URL, vamos tentar usá-lo para definir a sessão
        if (accessToken && tokenType) {
          try {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (!setSessionError) {
              setIsAuthenticated(true);
              setCheckingAuth(false);
              return;
            }
          } catch {
            // Continuar com outras abordagens se falhar
          }
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsAuthenticated(true);
            setCheckingAuth(false);
          } else if (session) {
            setIsAuthenticated(true);
            setCheckingAuth(false);
          }
        });

        // Check URL hash for recovery token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');

        if (type === 'recovery' || accessToken) {
          // Tentar forçar a autenticação após um tempo se o evento não for detectado
          setTimeout(() => {
            // Verificar novamente se já estamos autenticados
            if (!isAuthenticated) {
              setIsAuthenticated(true);
            }
            setCheckingAuth(false);
          }, 5000);
        } else {
          setCheckingAuth(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [accessToken, refreshToken, tokenType, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Primeiro, verificar se temos uma sessão
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && accessToken) {
        // Se não temos sessão, mas temos token, tentar definir a sessão novamente
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (setSessionError) {
          // Tentar atualizar a senha diretamente com o token
          try {
            // Criar um novo cliente Supabase com o token
            const supabaseWithToken = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL || '',
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              {
                global: {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              },
            );

            // Usar o novo cliente para atualizar a senha
            const { error: directUpdateError } = await supabaseWithToken.auth.updateUser({
              password,
            });

            if (directUpdateError) {
              throw directUpdateError;
            }

            // Se chegou aqui, a senha foi atualizada com sucesso
            setSuccess(true);

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);

            return; // Sair da função para não executar o updatePassword abaixo
          } catch (directError: unknown) {
            throw directError;
          }
        }
      }

      // Tentar atualizar a senha normalmente
      const { error } = await updatePassword(password);
      if (error) throw error;

      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar sua senha');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <AuthShell title="Verificando sua solicitação" description="Isso pode levar alguns segundos. Por favor, aguarde.">
        <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden="true" />
          <span>Validando o link de recuperação…</span>
        </div>
      </AuthShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthShell title="Não foi possível verificar automaticamente" description="O link pode ter expirado ou já ter sido utilizado.">
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">Você pode tentar novamente ou solicitar um novo link na <Link href="/forgot-password" className="font-semibold text-primary hover:text-primary/80">página de recuperação de senha</Link>.</p>
          <Button onClick={() => window.location.reload()} className="w-full">Tentar novamente</Button>
          <p className="text-center text-xs text-muted-foreground">Se o problema persistir, entre em contato com o suporte.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set new password" description="Enter your new password below.">
          {error && (
            <div role="alert" className="mb-5 break-words rounded-xl border border-destructive/35 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {success ? (
            <div className="text-center">
              <div role="status" className="rounded-xl border border-success/35 bg-success/10 p-4 text-sm text-foreground">
                Password updated successfully! You will be redirected to the dashboard.
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="New password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
    </AuthShell>
  );
}
