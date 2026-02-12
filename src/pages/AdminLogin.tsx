import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('Credenciais inválidas');
      return;
    }
    navigate('/admin');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setLoading(false);
    
    if (error) {
      setError('Erro ao enviar email. Verifique o endereço.');
      return;
    }
    
    setResetSuccess(true);
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => {
              setShowReset(false);
              setResetSuccess(false);
              setResetEmail('');
              setError('');
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-serif font-bold text-foreground">Recuperar Senha</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {resetSuccess 
                ? 'Email enviado com sucesso!' 
                : 'Digite seu email para receber o link'}
            </p>
          </div>

          {resetSuccess ? (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-foreground mb-2">
                  Enviamos um link de recuperação para:
                </p>
                <p className="text-sm font-medium text-primary mb-4">{resetEmail}</p>
                <p className="text-xs text-muted-foreground">
                  Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReset(false);
                  setResetSuccess(false);
                  setResetEmail('');
                }}
                className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="seu@email.com"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-serif font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;