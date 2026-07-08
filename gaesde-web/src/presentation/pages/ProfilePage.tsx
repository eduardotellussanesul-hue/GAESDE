import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserApiRepository } from '../../infrastructure/api/repositories/userApiRepository';
import { UpdateProfileUseCase } from '../../application/use-cases/users/updateProfileUseCase';
import { getErrorMessage } from '../utils/errorMessage';

const userRepository = new UserApiRepository();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

export function ProfilePage() {
  const { session, updateSessionUser } = useAuth();
  const [name, setName] = useState(session?.user.name ?? '');
  const [bio, setBio] = useState(session?.user.bio ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!session) {
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updatedUser = await updateProfileUseCase.execute(session.accessToken, session.user.id, {
        name,
        bio,
        ...(file ? { file } : {}),
      });
      updateSessionUser(updatedUser);
      setFile(null);
      setImagePreview(null);
      setMessage('Profile atualizado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = imagePreview || session.user.avatarUrl;

  return (
    <div className="page">
      <section className="profile-hero">
        <div className="profile-hero__avatar" aria-hidden="true">
          {displayAvatar ? (
            <img src={displayAvatar} alt={session.user.name} />
          ) : (
            session.user.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <p className="eyebrow">Perfil pessoal</p>
          <h1>{session.user.name}</h1>
          <p className="muted">Email: {session.user.email}</p>
          <p className="muted">Ultimo login: {session.user.lastLoginAt ?? 'Sem registro'}</p>
        </div>
      </section>

      <section className="panel panel--profile">
        <h2>Editar dados</h2>
        <p className="muted">Ajuste suas informacoes sem sair da sessao atual.</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Avatar</span>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {file ? <p className="muted">Arquivo selecionado: {file.name}</p> : null}
          </label>

          <label className="field">
            <span>Nome</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          <label className="field">
            <span>Bio</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              placeholder="Fale um pouco sobre voce"
            />
          </label>

          {message ? <p className="info">{message}</p> : null}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alteracoes'}
          </button>
        </form>
      </section>
    </div>
  );
}
