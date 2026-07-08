import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorMessage';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('admin@gaesde.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--center">
      <section className="auth-shell">
        <aside className="auth-shell__story">
          <p className="eyebrow">Painel operacional</p>
          <h1>Acesse o GAESDE com foco, ritmo e clareza.</h1>
          <p className="muted">
            Base em cinza-ardosia, energia em azul-eletrico e calor controlado em dourado-ambar.
          </p>

          <div className="auth-shell__tokens" aria-hidden="true">
            <span className="token token--slate" />
            <span className="token token--blue" />
            <span className="token token--amber" />
            <span className="token token--ice" />
          </div>

          <div className="signal-card">
            <strong>API ativa</strong>
            <span>localhost:3000</span>
          </div>
        </aside>

        <section className="panel panel--auth">
          <p className="eyebrow">Login</p>
          <h2>Entrar na console</h2>
          <p className="muted">Use sua conta para acessar profile, usuarios e permissoes.</p>

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error ? <p className="error">{error}</p> : null}

            <button type="submit" className="button button--wide" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
