import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserApiRepository } from '../../infrastructure/api/repositories/userApiRepository';
import { CertificateApiRepository } from '../../infrastructure/api/repositories/certificateApiRepository';
import { CourseApiRepository } from '../../infrastructure/api/repositories/courseApiRepository';
import { EnrollmentApiRepository } from '../../infrastructure/api/repositories/enrollmentApiRepository';
import type { Course, Enrollment } from '../../domain/entities/lms';
import type { User } from '../../domain/entities/user';
import { getErrorMessage } from '../utils/errorMessage';

const userRepository = new UserApiRepository();
const certificateRepository = new CertificateApiRepository();
const courseRepository = new CourseApiRepository();
const enrollmentRepository = new EnrollmentApiRepository();

const defaultStudentForm = {
  name: '',
  email: '',
  password: '',
  bio: '',
};

export function ClassroomPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentForm, setStudentForm] = useState(defaultStudentForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const enrolledUserIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.userId)),
    [enrollments],
  );

  const availableUsers = useMemo(
    () => users.filter((user) => !enrolledUserIds.has(user.id)),
    [users, enrolledUserIds],
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
        const [usersResult, coursesResult] = await Promise.all([
          userRepository.listUsers(session.accessToken),
          session.isAdmin
            ? courseRepository.listCourses(session.accessToken)
            : courseRepository.listInstructorCourses(session.accessToken, session.user.id),
        ]);

        if (!mounted) {
          return;
        }

        setUsers(usersResult.filter((user) => user.id !== session.user.id));
        setCourses(coursesResult);
        if (coursesResult[0]) {
          setSelectedCourseId(coursesResult[0].id);
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
    if (!session || !selectedCourseId) {
      setEnrollments([]);
      return;
    }

    let mounted = true;

    const loadEnrollments = async () => {
      setLoading(true);

      try {
        const enrollmentsResult = await enrollmentRepository.listCourseEnrollments(session.accessToken, selectedCourseId);
        if (mounted) {
          setEnrollments(enrollmentsResult);
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

    loadEnrollments();

    return () => {
      mounted = false;
    };
  }, [session, selectedCourseId]);

  if (!session) {
    return null;
  }

  const refreshData = async (preferredCourseId = selectedCourseId) => {
    const [usersResult, enrollmentsResult] = await Promise.all([
      userRepository.listUsers(session.accessToken),
      preferredCourseId ? enrollmentRepository.listCourseEnrollments(session.accessToken, preferredCourseId) : Promise.resolve([]),
    ]);

    setUsers(usersResult.filter((user) => user.id !== session.user.id));
    setEnrollments(enrollmentsResult);
  };

  const handleCreateStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const created = await userRepository.createUser(session.accessToken, {
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password,
        bio: studentForm.bio || undefined,
      });

      setStudentForm(defaultStudentForm);
      setSelectedUserId(created.id);
      await refreshData();
      setMessage('Aluno criado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEnrollment = async () => {
    if (!selectedCourseId || !selectedUserId) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await enrollmentRepository.assignEnrollment(session.accessToken, selectedUserId, selectedCourseId);
      await refreshData(selectedCourseId);
      setMessage('Aluno vinculado ao curso com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (enrollmentId: string) => {
    setLoading(true);
    setMessage(null);

    try {
      await certificateRepository.generateCertificate(session.accessToken, enrollmentId);
      setMessage('Certificado gerado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="classroom-hero">
        <div>
          <p className="eyebrow">Turmas</p>
          <h1>Vínculo entre alunos e cursos</h1>
          <p className="muted">
            Cadastre alunos, associe cada um aos cursos do LMS e acompanhe progresso, status e certificado.
          </p>
        </div>

        <div className="classroom-hero__stats">
          <div className="metric-box">
            <strong>{courses.length}</strong>
            <span>Cursos gerenciados</span>
          </div>
          <div className="metric-box metric-box--accent">
            <strong>{enrollments.length}</strong>
            <span>Matrículas no curso</span>
          </div>
        </div>
      </section>

      {message ? <p className="info">{message}</p> : null}

      <section className="classroom-layout">
        <div className="classroom-main">
          <section className="panel">
            <div className="panel-header-inline">
              <div>
                <h2>Novo aluno</h2>
                <p className="muted">Crie o cadastro do aluno e use o vínculo logo abaixo para associá-lo a um curso.</p>
              </div>
            </div>

            <form className="form classroom-form" onSubmit={handleCreateStudent}>
              <div className="classroom-form__grid">
                <label className="field">
                  <span>Nome</span>
                  <input
                    value={studentForm.name}
                    onChange={(event) => setStudentForm((previous) => ({ ...previous, name: event.target.value }))}
                    required
                  />
                </label>

                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(event) => setStudentForm((previous) => ({ ...previous, email: event.target.value }))}
                    required
                  />
                </label>

                <label className="field">
                  <span>Senha</span>
                  <input
                    type="password"
                    value={studentForm.password}
                    onChange={(event) => setStudentForm((previous) => ({ ...previous, password: event.target.value }))}
                    required
                  />
                </label>

                <label className="field">
                  <span>Bio</span>
                  <input
                    value={studentForm.bio}
                    onChange={(event) => setStudentForm((previous) => ({ ...previous, bio: event.target.value }))}
                  />
                </label>
              </div>

              <button type="submit" className="button" disabled={loading}>
                Criar aluno
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header-inline">
              <div>
                <h2>Vincular aluno ao curso</h2>
                <p className="muted">Escolha um curso do professor e associe alunos ainda não matriculados.</p>
              </div>
            </div>

            <div className="classroom-form__grid">
              <label className="field">
                <span>Curso</span>
                <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Aluno</span>
                <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                  <option value="">Selecione um aluno</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button type="button" className="button" onClick={handleAssignEnrollment} disabled={loading || !selectedUserId}>
              Vincular aluno
            </button>
          </section>

          <section className="panel">
            <div className="panel-header-inline">
              <div>
                <h2>{selectedCourse?.title ?? 'Selecione um curso'}</h2>
                <p className="muted">Matrículas, progresso e status dos alunos neste curso.</p>
              </div>
            </div>

            <div className="classroom-enrollment-list">
              {enrollments.map((enrollment) => (
                <article key={enrollment.id} className="classroom-enrollment-card">
                  <div>
                    <strong>{enrollment.user?.name ?? enrollment.userId}</strong>
                    <small>{enrollment.user?.email ?? 'Sem email carregado'}</small>
                  </div>

                  <div className="classroom-enrollment-card__metrics">
                    <span>Status: {enrollment.status}</span>
                    <span>Progresso: {enrollment.progressPercentage}%</span>
                  </div>

                  {session.isAdmin && enrollment.isCompleted ? (
                    <button type="button" className="button" onClick={() => handleGenerateCertificate(enrollment.id)} disabled={loading}>
                      Gerar certificado
                    </button>
                  ) : null}
                </article>
              ))}

              {selectedCourse && enrollments.length === 0 ? (
                <div className="empty-state">
                  <h3>Nenhum aluno vinculado ainda.</h3>
                  <p className="muted">Use o formulário acima para associar o primeiro aluno a este curso.</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}