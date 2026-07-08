import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <div className="page">
      <section className="hero-card">
        <div className="hero-card__content">
          <div>
            <p className="eyebrow">Console principal</p>
            <h1>Bem-vindo, {session.user.name}</h1>
            <p>
              Esta camada web usa fetch nativo com arquitetura limpa para consumir a API do
              GAESDE com baixo overhead de memoria.
            </p>
          </div>

          <div className="hero-card__metrics">
            <div className="metric-box">
              <strong>{session.isAdmin ? 'Admin' : 'Usuario'}</strong>
              <span>Nivel de acesso</span>
            </div>
            <div className="metric-box metric-box--accent">
              <strong>JWT</strong>
              <span>Sessao validada</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        <article className="panel feature-panel feature-panel--profile">
          <h2>Seu Profile</h2>
          <p>Atualize nome e bio mantendo os dados sincronizados com o backend.</p>
          <Link className="button" to="/profile">
            Abrir profile
          </Link>
        </article>

        {session.isAdmin ? (
          <article className="panel feature-panel feature-panel--admin">
            <h2>Usuarios e permissoes</h2>
            <p>Visualize usuarios e gerencie roles admin, instructor e student.</p>
            <Link className="button" to="/users">
              Gerenciar usuarios
            </Link>
          </article>
        ) : (
          <article className="panel feature-panel feature-panel--observer">
            <h2>Acesso de aluno/instrutor</h2>
            <p>Seu acesso atual nao inclui painel administrativo de roles.</p>
          </article>
        )}
      </section>
    </div>
  );
}
