import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se veio de um link de reset
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuário clicou no link de reset, fica nesta página
        console.log('Password recovery mode');
      } else if (event === 'SIGNED_IN') {
        // Se já estiver logado normalmente, redireciona
        // (mas só após definir senha)
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (updateError) {
      setError('Erro ao definir senha. Tente novamente.');
      return;
    }

    setSuccess(true);
    
    // Redireciona para o admin após 2 segundos
    setTimeout(() => {
      navigate('/admin');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-serif font-bold text-foreground">
            {success ? 'Senha Alterada!' : 'Definir Nova Senha'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {success ? 'Redirecionando para o painel...' : 'Digite sua nova senha de acesso'}
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-foreground">
                Sua senha foi alterada com sucesso!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Digite a senha novamente"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Alterando...' : 'Definir nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;