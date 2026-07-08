import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../../domain/entities/user';
import type { Role } from '../../domain/entities/role';
import { UserApiRepository } from '../../infrastructure/api/repositories/userApiRepository';
import { RoleApiRepository } from '../../infrastructure/api/repositories/roleApiRepository';
import { UserRoleApiRepository } from '../../infrastructure/api/repositories/userRoleApiRepository';
import { ListUsersUseCase } from '../../application/use-cases/users/listUsersUseCase';
import { ListRolesUseCase } from '../../application/use-cases/roles/listRolesUseCase';
import { GetUserRolesUseCase } from '../../application/use-cases/roles/getUserRolesUseCase';
import { AssignRoleUseCase } from '../../application/use-cases/roles/assignRoleUseCase';
import { RemoveRoleUseCase } from '../../application/use-cases/roles/removeRoleUseCase';
import { getErrorMessage } from '../utils/errorMessage';
import { EditUserModal } from '../components/modals/EditUserModal';

const userRepository = new UserApiRepository();
const roleRepository = new RoleApiRepository();
const userRoleRepository = new UserRoleApiRepository();

const listUsersUseCase = new ListUsersUseCase(userRepository);
const listRolesUseCase = new ListRolesUseCase(roleRepository);
const getUserRolesUseCase = new GetUserRolesUseCase(userRoleRepository);
const assignRoleUseCase = new AssignRoleUseCase(userRoleRepository);
const removeRoleUseCase = new RemoveRoleUseCase(userRoleRepository);

export function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const [usersResult, rolesResult] = await Promise.all([
          listUsersUseCase.execute(session.accessToken),
          listRolesUseCase.execute(session.accessToken),
        ]);

        if (!mounted) {
          return;
        }

        setUsers(usersResult);
        setRoles(rolesResult);

        if (usersResult[0]) {
          setSelectedUserId(usersResult[0].id);
        }
      } catch (error) {
        if (mounted) {
          setMessage(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session || !selectedUserId) {
      return;
    }

    let mounted = true;

    const loadRoles = async () => {
      try {
        const result = await getUserRolesUseCase.execute(session.accessToken, selectedUserId);
        if (mounted) {
          setUserRoles(result);
        }
      } catch (error) {
        if (mounted) {
          setMessage(getErrorMessage(error));
        }
      }
    };

    loadRoles();

    return () => {
      mounted = false;
    };
  }, [session, selectedUserId]);

  if (!session) {
    return null;
  }

  const availableRoles = roles.filter((role) => !userRoles.some((owned) => owned.id === role.id));

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      await assignRoleUseCase.execute(session.accessToken, selectedUserId, selectedRoleId);
      const updated = await getUserRolesUseCase.execute(session.accessToken, selectedUserId);
      setUserRoles(updated);
      setSelectedRoleId('');
      setMessage('Role atribuida com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUserId) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await removeRoleUseCase.execute(session.accessToken, selectedUserId, roleId);
      const updated = await getUserRolesUseCase.execute(session.accessToken, selectedUserId);
      setUserRoles(updated);
      setMessage('Role removida com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (user: User) => {
    setEditingUser(user);
  };

  const handleEditClose = () => {
    setEditingUser(null);
  };

  const handleEditSave = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setSelectedUserId(updatedUser.id);
  };

  const handleCreateSave = (createdUser: User) => {
    setUsers((prev) => [createdUser, ...prev]);
    setSelectedUserId(createdUser.id);
    setMessage('usuario criado com sucesso.');
  };

  const handleUserDelete = (deletedUserId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== deletedUserId));
    if (selectedUserId === deletedUserId) {
      const remaining = users.filter((u) => u.id !== deletedUserId);
      if (remaining[0]) {
        setSelectedUserId(remaining[0].id);
      }
    }
    setMessage('usuario deletado com sucesso.');
  };

  return (
    <div className="page">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Administracao</p>
          <h1>Usuarios e permissoes</h1>
          <p className="muted">Controle de acesso, atribuicao de roles e leitura rapida do quadro atual.</p>
        </div>

        <div className="admin-hero__stats">
          <div className="metric-box">
            <strong>{users.length}</strong>
            <span>Usuarios</span>
          </div>
          <div className="metric-box metric-box--accent">
            <strong>{roles.length}</strong>
            <span>Roles</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="users-panel-header">
          <p className="muted">Painel de administracao para roles dos usuarios.</p>
          <button
            type="button"
            className="user-create-btn"
            title="Criar novo usuário"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span aria-hidden="true">+</span>
            <small>Novo</small>
          </button>
        </div>

        {message ? <p className="info">{message}</p> : null}

        <div className="users-layout">
          <aside className="users-list">
            {users.map((user) => (
              <div key={user.id} className={`user-item-wrapper ${selectedUserId === user.id ? 'user-item-wrapper--active' : ''}`}>
                <button
                  type="button"
                  className={`user-item ${selectedUserId === user.id ? 'user-item--active' : ''}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </button>
                <button
                  type="button"
                  className="user-item-edit"
                  onClick={() => handleEditOpen(user)}
                  title="Editar usuário"
                >
                  ✎
                </button>
              </div>
            ))}
          </aside>

          <section className="panel panel--nested">
            <h2>{selectedUser ? selectedUser.name : 'Selecione um usuario'}</h2>
            <p className="muted">Roles atuais</p>

            <div className="roles-wrap">
              {userRoles.length === 0 ? <p>Nenhuma role atribuida.</p> : null}
              {userRoles.map((role) => (
                <div key={role.id} className="role-chip">
                  <span>{role.name}</span>
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={loading}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="assign-row">
              <select
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(event.target.value)}
                disabled={loading || availableRoles.length === 0}
              >
                <option value="">Selecione uma role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.slug})
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="button"
                onClick={handleAssignRole}
                disabled={loading || !selectedRoleId}
              >
                Atribuir role
              </button>
            </div>
          </section>
        </div>
      </section>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          token={session.accessToken}
          onClose={handleEditClose}
          onSave={handleEditSave}
          onDelete={handleUserDelete}
        />
      )}

      {isCreateModalOpen && (
        <EditUserModal
          token={session.accessToken}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateSave}
        />
      )}
    </div>
  );
}
