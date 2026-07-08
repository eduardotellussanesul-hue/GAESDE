import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page page--center">
      <section className="panel">
        <h1>Pagina nao encontrada</h1>
        <Link to="/" className="button">
          Voltar para home
        </Link>
      </section>
    </div>
  );
}
