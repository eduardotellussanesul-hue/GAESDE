import { useState } from 'react';
import type { User } from '../../../domain/entities/user';
import { UserApiRepository } from '../../../infrastructure/api/repositories/userApiRepository';
import { DeleteUserUseCase } from '../../../application/use-cases/users/deleteUserUseCase';
import { CreateUserUseCase } from '../../../application/use-cases/users/createUserUseCase';
import { getErrorMessage } from '../../utils/errorMessage';

const userRepository = new UserApiRepository();
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);

interface EditUserModalProps {
  user?: User;
  token: string;
  onClose: () => void;
  onSave: (savedUser: User) => void;
  onDelete?: (userId: string) => void;
}

export function EditUserModal({ user, token, onClose, onSave, onDelete }: EditUserModalProps) {
  const isCreateMode = !user;
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const savedUser = isCreateMode
        ? await createUserUseCase.execute(token, {
            email,
            password,
            name,
            ...(bio ? { bio } : {}),
            ...(file ? { file } : {}),
          })
        : await userRepository.updateProfile(token, user.id, {
            name,
            bio,
            ...(file ? { file } : {}),
          });

      onSave(savedUser);
      onClose();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !onDelete) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await deleteUserUseCase.execute(token, user.id);
      onDelete(user.id);
      onClose();
    } catch (error) {
      setMessage(getErrorMessage(error));
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = imagePreview || user?.avatarUrl;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{isCreateMode ? 'Criar novo usuário' : 'Editar usuário'}</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="modal__content">
          <div className="modal__avatar">
            {displayAvatar ? (
              <img src={displayAvatar} alt={name} />
            ) : (
              <span>{name ? name.slice(0, 1).toUpperCase() : '+'}</span>
            )}
          </div>

          {isCreateMode ? (
            <>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Senha</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </label>
            </>
          ) : null}

          <label className="field">
            <span>Avatar</span>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {file ? <p className="muted">Arquivo selecionado: {file.name}</p> : null}
          </label>

          <label className="field">
            <span>Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="field">
            <span>Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Fale um pouco sobre o usuário"
            />
          </label>

          {message ? <p className="info">{message}</p> : null}

          {!showDeleteConfirm || isCreateMode ? (
            <div className="modal__actions">
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Salvando...' : isCreateMode ? 'Criar usuário' : 'Salvar'}
              </button>
              {!isCreateMode ? (
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  Deletar
                </button>
              ) : null}
            </div>
          ) : (
            <div className="modal__delete-confirm">
              <p className="muted">Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.</p>
              <div className="modal__actions">
                <button
                  type="button"
                  className="button button--danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deletando...' : 'Confirmar deletar'}
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
