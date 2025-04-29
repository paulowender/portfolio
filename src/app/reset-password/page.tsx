'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import Button from '@/components/Button';
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
          } catch (setSessionError) {
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
      } catch (err) {
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
          } catch (directError: any) {
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
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao atualizar sua senha');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="text-white">
            <div className="mb-4">
              <div
                className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-400 rounded-full"
                role="status"
                aria-label="loading"
              >
                <span className="sr-only">Loading...</span>
              </div>
            </div>
            <div className="animate-pulse">Verificando sua solicitação...</div>
            <p className="text-gray-400 text-sm mt-4">
              Isso pode levar alguns segundos. Por favor, aguarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              Não foi possível verificar automaticamente
            </h2>
            <p className="text-gray-400 mt-2">
              Você pode tentar novamente ou solicitar um novo link de redefinição de senha na{' '}
              <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                página de recuperação de senha
              </Link>
              .
            </p>
          </div>

          <div className="mt-8 bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div className="text-center mb-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Tentar novamente
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-extrabold text-white">Wender Tech</h2>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Set new password</h2>
          <p className="mt-2 text-sm text-gray-400">Enter your new password below</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10"
        >
          {error && (
            <div className="mb-4 bg-red-900/50 text-red-200 p-3 rounded-md text-sm">{error}</div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-4 bg-green-900/50 text-green-200 p-3 rounded-md text-sm">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
        </motion.div>
      </div>
    </div>
  );
}
