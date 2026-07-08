import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CategoryApiRepository } from '../../infrastructure/api/repositories/categoryApiRepository';
import { ContentApiRepository } from '../../infrastructure/api/repositories/contentApiRepository';
import { CourseApiRepository } from '../../infrastructure/api/repositories/courseApiRepository';
import { EnrollmentApiRepository } from '../../infrastructure/api/repositories/enrollmentApiRepository';
import { ModuleApiRepository } from '../../infrastructure/api/repositories/moduleApiRepository';
import { QuizApiRepository } from '../../infrastructure/api/repositories/quizApiRepository';
import type { Category, ContentItem, ContentType, Course, FullQuiz, ModuleItem, Question } from '../../domain/entities/lms';
import { getErrorMessage } from '../utils/errorMessage';

const categoryRepository = new CategoryApiRepository();
const contentRepository = new ContentApiRepository();
const courseRepository = new CourseApiRepository();
const enrollmentRepository = new EnrollmentApiRepository();
const moduleRepository = new ModuleApiRepository();
const quizRepository = new QuizApiRepository();

const defaultCourseForm = {
  title: '',
  slug: '',
  description: '',
  level: 'beginner' as Course['level'],
  price: '0',
  categoryId: '',
};

const defaultModuleForm = {
  title: '',
  description: '',
};

const defaultContentForm = {
  title: '',
  type: 'text' as ContentType,
  orderIndex: '0',
  isFreePreview: false,
  durationSeconds: '0',
  body: '',
  videoUrl: '',
  videoDurationSeconds: '0',
  fileUrl: '',
  fileSizeBytes: '0',
};

const defaultQuizForm = {
  passingScorePercentage: '60',
  attemptsAllowed: '1',
  shuffleQuestions: false,
  timeLimitMinutes: '30',
};

const defaultQuestionForm = {
  questionText: '',
  type: 'multiple_choice' as Question['type'],
  points: '1',
};

const defaultOptionForm = {
  optionText: '',
  isCorrect: false,
};

type OptionDraft = typeof defaultOptionForm;

const createOptionDraft = (): OptionDraft => ({
  optionText: '',
  isCorrect: false,
});

