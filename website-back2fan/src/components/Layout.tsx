
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useStaking } from '@/hooks/useStaking';

/**
 * Layout garante que só redireciona se loading for false E isConnected for false.
 * Adiciona logs para monitorar o fluxo de autenticação.
 * Não retorna null nem faz redirect prematuro, evitando erro de timing dos hooks.
 */
const Layout = () => {
  const { isConnected, loading } = useStaking();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Layout/useEffect] loading:', loading, 'isConnected:', isConnected);
    // Só redireciona para home se loading terminou E NÃO está conectado
    if (!loading && !isConnected) {
      console.log('[Layout] Redirecionando para home porque não está autenticado.');
      navigate('/');
    }
  }, [isConnected, loading, navigate]);

  if (loading) {
    // Exibe spinner enquanto loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-600 text-lg font-semibold animate-pulse">
          Carregando dados da carteira...
        </div>
      </div>
    );
  }

  if (!isConnected) {
    // Só bloqueia o conteúdo se loading == false e isConnected == false
    // (Na prática, só vai chegar aqui se loading terminou e wallet está realmente desconectada)
    console.log('[Layout] Não autenticado nem carregando. Bloqueando conteúdo.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-600 text-lg font-semibold">
          Por favor, conecte sua carteira para acessar esse conteúdo.
        </div>
      </div>
    );
  }

  // Usuário autenticado e carregado
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
