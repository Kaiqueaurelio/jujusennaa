import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, AlertCircle, Loader2, Shield, UserPlus, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { user, loading: authLoading, isAdmin, signIn, signUp, signOut } = useSupabaseAuth();
  const navigate = useNavigate();

  // Navigate to admin when confirmed as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      const { error: signUpError } = await signUp(email, password);
      setLoading(false);

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Este email já está cadastrado');
        } else {
          setError(signUpError.message);
        }
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.');
        setIsSignUp(false);
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      setLoading(false);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Confirme seu email antes de fazer login');
        } else {
          setError(signInError.message);
        }
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  // Show message if user is logged in but not admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você está logado como {user.email || 'usuário'}, mas não tem permissões de administrador.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                Ir para o início
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <Card className="w-full max-w-md bg-card border-border relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {isSignUp ? <UserPlus className="w-8 h-8 text-primary" /> : <Shield className="w-8 h-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isSignUp ? 'Criar Conta' : 'Login Admin'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp ? 'Cadastre-se para acessar o painel' : 'Acesse sua conta de administrador'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground"
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>

            <div className="text-center pt-4 border-t border-border mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
