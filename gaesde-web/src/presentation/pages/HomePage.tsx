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
            <h1>Bem-vindo, {session.user.name}</h1>
            <p>
              Gaesde significa games, estudo e desenho. nosso objetivo é fornecer uma plataforma de aprendizado gamificada, com foco em estudo e desenho, para que você possa aprimorar suas habilidades de forma divertida e envolvente.
            </p>
          </div>

          <div className="hero-card__metrics">
            <div className="metric-box">
              <strong>{session.isAdmin ? 'Admin' : 'Usuario'}</strong>
              <span>Nivel de acesso</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-cards">
        <article className="panel feature-panel feature-panel--catalog">
          <h2>Catálogo e trilhas</h2>
          <p>Gerencie cursos, módulos, conteúdos, quizzes e a base curricular do LMS.</p>
          <Link className="button" to="/courses">
            Abrir cursos
          </Link>
        </article>

        <article className="panel feature-panel feature-panel--profile">
          <h2>Seu Profile</h2>
          <p>Atualize  o nome e bio mantendo os dados sincronizados.</p>
          <Link className="button" to="/profile">
            Abrir profile
          </Link>
        </article>

        <article className="panel feature-panel feature-panel--learning">
          <h2>Área de aprendizado</h2>
          <p>Matricule-se, acompanhe progresso, resolva quizzes e envie atividades.</p>
          <Link className="button" to="/learning">
            Abrir aprendizado
          </Link>
        </article>

        {session.isAdmin || session.isInstructor ? (
          <article className="panel feature-panel feature-panel--classroom">
            <h2>Turmas e matrículas</h2>
            <p>Vincule alunos aos cursos, acompanhe progresso e emita certificados.</p>
            <Link className="button" to="/classroom">
              Gerenciar turmas
            </Link>
          </article>
        ) : null}

        {session.isAdmin ? (
          <article className="panel feature-panel feature-panel--admin">
            <h2>Usuarios e permissoes</h2>
            <p>Visualize usuarios e os gerencie</p>
            <Link className="button" to="/users">
              Gerenciar usuarios
            </Link>
          </article>
        ) : (
          <article className="panel feature-panel feature-panel--observer">
            <h2>Área operacional</h2>
            <p>Use a seção de cursos para acompanhar conteúdo, progresso, quizzes e atividades.</p>
          </article>
        )}
      </section>
    </div>
  );
}
