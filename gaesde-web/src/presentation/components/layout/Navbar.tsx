import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { session, signOut } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <span>
            <strong>GAESDE</strong>
            <small>Web Console</small>
          </span>
        </Link>

        <nav className="menu" aria-label="Navegacao principal">
          <NavLink to="/" end className="menu__link">
            Home
          </NavLink>
          <NavLink to="/profile" className="menu__link">
            Profile
          </NavLink>
          {session.isAdmin || session.isInstructor ? (
            <NavLink to="/users" className="menu__link">
              Usuarios e Permissoes
            </NavLink>
          ) : null}
        </nav>

        <div className="profile-chip">
          <div className="profile-chip__identity">
            <span className="profile-chip__avatar" aria-hidden="true">
              {session.user.name.slice(0, 1).toUpperCase()}
            </span>
            <span>{session.user.name}</span>
          </div>
          <button type="button" className="button button--ghost" onClick={signOut}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