export function CoursesPage() {
  const { session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [contentsByModule, setContentsByModule] = useState<Record<string, ContentItem[]>>({});
  const [quizzesByContent, setQuizzesByContent] = useState<Record<string, FullQuiz>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState(defaultCourseForm);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState(defaultModuleForm);
  const [contentFormByModule, setContentFormByModule] = useState<Record<string, typeof defaultContentForm>>({});
  const [editContentFormById, setEditContentFormById] = useState<Record<string, typeof defaultContentForm>>({});
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [quizFormByContent, setQuizFormByContent] = useState<Record<string, typeof defaultQuizForm>>({});
  const [questionFormByContent, setQuestionFormByContent] = useState<Record<string, typeof defaultQuestionForm>>({});
  const [optionDraftsByQuestion, setOptionDraftsByQuestion] = useState<Record<string, OptionDraft[]>>({});

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
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
        const categoriesPromise = categoryRepository.listCategories(session.accessToken);
        let coursesResult: Course[] = [];

        if (session.isAdmin) {
          coursesResult = await courseRepository.listCourses(session.accessToken);
        } else if (session.isInstructor) {
          coursesResult = await courseRepository.listInstructorCourses(session.accessToken, session.user.id);
        } else {
          const [publishedCourses, myEnrollments] = await Promise.all([
            courseRepository.listPublishedCourses(session.accessToken),
            enrollmentRepository.listMyEnrollments(session.accessToken),
          ]);
          const enrolledCourseIds = new Set(myEnrollments.map((enrollment) => enrollment.courseId));
          coursesResult = publishedCourses.filter((course) => enrolledCourseIds.has(course.id));
        }

        const categoriesResult = await categoriesPromise;

        if (!mounted) {
          return;
        }

        setCourses(coursesResult);
        setCategories(categoriesResult);
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
      setModules([]);
      setContentsByModule({});
      setQuizzesByContent({});
      return;
    }

    let mounted = true;

    const loadCourseStructure = async () => {
      setLoading(true);

      try {
        const modulesResult = await moduleRepository.listModulesByCourse(session.accessToken, selectedCourseId);
        if (!mounted) {
          return;
        }

        setModules(modulesResult);

        const contentsEntries = await Promise.all(
          modulesResult.map(async (module) => [
            module.id,
            await contentRepository.listContentsByModule(session.accessToken, module.id),
          ] as const),
        );

        const quizEntries = await Promise.all(
          contentsEntries
            .flatMap((entry) => entry[1])
            .filter((content) => content.type === 'quiz')
            .map(async (content) => [content.id, await quizRepository.getFullQuizByContent(session.accessToken, content.id)] as const),
        );

        if (!mounted) {
          return;
        }

        setContentsByModule(Object.fromEntries(contentsEntries));
        setQuizzesByContent(
          Object.fromEntries(
            quizEntries
              .filter((entry): entry is readonly [string, FullQuiz] => Boolean(entry[1]))
              .map(([contentId, quiz]) => [contentId, quiz]),
          ),
        );
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

    loadCourseStructure();

    return () => {
      mounted = false;
    };
  }, [session, selectedCourseId]);

  if (!session) {
    return null;
  }

  const canManageCourses = session.isAdmin || session.isInstructor;

  const resetCourseForm = () => {
    setCourseForm(defaultCourseForm);
    setEditingCourseId(null);
  };

  const refreshCourses = async (preferredCourseId?: string) => {
    const refreshedCourses = session.isAdmin
      ? await courseRepository.listCourses(session.accessToken)
      : await courseRepository.listInstructorCourses(session.accessToken, session.user.id);

    setCourses(refreshedCourses);
    const nextId = preferredCourseId ?? refreshedCourses[0]?.id ?? '';
    setSelectedCourseId(nextId);
  };

  const handleCourseSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        title: courseForm.title,
        slug: courseForm.slug,
        description: courseForm.description || undefined,
        level: courseForm.level,
        price: Number(courseForm.price || 0),
        categoryId: courseForm.categoryId || undefined,
      };

      const savedCourse = editingCourseId
        ? await courseRepository.updateCourse(session.accessToken, editingCourseId, payload)
        : await courseRepository.createCourse(session.accessToken, payload);

      await refreshCourses(savedCourse.id);
      resetCourseForm();
      setMessage(editingCourseId ? 'Curso atualizado com sucesso.' : 'Curso criado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      slug: course.slug,
      description: course.description ?? '',
      level: course.level,
      price: String(course.price ?? 0),
      categoryId: course.categoryId ?? '',
    });
  };

  const handleCourseStatus = async (courseId: string, action: 'publish' | 'archive') => {
    setLoading(true);
    setMessage(null);

    try {
      if (action === 'publish') {
        await courseRepository.publishCourse(session.accessToken, courseId);
      } else {
        await courseRepository.archiveCourse(session.accessToken, courseId);
      }

      await refreshCourses(courseId);
      setMessage(action === 'publish' ? 'Curso publicado.' : 'Curso arquivado.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const createdModule = await moduleRepository.createModule(session.accessToken, {
        courseId: selectedCourse.id,
        title: moduleForm.title,
        description: moduleForm.description || undefined,
        orderIndex: modules.length,
      });

      const updatedModules = [...modules, createdModule].sort((left, right) => left.orderIndex - right.orderIndex);
      setModules(updatedModules);
      setModuleForm(defaultModuleForm);
      setMessage('Módulo criado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getContentForm = (moduleId: string) => contentFormByModule[moduleId] ?? defaultContentForm;

  const setContentForm = (moduleId: string, nextValue: typeof defaultContentForm) => {
    setContentFormByModule((previous) => ({
      ...previous,
      [moduleId]: nextValue,
    }));
  };

  const getQuizForm = (contentId: string) => quizFormByContent[contentId] ?? defaultQuizForm;

  const getEditContentForm = (contentId: string) => editContentFormById[contentId] ?? defaultContentForm;

  const setQuizForm = (contentId: string, nextValue: typeof defaultQuizForm) => {
    setQuizFormByContent((previous) => ({
      ...previous,
      [contentId]: nextValue,
    }));
  };

  const setEditContentForm = (contentId: string, nextValue: typeof defaultContentForm) => {
    setEditContentFormById((previous) => ({
      ...previous,
      [contentId]: nextValue,
    }));
  };

  const getQuestionForm = (contentId: string) => questionFormByContent[contentId] ?? defaultQuestionForm;

  const setQuestionForm = (contentId: string, nextValue: typeof defaultQuestionForm) => {
    setQuestionFormByContent((previous) => ({
      ...previous,
      [contentId]: nextValue,
    }));
  };

  const getOptionDrafts = (questionId: string): OptionDraft[] => optionDraftsByQuestion[questionId] ?? [createOptionDraft()];

  const setOptionDrafts = (questionId: string, nextValue: OptionDraft[]) => {
    setOptionDraftsByQuestion((previous) => ({
      ...previous,
      [questionId]: nextValue,
    }));
  };

  const handleAddOptionDraft = (questionId: string) => {
    setOptionDrafts(questionId, [...getOptionDrafts(questionId), createOptionDraft()]);
  };

  const handleOptionDraftChange = (questionId: string, index: number, patch: Partial<OptionDraft>) => {
    const currentDrafts = getOptionDrafts(questionId);
    const nextDrafts = currentDrafts.map((draft, currentIndex) => (currentIndex === index ? { ...draft, ...patch } : draft));
    setOptionDrafts(questionId, nextDrafts);
  };

  const handleRemoveOptionDraft = (questionId: string, index: number) => {
    const currentDrafts = getOptionDrafts(questionId);
    if (currentDrafts.length <= 1) {
      setOptionDrafts(questionId, [createOptionDraft()]);
      return;
    }

    const nextDrafts = currentDrafts.filter((_, currentIndex) => currentIndex !== index);
    setOptionDrafts(questionId, nextDrafts.length > 0 ? nextDrafts : [createOptionDraft()]);
  };

  const refreshQuizByContent = async (contentId: string) => {
    const refreshedQuiz = await quizRepository.getFullQuizByContent(session.accessToken, contentId);
    setQuizzesByContent((previous) => {
      if (!refreshedQuiz) {
        const nextValue = { ...previous };
        delete nextValue[contentId];
        return nextValue;
      }

      return {
        ...previous,
        [contentId]: refreshedQuiz,
      };
    });
  };

  const handleContentSubmit = async (event: React.FormEvent<HTMLFormElement>, moduleId: string) => {
    event.preventDefault();
    const form = getContentForm(moduleId);
    const moduleContents = contentsByModule[moduleId] ?? [];
    setLoading(true);
    setMessage(null);

    try {
      const createdContent = await contentRepository.createContent(session.accessToken, {
        moduleId,
        title: form.title,
        type: form.type,
        orderIndex: moduleContents.length,
        isFreePreview: form.isFreePreview,
        durationSeconds: form.type === 'video' ? Number(form.durationSeconds || 0) : undefined,
      });

      if (form.type === 'text' && form.body.trim()) {
        await contentRepository.createOrUpdateContentDetails(session.accessToken, createdContent.id, 'text', {
          body: form.body,
        });
      }

      if (form.type === 'video' && form.videoUrl.trim()) {
        await contentRepository.createOrUpdateContentDetails(session.accessToken, createdContent.id, 'video', {
          videoUrl: form.videoUrl,
          videoDurationSeconds: Number(form.videoDurationSeconds || 0),
        });
      }

      if (form.type === 'pdf' && form.fileUrl.trim()) {
        await contentRepository.createOrUpdateContentDetails(session.accessToken, createdContent.id, 'pdf', {
          fileUrl: form.fileUrl,
          fileSizeBytes: Number(form.fileSizeBytes || 0),
        });
      }

      const refreshedContents = await contentRepository.listContentsByModule(session.accessToken, moduleId);
      setContentsByModule((previous) => ({
        ...previous,
        [moduleId]: refreshedContents,
      }));
      setContentForm(moduleId, defaultContentForm);
      setMessage('Conteúdo criado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStartContentEdit = async (contentId: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const fullContent = await contentRepository.getFullContent(session.accessToken, contentId);
      setEditContentForm(contentId, {
        title: fullContent.title,
        type: fullContent.type,
        orderIndex: String(fullContent.orderIndex),
        isFreePreview: fullContent.isFreePreview,
        durationSeconds: String(fullContent.durationSeconds ?? 0),
        body: fullContent.text?.body ?? '',
        videoUrl: fullContent.video?.videoUrl ?? '',
        videoDurationSeconds: String(fullContent.video?.videoDurationSeconds ?? fullContent.durationSeconds ?? 0),
        fileUrl: fullContent.pdf?.fileUrl ?? '',
        fileSizeBytes: String(fullContent.pdf?.fileSizeBytes ?? 0),
      });
      setEditingContentId(contentId);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelContentEdit = () => {
    setEditingContentId(null);
  };

  const handleContentUpdate = async (event: React.FormEvent<HTMLFormElement>, moduleId: string, content: ContentItem) => {
    event.preventDefault();
    const form = getEditContentForm(content.id);

    setLoading(true);
    setMessage(null);

    try {
      await contentRepository.updateContent(session.accessToken, content.id, {
        title: form.title,
        isFreePreview: form.isFreePreview,
        durationSeconds: content.type === 'video' ? Number(form.durationSeconds || 0) : undefined,
      });

      if (content.type === 'text' && form.body.trim()) {
        await contentRepository.createOrUpdateContentDetails(session.accessToken, content.id, 'text', {
          body: form.body,
        }, true);
      }

      if (content.type === 'video' && form.videoUrl.trim()) {
        await contentRepository.createOrUpdateContentDetails(session.accessToken, content.id, 'video', {
          videoUrl: form.videoUrl,
          videoDurationSeconds: Number(form.videoDurationSeconds || 0),
        }, true);
      }

      if (content.type === 'pdf' && form.fileUrl.trim()) {
        await contentRepository.createOrUpdateContentDetails(session.accessToken, content.id, 'pdf', {
          fileUrl: form.fileUrl,
          fileSizeBytes: Number(form.fileSizeBytes || 0),
        }, true);
      }

      const refreshedContents = await contentRepository.listContentsByModule(session.accessToken, moduleId);
      setContentsByModule((previous) => ({
        ...previous,
        [moduleId]: refreshedContents,
      }));
      setEditingContentId(null);
      setMessage('Conteúdo atualizado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (event: React.FormEvent<HTMLFormElement>, contentId: string) => {
    event.preventDefault();
    const form = getQuizForm(contentId);
    setLoading(true);
    setMessage(null);

    try {
      await quizRepository.createQuiz(session.accessToken, {
        contentId,
        passingScorePercentage: Number(form.passingScorePercentage || 60),
        attemptsAllowed: Number(form.attemptsAllowed || 1),
        shuffleQuestions: form.shuffleQuestions,
        timeLimitMinutes: Number(form.timeLimitMinutes || 0),
      });
      await refreshQuizByContent(contentId);
      setQuizForm(contentId, defaultQuizForm);
      setMessage('Quiz criado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (event: React.FormEvent<HTMLFormElement>, contentId: string) => {
    event.preventDefault();
    const quiz = quizzesByContent[contentId];
    const form = getQuestionForm(contentId);

    if (!quiz) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await quizRepository.createQuestion(session.accessToken, {
        quizId: quiz.id,
        type: form.type,
        questionText: form.questionText,
        points: Number(form.points || 1),
        orderIndex: quiz.questions.length,
      });
      await refreshQuizByContent(contentId);
      setQuestionForm(contentId, defaultQuestionForm);
      setMessage('Questão criada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSubmit = async (event: React.FormEvent<HTMLFormElement>, contentId: string, questionId: string) => {
    event.preventDefault();
    const optionDrafts = getOptionDrafts(questionId)
      .map((draft) => ({
        optionText: draft.optionText.trim(),
        isCorrect: draft.isCorrect,
      }))
      .filter((draft) => draft.optionText.length > 0);

    if (optionDrafts.length === 0) {
      setMessage('Adicione pelo menos uma opção com texto antes de salvar.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await Promise.all(
        optionDrafts.map((draft) =>
          quizRepository.createQuestionOption(session.accessToken, {
            questionId,
            optionText: draft.optionText,
            isCorrect: draft.isCorrect,
          }),
        ),
      );
      await refreshQuizByContent(contentId);
      setOptionDrafts(questionId, [createOptionDraft()]);
      setMessage(optionDrafts.length > 1 ? 'Opções criadas com sucesso.' : 'Opção criada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="courses-hero">
        <div>
          <p className="eyebrow">Catálogo LMS</p>
          <h1>Gestão de cursos, módulos e conteúdos</h1>
          <p className="muted">
            {canManageCourses
              ? 'Crie a estrutura curricular do LMS, publique cursos e prepare conteúdo para quizzes, assignments e progresso.'
              : 'Explore o catálogo de cursos e acompanhe a estrutura de aprendizagem disponível.'}
          </p>
        </div>

        <div className="courses-hero__stats">
          <div className="metric-box">
            <strong>{courses.length}</strong>
            <span>Cursos</span>
          </div>
          <div className="metric-box metric-box--accent">
            <strong>{modules.length}</strong>
            <span>Módulos do curso</span>
          </div>
        </div>
      </section>

      {message ? <p className="info">{message}</p> : null}

      <section className="courses-layout">
        <aside className="panel courses-sidebar">
          <div className="courses-sidebar__header">
            <h2>Cursos</h2>
            <span className="muted">{loading ? 'Atualizando...' : 'Selecione um curso'}</span>
          </div>

          <div className="courses-list">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                className={`course-card ${selectedCourseId === course.id ? 'course-card--active' : ''}`}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <strong>{course.title}</strong>
                <small>{course.level} · {course.status}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="courses-main">
          {canManageCourses ? (
            <section className="panel">
              <div className="panel-header-inline">
                <div>
                  <h2>{editingCourseId ? 'Editar curso' : 'Novo curso'}</h2>
                  <p className="muted">Monte o catálogo e defina o estado do curso.</p>
                </div>
                {editingCourseId ? (
                  <button type="button" className="button button--ghost" onClick={resetCourseForm}>
                    Cancelar edição
                  </button>
                ) : null}
              </div>

              <form className="form courses-form" onSubmit={handleCourseSubmit}>
                <div className="courses-form__grid">
                  <label className="field">
                    <span>Título</span>
                    <input
                      value={courseForm.title}
                      onChange={(event) => setCourseForm((previous) => ({ ...previous, title: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Slug</span>
                    <input
                      value={courseForm.slug}
                      onChange={(event) => setCourseForm((previous) => ({ ...previous, slug: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Nível</span>
                    <select
                      value={courseForm.level}
                      onChange={(event) => setCourseForm((previous) => ({ ...previous, level: event.target.value as Course['level'] }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Preço</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={courseForm.price}
                      onChange={(event) => setCourseForm((previous) => ({ ...previous, price: event.target.value }))}
                    />
                  </label>

                  <label className="field courses-form__grid--full">
                    <span>Categoria</span>
                    <select
                      value={courseForm.categoryId}
                      onChange={(event) => setCourseForm((previous) => ({ ...previous, categoryId: event.target.value }))}
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field courses-form__grid--full">
                    <span>Descrição</span>
                    <textarea
                      rows={4}
                      value={courseForm.description}
                      onChange={(event) => setCourseForm((previous) => ({ ...previous, description: event.target.value }))}
                    />
                  </label>
                </div>

                <button type="submit" className="button" disabled={loading}>
                  {editingCourseId ? 'Salvar curso' : 'Criar curso'}
                </button>
              </form>
            </section>
          ) : null}

          <section className="panel">
            <div className="panel-header-inline">
              <div>
                <h2>{selectedCourse ? selectedCourse.title : 'Selecione um curso'}</h2>
                <p className="muted">
                  {selectedCourse
                    ? `${selectedCourse.level} · ${selectedCourse.status} · ${selectedCourse.slug}`
                    : 'Nenhum curso selecionado.'}
                </p>
              </div>

              {selectedCourse && canManageCourses ? (
                <div className="courses-actions">
                  <button type="button" className="button button--ghost" onClick={() => handleEditCourse(selectedCourse)}>
                    Editar curso
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => handleCourseStatus(selectedCourse.id, selectedCourse.status === 'published' ? 'archive' : 'publish')}
                    disabled={loading}
                  >
                    {selectedCourse.status === 'published' ? 'Arquivar' : 'Publicar'}
                  </button>
                </div>
              ) : null}
            </div>

            {selectedCourse?.description ? <p className="muted">{selectedCourse.description}</p> : null}

            {selectedCourse && canManageCourses ? (
              <form className="form courses-inline-form" onSubmit={handleModuleSubmit}>
                <h3>Novo módulo</h3>
                <div className="courses-inline-form__grid">
                  <label className="field">
                    <span>Título do módulo</span>
                    <input
                      value={moduleForm.title}
                      onChange={(event) => setModuleForm((previous) => ({ ...previous, title: event.target.value }))}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Descrição</span>
                    <input
                      value={moduleForm.description}
                      onChange={(event) => setModuleForm((previous) => ({ ...previous, description: event.target.value }))}
                    />
                  </label>
                </div>
                <button type="submit" className="button" disabled={loading}>
                  Criar módulo
                </button>
              </form>
            ) : null}

            <div className="modules-stack">
              {modules.map((module) => {
                const moduleContents = contentsByModule[module.id] ?? [];
                const contentForm = getContentForm(module.id);

                return (
                  <article key={module.id} className="module-card">
                    <div className="module-card__header">
                      <div>
                        <p className="eyebrow">Módulo {module.orderIndex + 1}</p>
                        <h3>{module.title}</h3>
                        {module.description ? <p className="muted">{module.description}</p> : null}
                      </div>
                      <span className="module-card__badge">{moduleContents.length} conteúdos</span>
                    </div>

                    <div className="content-list">
                      {moduleContents.map((content) => {
                        const quiz = quizzesByContent[content.id];
                        const quizForm = getQuizForm(content.id);
                        const questionForm = getQuestionForm(content.id);
                        const isEditingContent = editingContentId === content.id;
                        const editContentForm = getEditContentForm(content.id);

                        return (
                          <div key={content.id} className="content-row">
                            <div className="content-row__header">
                              <div>
                                <strong>{content.title}</strong>
                                <small>
                                  {content.type} · ordem {content.orderIndex + 1}
                                  {content.isFreePreview ? ' · preview livre' : ''}
                                </small>
                              </div>

                              {canManageCourses && content.type !== 'quiz' ? (
                                <button
                                  type="button"
                                  className="button button--ghost"
                                  onClick={() => handleStartContentEdit(content.id)}
                                  disabled={loading}
                                >
                                  Editar conteúdo
                                </button>
                              ) : null}
                            </div>

                            {canManageCourses && content.type !== 'quiz' && isEditingContent ? (
                              <form className="form content-edit-form" onSubmit={(event) => handleContentUpdate(event, module.id, content)}>
                                <div className="content-form__grid">
                                  <label className="field">
                                    <span>Título</span>
                                    <input
                                      value={editContentForm.title}
                                      onChange={(event) => setEditContentForm(content.id, { ...editContentForm, title: event.target.value })}
                                      required
                                    />
                                  </label>

                                  <label className="field">
                                    <span>Tipo</span>
                                    <input value={content.type} disabled />
                                  </label>

                                  <label className="field">
                                    <span>Preview livre</span>
                                    <select
                                      value={editContentForm.isFreePreview ? 'yes' : 'no'}
                                      onChange={(event) => setEditContentForm(content.id, {
                                        ...editContentForm,
                                        isFreePreview: event.target.value === 'yes',
                                      })}
                                    >
                                      <option value="no">Não</option>
                                      <option value="yes">Sim</option>
                                    </select>
                                  </label>

                                  {content.type === 'video' ? (
                                    <label className="field">
                                      <span>Duração (segundos)</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editContentForm.durationSeconds}
                                        onChange={(event) => setEditContentForm(content.id, { ...editContentForm, durationSeconds: event.target.value })}
                                      />
                                    </label>
                                  ) : null}
                                </div>

                                {content.type === 'text' ? (
                                  <label className="field">
                                    <span>Conteúdo em texto</span>
                                    <textarea
                                      rows={5}
                                      value={editContentForm.body}
                                      onChange={(event) => setEditContentForm(content.id, { ...editContentForm, body: event.target.value })}
                                    />
                                  </label>
                                ) : null}

                                {content.type === 'video' ? (
                                  <div className="content-form__grid">
                                    <label className="field">
                                      <span>URL do vídeo</span>
                                      <input
                                        value={editContentForm.videoUrl}
                                        onChange={(event) => setEditContentForm(content.id, { ...editContentForm, videoUrl: event.target.value })}
                                      />
                                    </label>

                                    <label className="field">
                                      <span>Duração do player (segundos)</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editContentForm.videoDurationSeconds}
                                        onChange={(event) => setEditContentForm(content.id, { ...editContentForm, videoDurationSeconds: event.target.value })}
                                      />
                                    </label>
                                  </div>
                                ) : null}

                                {content.type === 'pdf' ? (
                                  <div className="content-form__grid">
                                    <label className="field">
                                      <span>URL do arquivo</span>
                                      <input
                                        value={editContentForm.fileUrl}
                                        onChange={(event) => setEditContentForm(content.id, { ...editContentForm, fileUrl: event.target.value })}
                                      />
                                    </label>

                                    <label className="field">
                                      <span>Tamanho (bytes)</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editContentForm.fileSizeBytes}
                                        onChange={(event) => setEditContentForm(content.id, { ...editContentForm, fileSizeBytes: event.target.value })}
                                      />
                                    </label>
                                  </div>
                                ) : null}

                                <div className="content-edit-form__actions">
                                  <button type="submit" className="button" disabled={loading}>
                                    Salvar conteúdo
                                  </button>
                                  <button type="button" className="button button--ghost" onClick={handleCancelContentEdit} disabled={loading}>
                                    Cancelar
                                  </button>
                                </div>
                              </form>
                            ) : null}

                            {content.type === 'quiz' && canManageCourses ? (
                              <div className="quiz-builder-box">
                                <h4>Builder do quiz</h4>

                                {quiz ? (
                                  <div className="quiz-builder-summary">
                                    <strong>{quiz.totalQuestions} questão(ões) · {quiz.totalPoints} ponto(s)</strong>
                                    <small>
                                      Nota mínima {quiz.passingScorePercentage}% · {quiz.attemptsAllowed} tentativa(s)
                                    </small>
                                  </div>
                                ) : (
                                  <form className="form quiz-builder-form" onSubmit={(event) => handleQuizSubmit(event, content.id)}>
                                    <div className="quiz-builder-form__grid">
                                      <label className="field">
                                        <span>Nota mínima (%)</span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={quizForm.passingScorePercentage}
                                          onChange={(event) => setQuizForm(content.id, { ...quizForm, passingScorePercentage: event.target.value })}
                                        />
                                      </label>

                                      <label className="field">
                                        <span>Tentativas</span>
                                        <input
                                          type="number"
                                          min="1"
                                          value={quizForm.attemptsAllowed}
                                          onChange={(event) => setQuizForm(content.id, { ...quizForm, attemptsAllowed: event.target.value })}
                                        />
                                      </label>

                                      <label className="field">
                                        <span>Tempo limite (min)</span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={quizForm.timeLimitMinutes}
                                          onChange={(event) => setQuizForm(content.id, { ...quizForm, timeLimitMinutes: event.target.value })}
                                        />
                                      </label>

                                      <label className="field">
                                        <span>Embaralhar questões</span>
                                        <select
                                          value={quizForm.shuffleQuestions ? 'yes' : 'no'}
                                          onChange={(event) => setQuizForm(content.id, { ...quizForm, shuffleQuestions: event.target.value === 'yes' })}
                                        >
                                          <option value="no">Não</option>
                                          <option value="yes">Sim</option>
                                        </select>
                                      </label>
                                    </div>

                                    <button type="submit" className="button" disabled={loading}>
                                      Criar quiz
                                    </button>
                                  </form>
                                )}

                                {quiz ? (
                                  <>
                                    <form className="form quiz-builder-form" onSubmit={(event) => handleQuestionSubmit(event, content.id)}>
                                      <div className="quiz-builder-form__grid quiz-builder-form__grid--wide">
                                        <label className="field quiz-builder-form__grid--full">
                                          <span>Pergunta</span>
                                          <input
                                            value={questionForm.questionText}
                                            onChange={(event) => setQuestionForm(content.id, { ...questionForm, questionText: event.target.value })}
                                            required
                                          />
                                        </label>

                                        <label className="field">
                                          <span>Tipo</span>
                                          <select
                                            value={questionForm.type}
                                            onChange={(event) => setQuestionForm(content.id, { ...questionForm, type: event.target.value as Question['type'] })}
                                          >
                                            <option value="multiple_choice">Multiple choice</option>
                                            <option value="true_false">True/False</option>
                                            <option value="essay">Essay</option>
                                          </select>
                                        </label>

                                        <label className="field">
                                          <span>Pontos</span>
                                          <input
                                            type="number"
                                            min="1"
                                            value={questionForm.points}
                                            onChange={(event) => setQuestionForm(content.id, { ...questionForm, points: event.target.value })}
                                          />
                                        </label>
                                      </div>

                                      <button type="submit" className="button" disabled={loading}>
                                        Adicionar questão
                                      </button>
                                    </form>

                                    <div className="quiz-question-stack quiz-question-stack--builder">
                                      {quiz.questions.map((question) => {
                                        const optionDrafts = getOptionDrafts(question.id);

                                        return (
                                          <article key={question.id} className="quiz-question-card quiz-question-card--builder">
                                            <strong>{question.questionText}</strong>
                                            <small>{question.type} · {question.points} ponto(s)</small>

                                            <div className="quiz-option-chip-row">
                                              {(question.options ?? []).map((option) => (
                                                <span key={option.id} className={`quiz-option-chip ${option.isCorrect ? 'quiz-option-chip--correct' : ''}`}>
                                                  {option.optionText}
                                                </span>
                                              ))}
                                            </div>

                                            {question.type !== 'essay' ? (
                                              <form className="form quiz-option-form" onSubmit={(event) => handleOptionSubmit(event, content.id, question.id)}>
                                                <div className="quiz-option-draft-stack">
                                                  {optionDrafts.map((optionDraft, index) => (
                                                    <div key={`${question.id}-draft-${index}`} className="quiz-option-draft-row">
                                                      <div className="quiz-builder-form__grid">
                                                        <label className="field quiz-builder-form__grid--full">
                                                          <span>Nova opção {index + 1}</span>
                                                          <input
                                                            value={optionDraft.optionText}
                                                            onChange={(event) => handleOptionDraftChange(question.id, index, { optionText: event.target.value })}
                                                            required
                                                          />
                                                        </label>

                                                        <label className="field">
                                                          <span>Correta</span>
                                                          <select
                                                            value={optionDraft.isCorrect ? 'yes' : 'no'}
                                                            onChange={(event) => handleOptionDraftChange(question.id, index, { isCorrect: event.target.value === 'yes' })}
                                                          >
                                                            <option value="no">Não</option>
                                                            <option value="yes">Sim</option>
                                                          </select>
                                                        </label>
                                                      </div>

                                                      <button
                                                        type="button"
                                                        className="button button--ghost quiz-option-draft-remove"
                                                        onClick={() => handleRemoveOptionDraft(question.id, index)}
                                                        disabled={loading}
                                                      >
                                                        Remover
                                                      </button>
                                                    </div>
                                                  ))}
                                                </div>

                                                <button
                                                  type="button"
                                                  className="button button--ghost quiz-option-form__add"
                                                  onClick={() => handleAddOptionDraft(question.id)}
                                                  disabled={loading}
                                                >
                                                  + Adicionar outra opção
                                                </button>

                                                <button type="submit" className="button quiz-option-form__save" disabled={loading}>
                                                  Salvar opções
                                                </button>
                                              </form>
                                            ) : null}
                                          </article>
                                        );
                                      })}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {canManageCourses ? (
                      <form className="form content-form" onSubmit={(event) => handleContentSubmit(event, module.id)}>
                        <h4>Novo conteúdo</h4>
                        <div className="content-form__grid">
                          <label className="field">
                            <span>Título</span>
                            <input
                              value={contentForm.title}
                              onChange={(event) => setContentForm(module.id, { ...contentForm, title: event.target.value })}
                              required
                            />
                          </label>

                          <label className="field">
                            <span>Tipo</span>
                            <select
                              value={contentForm.type}
                              onChange={(event) => setContentForm(module.id, { ...contentForm, type: event.target.value as ContentType })}
                            >
                              <option value="text">Texto</option>
                              <option value="video">Vídeo</option>
                              <option value="pdf">PDF</option>
                              <option value="quiz">Quiz</option>
                              <option value="assignment">Assignment</option>
                            </select>
                          </label>

                          <label className="field">
                            <span>Preview livre</span>
                            <select
                              value={contentForm.isFreePreview ? 'yes' : 'no'}
                              onChange={(event) => setContentForm(module.id, {
                                ...contentForm,
                                isFreePreview: event.target.value === 'yes',
                              })}
                            >
                              <option value="no">Não</option>
                              <option value="yes">Sim</option>
                            </select>
                          </label>
                        </div>

                        {contentForm.type === 'text' ? (
                          <label className="field">
                            <span>Conteúdo em texto</span>
                            <textarea
                              rows={5}
                              value={contentForm.body}
                              onChange={(event) => setContentForm(module.id, { ...contentForm, body: event.target.value })}
                            />
                          </label>
                        ) : null}

                        {contentForm.type === 'video' ? (
                          <div className="content-form__grid">
                            <label className="field">
                              <span>URL do vídeo</span>
                              <input
                                value={contentForm.videoUrl}
                                onChange={(event) => setContentForm(module.id, { ...contentForm, videoUrl: event.target.value })}
                              />
                            </label>
                            <label className="field">
                              <span>Duração (segundos)</span>
                              <input
                                type="number"
                                min="0"
                                value={contentForm.videoDurationSeconds}
                                onChange={(event) => setContentForm(module.id, { ...contentForm, videoDurationSeconds: event.target.value })}
                              />
                            </label>
                          </div>
                        ) : null}

                        {contentForm.type === 'pdf' ? (
                          <div className="content-form__grid">
                            <label className="field">
                              <span>URL do arquivo</span>
                              <input
                                value={contentForm.fileUrl}
                                onChange={(event) => setContentForm(module.id, { ...contentForm, fileUrl: event.target.value })}
                              />
                            </label>
                            <label className="field">
                              <span>Tamanho (bytes)</span>
                              <input
                                type="number"
                                min="0"
                                value={contentForm.fileSizeBytes}
                                onChange={(event) => setContentForm(module.id, { ...contentForm, fileSizeBytes: event.target.value })}
                              />
                            </label>
                          </div>
                        ) : null}

                        <button type="submit" className="button" disabled={loading}>
                          Criar conteúdo
                        </button>
                      </form>
                    ) : null}
                  </article>
                );
              })}

              {selectedCourse && modules.length === 0 ? (
                <div className="empty-state">
                  <h3>Este curso ainda não possui módulos.</h3>
                  <p className="muted">Crie o primeiro módulo para começar a montar a trilha de aprendizagem.</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}