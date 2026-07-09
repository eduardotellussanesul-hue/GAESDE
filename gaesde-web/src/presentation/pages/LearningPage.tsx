import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AssignmentApiRepository } from '../../infrastructure/api/repositories/assignmentApiRepository';
import { CertificateApiRepository } from '../../infrastructure/api/repositories/certificateApiRepository';
import { ContentApiRepository } from '../../infrastructure/api/repositories/contentApiRepository';
import { CourseApiRepository } from '../../infrastructure/api/repositories/courseApiRepository';
import { EnrollmentApiRepository } from '../../infrastructure/api/repositories/enrollmentApiRepository';
import { ModuleApiRepository } from '../../infrastructure/api/repositories/moduleApiRepository';
import { QuizApiRepository } from '../../infrastructure/api/repositories/quizApiRepository';
import { ReviewApiRepository } from '../../infrastructure/api/repositories/reviewApiRepository';
import { askGeminiTutor } from '../../infrastructure/ai/geminiChat';
import type {
  AssignmentSubmission,
  Certificate,
  ContentItem,
  CourseCommunity,
  CourseCommunityMember,
  Course,
  Enrollment,
  FullAttemptResult,
  FullQuiz,
  ModuleItem,
  ProgressSnapshot,
  QuizAnswerInput,
  Review,
  ReviewStats,
} from '../../domain/entities/lms';
import { getErrorMessage } from '../utils/errorMessage';
import { env } from '../../core/config/env';

const assignmentRepository = new AssignmentApiRepository();
const certificateRepository = new CertificateApiRepository();
const contentRepository = new ContentApiRepository();
const courseRepository = new CourseApiRepository();
const enrollmentRepository = new EnrollmentApiRepository();
const moduleRepository = new ModuleApiRepository();
const quizRepository = new QuizApiRepository();
const reviewRepository = new ReviewApiRepository();

type AssignmentInputByContent = Record<string, string>;

type QuizAnswerValue = string | string[];
type QuizAnswerByQuestion = Record<string, QuizAnswerValue>;
type QuizAnswersByContent = Record<string, QuizAnswerByQuestion>;

const YOUTUBE_HOST_PATTERN = /(?:youtube\.com|youtu\.be)/i;

function toYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (!YOUTUBE_HOST_PATTERN.test(parsed.hostname)) {
      return null;
    }

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '').trim();
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    const videoId = parsed.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function LearningPage() {
  const { session } = useAuth();
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [myCertificates, setMyCertificates] = useState<Certificate[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [contentsByModule, setContentsByModule] = useState<Record<string, ContentItem[]>>({});
  const [quizzesByContent, setQuizzesByContent] = useState<Record<string, FullQuiz>>({});
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswersByContent>({});
  const [quizResults, setQuizResults] = useState<Record<string, FullAttemptResult>>({});
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [courseCommunity, setCourseCommunity] = useState<CourseCommunity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [assignmentInputs, setAssignmentInputs] = useState<AssignmentInputByContent>({});
  const [myAssignments, setMyAssignments] = useState<AssignmentSubmission[]>([]);
  const [contentReadyToComplete, setContentReadyToComplete] = useState<Record<string, boolean>>({});
  const [openedTextContents, setOpenedTextContents] = useState<Record<string, boolean>>({});
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Oi. Sou seu tutor virtual. Pergunte sobre o conteúdo do curso.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => publishedCourses.find((course) => course.id === selectedCourseId) ?? null,
    [publishedCourses, selectedCourseId],
  );

  const selectedEnrollment = useMemo(
    () => myEnrollments.find((enrollment) => enrollment.courseId === selectedCourseId) ?? null,
    [myEnrollments, selectedCourseId],
  );

  const selectedCertificates = useMemo(() => {
    if (!selectedEnrollment) {
      return [];
    }

    return myCertificates.filter((certificate) => certificate.enrollmentId === selectedEnrollment.id);
  }, [myCertificates, selectedEnrollment]);

  const classmateList = useMemo(() => {
    if (!courseCommunity) {
      return [];
    }

    return courseCommunity.students.filter((student: CourseCommunityMember) => student.id !== session?.user.id);
  }, [courseCommunity, session?.user.id]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const [coursesResult, enrollmentsResult, certificatesResult, assignmentsResult] = await Promise.all([
          courseRepository.listPublishedCourses(session.accessToken),
          enrollmentRepository.listMyEnrollments(session.accessToken),
          certificateRepository.listMyCertificates(session.accessToken),
          assignmentRepository.listMyAssignments(session.accessToken),
        ]);

        if (!mounted) {
          return;
        }

        setPublishedCourses(coursesResult);
        setMyEnrollments(enrollmentsResult);
        setMyCertificates(certificatesResult);
        setMyAssignments(assignmentsResult);

        const firstCourseId = enrollmentsResult[0]?.courseId ?? coursesResult[0]?.id ?? '';
        setSelectedCourseId(firstCourseId);
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
    setContentReadyToComplete({});
    setOpenedTextContents({});
  }, [selectedCourseId]);

  useEffect(() => {
    if (!session || !selectedCourseId) {
      setModules([]);
      setContentsByModule({});
      setQuizzesByContent({});
      setProgress(null);
      setCourseCommunity(null);
      setReviews([]);
      setReviewStats(null);
      return;
    }

    let mounted = true;

    const loadCourseData = async () => {
      setLoading(true);

      try {
        const [modulesResult, reviewsResult, reviewStatsResult, progressResult] = await Promise.all([
          moduleRepository.listModulesByCourse(session.accessToken, selectedCourseId),
          reviewRepository.listCourseReviews(session.accessToken, selectedCourseId),
          reviewRepository.getCourseReviewStats(session.accessToken, selectedCourseId),
          selectedEnrollment
            ? enrollmentRepository.getCourseProgress(session.accessToken, selectedCourseId)
            : Promise.resolve(null),
        ]);

        const communityResult = (selectedEnrollment || session.isAdmin || session.isInstructor)
          ? await enrollmentRepository.getCourseCommunity(session.accessToken, selectedCourseId)
          : null;

        const contentEntries = await Promise.all(
          modulesResult.map(async (module) => {
            const moduleContents = await contentRepository.listContentsByModule(session.accessToken, module.id);

            const detailedContents = await Promise.all(
              moduleContents.map(async (content) => {
                if (content.type === 'text' || content.type === 'video' || content.type === 'pdf') {
                  try {
                    return await contentRepository.getFullContent(session.accessToken, content.id);
                  } catch {
                    return content;
                  }
                }

                return content;
              }),
            );

            return [module.id, detailedContents] as const;
          }),
        );

        const allContents = contentEntries.flatMap((entry) => entry[1]);
        const quizEntries = await Promise.all(
          allContents
            .filter((content) => content.type === 'quiz')
            .map(async (content) => [content.id, await quizRepository.getFullQuizByContent(session.accessToken, content.id)] as const),
        );

        const quizMapEntries = quizEntries
          .filter((entry): entry is readonly [string, FullQuiz] => Boolean(entry[1]))
          .map(([contentId, quiz]) => [contentId, quiz] as const);

        const attempts = await quizRepository.listMyQuizAttempts(session.accessToken);
        const latestAttemptByContent = new Map<string, string>();

        for (const [contentId, quiz] of quizMapEntries) {
          const attemptForQuiz = attempts
            .filter((attempt) => attempt.quizId === quiz.id && attempt.status === 'finished')
            .sort((a, b) => {
              const aTime = Date.parse(a.submittedAt ?? a.startedAt ?? '');
              const bTime = Date.parse(b.submittedAt ?? b.startedAt ?? '');
              return bTime - aTime;
            })[0];

          if (attemptForQuiz) {
            latestAttemptByContent.set(contentId, attemptForQuiz.id);
          }
        }

        const attemptResults = await Promise.all(
          Array.from(latestAttemptByContent.entries()).map(async ([contentId, attemptId]) => {
            const result = await quizRepository.getQuizAttemptResults(session.accessToken, attemptId);
            return [contentId, result] as const;
          }),
        );

        if (!mounted) {
          return;
        }

        setModules(modulesResult);
        setContentsByModule(Object.fromEntries(contentEntries));
        setQuizzesByContent(
          Object.fromEntries(
            quizMapEntries,
          ),
        );
        setQuizResults(Object.fromEntries(attemptResults));
        setReviews(reviewsResult);
        setReviewStats(reviewStatsResult);
        setProgress(progressResult);
        setCourseCommunity(communityResult);
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

    loadCourseData();

    return () => {
      mounted = false;
    };
  }, [session, selectedCourseId, selectedEnrollment]);

  if (!session) {
    return null;
  }

  const isStudentView = !session.isAdmin && !session.isInstructor;
  const currentProgressPercentage = progress?.progressPercentage ?? selectedEnrollment?.progressPercentage ?? 0;
  const canGenerateCourseCertificate = Boolean(selectedEnrollment && (selectedEnrollment.isCompleted || currentProgressPercentage >= 100));

  const refreshLearningState = async (preferredCourseId = selectedCourseId) => {
    const [enrollmentsResult, certificatesResult, assignmentsResult] = await Promise.all([
      enrollmentRepository.listMyEnrollments(session.accessToken),
      certificateRepository.listMyCertificates(session.accessToken),
      assignmentRepository.listMyAssignments(session.accessToken),
    ]);

    setMyEnrollments(enrollmentsResult);
    setMyCertificates(certificatesResult);
    setMyAssignments(assignmentsResult);

    if (preferredCourseId) {
      setSelectedCourseId(preferredCourseId);
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await enrollmentRepository.enrollSelf(session.accessToken, selectedCourse.id);
      await refreshLearningState(selectedCourse.id);
      setMessage('Matrícula realizada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const refreshEnrollmentProgress = async () => {
    if (!selectedCourseId || !selectedEnrollment) {
      return;
    }

    const [progressResult, enrollmentResult] = await Promise.all([
      enrollmentRepository.getCourseProgress(session.accessToken, selectedCourseId),
      enrollmentRepository.updateEnrollmentProgress(session.accessToken, selectedEnrollment.id),
    ]);

    setProgress(progressResult);
    setMyEnrollments((previous) => previous.map((item) => (item.id === enrollmentResult.id ? enrollmentResult : item)));
  };

  const completeContentAndRefresh = async (contentId: string) => {
    if (!selectedCourseId || !selectedEnrollment) {
      return;
    }

    try {
      await enrollmentRepository.completeContent(session.accessToken, contentId);
    } catch (error) {
      const errorMessage = getErrorMessage(error).toLowerCase();
      if (!errorMessage.includes('already completed') && !errorMessage.includes('já concluído')) {
        throw error;
      }
    }

    await refreshEnrollmentProgress();
  };

  const handleCompleteContent = async (contentId: string) => {
    if (!selectedCourseId || !selectedEnrollment) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await completeContentAndRefresh(contentId);
      setMessage('Conteúdo marcado como concluído.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const markContentReady = (contentId: string) => {
    setContentReadyToComplete((previous) => (
      previous[contentId]
        ? previous
        : {
            ...previous,
            [contentId]: true,
          }
    ));
  };

  const handleMarkAsRead = (contentId: string, mode: 'text' | 'media') => {
    markContentReady(contentId);
    setMessage(mode === 'text'
      ? 'Leitura registrada. Agora clique em "Marcar concluído".'
      : 'Visualização registrada. Agora clique em "Marcar concluído".');
  };

  const handleToggleContentPreview = (contentId: string) => {
    setOpenedTextContents((previous) => ({
      ...previous,
      [contentId]: !previous[contentId],
    }));
  };

  const handleCompleteCourse = async () => {
    if (!selectedEnrollment) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const completed = await enrollmentRepository.completeEnrollment(session.accessToken, selectedEnrollment.id);
      setMyEnrollments((previous) => previous.map((item) => (item.id === completed.id ? completed : item)));
      setMessage('Curso marcado como concluído.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizTextChange = (contentId: string, questionId: string, value: string) => {
    setQuizAnswers((previous) => ({
      ...previous,
      [contentId]: {
        ...(previous[contentId] ?? {}),
        [questionId]: value,
      },
    }));
  };

  const handleQuizSingleOptionChange = (contentId: string, questionId: string, optionId: string) => {
    setQuizAnswers((previous) => ({
      ...previous,
      [contentId]: {
        ...(previous[contentId] ?? {}),
        [questionId]: optionId,
      },
    }));
  };

  const handleQuizMultipleOptionToggle = (contentId: string, questionId: string, optionId: string, checked: boolean) => {
    setQuizAnswers((previous) => {
      const previousValue = previous[contentId]?.[questionId];
      const selectedOptions = Array.isArray(previousValue)
        ? previousValue
        : typeof previousValue === 'string' && previousValue
          ? [previousValue]
          : [];

      const nextSelectedOptions = checked
        ? Array.from(new Set([...selectedOptions, optionId]))
        : selectedOptions.filter((selected) => selected !== optionId);

      return {
        ...previous,
        [contentId]: {
          ...(previous[contentId] ?? {}),
          [questionId]: nextSelectedOptions,
        },
      };
    });
  };

  const handleQuizSubmit = async (contentId: string) => {
    const quiz = quizzesByContent[contentId];
    if (!quiz) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const started = await quizRepository.startQuizAttempt(session.accessToken, quiz.id);
      const answerMap = quizAnswers[contentId] ?? {};
      const answers: QuizAnswerInput[] = quiz.questions.map((question) => {
        const value = answerMap[question.id];
        if (question.type === 'essay') {
          return {
            questionId: question.id,
            textResponse: typeof value === 'string' ? value : '',
          };
        }

        if (question.type === 'multiple_choice') {
          const selectedOptionIds = Array.isArray(value)
            ? value
            : typeof value === 'string' && value
              ? [value]
              : [];

          return {
            questionId: question.id,
            selectedOptionIds,
            selectedOptionId: selectedOptionIds[0],
          };
        }

        return {
          questionId: question.id,
          selectedOptionId: typeof value === 'string' ? value : '',
        };
      });

      await quizRepository.submitQuizAttempt(session.accessToken, started.id, answers);
      const fullResult = await quizRepository.getQuizAttemptResults(session.accessToken, started.id);
      setQuizResults((previous) => ({
        ...previous,
        [contentId]: fullResult,
      }));

      if (selectedEnrollment) {
        await completeContentAndRefresh(contentId);
      }

      setMessage('Quiz enviado com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (contentId: string) => {
    const fileUrl = assignmentInputs[contentId];
    if (!fileUrl) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const submission = await assignmentRepository.submitAssignment(session.accessToken, contentId, fileUrl);
      setMyAssignments((previous) => [submission, ...previous.filter((item) => item.id !== submission.id)]);
      setAssignmentInputs((previous) => ({
        ...previous,
        [contentId]: '',
      }));

      if (selectedEnrollment) {
        await completeContentAndRefresh(contentId);
      }

      setMessage('Atividade enviada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await reviewRepository.createReview(
        session.accessToken,
        selectedCourse.id,
        Number(reviewForm.rating),
        reviewForm.comment || undefined,
      );

      const [reviewsResult, statsResult] = await Promise.all([
        reviewRepository.listCourseReviews(session.accessToken, selectedCourse.id),
        reviewRepository.getCourseReviewStats(session.accessToken, selectedCourse.id),
      ]);

      setReviews(reviewsResult);
      setReviewStats(statsResult);
      setReviewForm({ rating: '5', comment: '' });
      setMessage('Avaliação enviada com sucesso.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCertificate = async () => {
    if (!selectedEnrollment) {
      return;
    }

    setCertificateLoading(true);
    setMessage(null);

    try {
      let enrollmentForCertificate = selectedEnrollment;

      if (!enrollmentForCertificate.isCompleted) {
        if ((progress?.progressPercentage ?? 0) < 100) {
          throw new Error('Conclua 100% do curso para emitir o certificado.');
        }

        const completedEnrollment = await enrollmentRepository.completeEnrollment(session.accessToken, enrollmentForCertificate.id);
        enrollmentForCertificate = completedEnrollment;
        setMyEnrollments((previous) => previous.map((item) => (item.id === completedEnrollment.id ? completedEnrollment : item)));
      }

      let certificate = myCertificates.find((item) => item.enrollmentId === enrollmentForCertificate.id) ?? null;

      if (!certificate) {
        try {
          certificate = await certificateRepository.generateMyCertificate(session.accessToken, enrollmentForCertificate.id);
        } catch (error) {
          const errorMessage = getErrorMessage(error).toLowerCase();
          if (!errorMessage.includes('already exists') && !errorMessage.includes('já existe')) {
            throw error;
          }

          const updatedCertificates = await certificateRepository.listMyCertificates(session.accessToken);
          setMyCertificates(updatedCertificates);
          certificate = updatedCertificates.find((item) => item.enrollmentId === enrollmentForCertificate.id) ?? null;
        }
      }

      if (!certificate) {
        throw new Error('Não foi possível carregar o certificado deste curso.');
      }

      setMyCertificates((previous) => (
        previous.some((item) => item.id === certificate.id) ? previous : [certificate, ...previous]
      ));
      setActiveCertificate(certificate);
      setIsCertificateModalOpen(true);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setCertificateLoading(false);
    }
  };

  const ensureFreshCertificate = async (certificate: Certificate): Promise<Certificate> => {
    if (!selectedEnrollment) {
      return certificate;
    }

    const freshCertificate = await certificateRepository.regenerateMyCertificate(session.accessToken, selectedEnrollment.id);
    setMyCertificates((previous) => {
      const withoutOld = previous.filter((item) => item.id !== certificate.id && item.enrollmentId !== freshCertificate.enrollmentId);
      return [freshCertificate, ...withoutOld];
    });
    setActiveCertificate(freshCertificate);
    return freshCertificate;
  };

  const openCertificateInNewTab = (certificate: Certificate) => {
    window.open(certificate.certificateUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenCertificateLink = async () => {
    if (!activeCertificate) {
      return;
    }

    setCertificateLoading(true);
    setMessage(null);

    try {
      let certificateToOpen = activeCertificate;
      let response = await fetch(certificateToOpen.certificateUrl, { method: 'GET' });

      if (!response.ok && [401, 403, 404].includes(response.status)) {
        certificateToOpen = await ensureFreshCertificate(certificateToOpen);
        response = await fetch(certificateToOpen.certificateUrl, { method: 'GET' });
      }

      if (!response.ok) {
        throw new Error('Falha ao abrir certificado.');
      }

      openCertificateInNewTab(certificateToOpen);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!activeCertificate) {
      return;
    }

    setCertificateLoading(true);
    setMessage(null);

    try {
      let certificateToDownload = activeCertificate;
      let response = await fetch(certificateToDownload.certificateUrl);

      if (!response.ok && [401, 403, 404].includes(response.status)) {
        certificateToDownload = await ensureFreshCertificate(certificateToDownload);
        response = await fetch(certificateToDownload.certificateUrl);
      }

      if (!response.ok) {
        throw new Error('Falha ao baixar PDF do certificado.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      const certificateSlug = selectedCourse?.slug ?? certificateToDownload.verificationCode;
      downloadLink.href = objectUrl;
      downloadLink.download = `certificado-${certificateSlug}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = chatInput.trim();
    if (!trimmedInput || chatLoading) {
      return;
    }

    const nextHistory = [...chatMessages, { role: 'user' as const, text: trimmedInput }];

    setChatMessages(nextHistory);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const assistantReply = await askGeminiTutor({
        userMessage: trimmedInput,
        history: nextHistory,
        context: {
          studentName: session.user.name,
          courseTitle: selectedCourse?.title,
          progressPercentage: currentProgressPercentage,
        },
      });

      setChatMessages((previous) => [...previous, { role: 'assistant', text: assistantReply }]);
    } catch (error) {
      setChatError(getErrorMessage(error));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="learning-hero">
        <div>
          <p className="eyebrow">Aprendizado</p>
          <h1>Cursos, progresso, quizzes e certificados</h1>
          <p className="muted">
            Acompanhe sua jornada no LMS, conclua conteúdos, envie atividades e registre avaliações do curso.
          </p>
        </div>

        <div className="learning-hero__stats">
          <div className="metric-box">
            <strong>{myEnrollments.length}</strong>
            <span>Matrículas</span>
          </div>
          <div className="metric-box metric-box--accent">
            <strong>{myCertificates.length}</strong>
            <span>Certificados</span>
          </div>
        </div>
      </section>

      {message ? <p className="info">{message}</p> : null}

      <section className={`learning-layout ${isStudentView ? 'learning-layout--student' : ''}`}>
        <aside className="panel learning-sidebar">
          <h2>Catálogo disponível</h2>
          <div className="learning-courses">
            {publishedCourses.map((course) => {
              const isEnrolled = myEnrollments.some((enrollment) => enrollment.courseId === course.id);
              return (
                <button
                  key={course.id}
                  type="button"
                  className={`learning-course-card ${selectedCourseId === course.id ? 'learning-course-card--active' : ''}`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <strong>{course.title}</strong>
                  <small>{course.level} · {isEnrolled ? 'matriculado' : 'disponível'}</small>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="learning-main">
          <section className="panel">
            <div className="panel-header-inline">
              <div>
                <h2>{selectedCourse?.title ?? 'Selecione um curso'}</h2>
                <p className="muted">
                  {selectedEnrollment
                    ? `Status: ${selectedEnrollment.status} · Progresso: ${selectedEnrollment.progressPercentage}%`
                    : 'Você ainda não está matriculado neste curso.'}
                </p>
              </div>

              {selectedCourse && !selectedEnrollment ? (
                <button type="button" className="button" onClick={handleEnroll} disabled={loading}>
                  Matricular-se
                </button>
              ) : null}
            </div>

            {selectedCourse?.description ? <p className="muted">{selectedCourse.description}</p> : null}

            {progress ? (
              <div className="learning-progress-box">
                <div className="learning-progress-box__bar">
                  <span style={{ width: `${progress.progressPercentage}%` }} />
                </div>
                <p className="muted">
                  {progress.completedContents} de {progress.totalContents} conteúdos concluídos.
                </p>
                {progress.progressPercentage === 100 && selectedEnrollment && !selectedEnrollment.isCompleted ? (
                  <button type="button" className="button" onClick={handleCompleteCourse} disabled={loading}>
                    Concluir curso
                  </button>
                ) : null}

                {canGenerateCourseCertificate ? (
                  <button
                    type="button"
                    className="button button--ghost learning-certificate-trigger"
                    onClick={handleOpenCertificate}
                    disabled={certificateLoading}
                  >
                    <span className="learning-certificate-trigger__icon" aria-hidden="true" />
                    Certificado
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="panel">
            <h2>Trilha do curso</h2>
            <div className="modules-stack">
              {modules.map((module) => {
                const moduleContents = contentsByModule[module.id] ?? [];
                const completedModuleContents = moduleContents.filter((item) => progress?.completedContentIds.includes(item.id)).length;
                const moduleProgressPercentage = moduleContents.length
                  ? Math.round((completedModuleContents / moduleContents.length) * 100)
                  : 0;

                return (
                  <article key={module.id} className="module-card">
                    <div className="module-card__header">
                      <div>
                        <p className="eyebrow">Módulo {module.orderIndex + 1}</p>
                        <h3>{module.title}</h3>
                        {module.description ? <p className="muted">{module.description}</p> : null}
                      </div>

                      {selectedEnrollment ? (
                        <div className="learning-module-progress" aria-label={`Progresso do módulo ${module.title}`}>
                          <strong>{completedModuleContents}/{moduleContents.length}</strong>
                          <small>{moduleProgressPercentage}% concluído</small>
                          <div className="learning-module-progress__bar" role="presentation">
                            <span style={{ width: `${moduleProgressPercentage}%` }} />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="learning-content-stack">
                      {moduleContents.map((content) => {
                        const quiz = quizzesByContent[content.id];
                        const attemptResult = quizResults[content.id];
                        const assignment = myAssignments.find((item) => item.contentId === content.id);
                        const isCompleted = progress?.completedContentIds.includes(content.id) ?? false;
                        const shouldShowConsumptionStatus = content.type === 'text' || content.type === 'video' || content.type === 'pdf';
                        const isReadyForCompletion = isCompleted || !shouldShowConsumptionStatus || Boolean(contentReadyToComplete[content.id]);
                        const isContentPreviewOpened = Boolean(openedTextContents[content.id]);
                        const videoUrl = content.video?.videoUrl ?? '';
                        const youtubeEmbedUrl = videoUrl ? toYouTubeEmbedUrl(videoUrl) : null;
                        const isContentMarked = Boolean(contentReadyToComplete[content.id]);
                        const shouldHideQuizForm = Boolean(selectedEnrollment?.isCompleted && attemptResult);

                        const completionStatusLabel = content.type === 'text'
                          ? 'Leitura finalizada'
                          : content.type === 'video'
                            ? 'Visualizacao finalizada'
                            : 'PDF finalizado';

                        return (
                          <div key={content.id} className="learning-content-card">
                            <div className="learning-content-card__header">
                              <div>
                                <strong>{content.title}</strong>
                                <small>
                                  {content.type} · ordem {content.orderIndex + 1}
                                  {content.isFreePreview ? ' · preview livre' : ''}
                                </small>
                              </div>
                              {selectedEnrollment ? (
                                <button
                                  type="button"
                                  className="button"
                                  onClick={() => handleCompleteContent(content.id)}
                                  disabled={loading || !isReadyForCompletion}
                                >
                                  {isCompleted ? 'Concluído' : 'Marcar concluído'}
                                </button>
                              ) : null}
                            </div>

                            {content.type === 'text' ? (
                              <div className="learning-text-box">
                                {content.text?.body ? (
                                  <pre className="learning-rich-preview">{content.text.body}</pre>
                                ) : (
                                  <p className="muted">Texto sem conteúdo cadastrado.</p>
                                )}

                                {selectedEnrollment && !isCompleted ? (
                                  <button
                                    type="button"
                                    className="button button--ghost"
                                    onClick={() => handleMarkAsRead(content.id, 'text')}
                                    disabled={loading || isContentMarked}
                                  >
                                    {isContentMarked ? 'Lido' : 'Marcar como lido'}
                                  </button>
                                ) : null}
                              </div>
                            ) : null}

                            {content.type === 'video' ? (
                              <div className="learning-text-box">
                                <button
                                  type="button"
                                  className="button button--ghost"
                                  onClick={() => handleToggleContentPreview(content.id)}
                                >
                                  {isContentPreviewOpened ? 'Ocultar visualização' : 'Visualizar conteúdo'}
                                </button>

                                {isContentPreviewOpened ? (
                                  <div className="learning-content-preview">
                                    {youtubeEmbedUrl ? (
                                      <iframe
                                        className="learning-video-frame"
                                        src={youtubeEmbedUrl}
                                        title={content.title}
                                        loading="lazy"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                      />
                                    ) : videoUrl ? (
                                      <video className="learning-video-frame" controls src={videoUrl}>
                                        Seu navegador não suporta reprodução de vídeo.
                                      </video>
                                    ) : (
                                      <p className="muted">Vídeo sem URL cadastrada.</p>
                                    )}

                                    {selectedEnrollment && !isCompleted ? (
                                      <button
                                        type="button"
                                        className="button button--ghost"
                                        onClick={() => handleMarkAsRead(content.id, 'media')}
                                        disabled={loading || isContentMarked}
                                      >
                                        {isContentMarked ? 'Visualizado' : 'Marcar como visualizado'}
                                      </button>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}

                            {content.type === 'pdf' ? (
                              <div className="learning-text-box">
                                <button
                                  type="button"
                                  className="button button--ghost"
                                  onClick={() => handleToggleContentPreview(content.id)}
                                >
                                  {isContentPreviewOpened ? 'Ocultar visualização' : 'Visualizar conteúdo'}
                                </button>

                                {isContentPreviewOpened ? (
                                  <div className="learning-content-preview">
                                    {content.pdf?.fileUrl ? (
                                      <>
                                        <iframe
                                          className="learning-pdf-frame"
                                          src={content.pdf.fileUrl}
                                          title={content.title}
                                          loading="lazy"
                                        />
                                        <a className="button button--ghost" href={content.pdf.fileUrl} target="_blank" rel="noreferrer">
                                          Abrir PDF em nova guia
                                        </a>
                                      </>
                                    ) : (
                                      <p className="muted">PDF sem URL cadastrada.</p>
                                    )}

                                    {selectedEnrollment && !isCompleted ? (
                                      <button
                                        type="button"
                                        className="button button--ghost"
                                        onClick={() => handleMarkAsRead(content.id, 'media')}
                                        disabled={loading || isContentMarked}
                                      >
                                        {isContentMarked ? 'Visualizado' : 'Marcar como visualizado'}
                                      </button>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}

                            {shouldShowConsumptionStatus && selectedEnrollment ? (
                              <p
                                className={`learning-content-status ${
                                  isCompleted
                                    ? 'learning-content-status--done'
                                    : isReadyForCompletion
                                      ? 'learning-content-status--ready'
                                      : 'learning-content-status--pending'
                                }`}
                              >
                                {isCompleted
                                  ? completionStatusLabel
                                  : isReadyForCompletion
                                    ? 'Pronto para concluir'
                                    : content.type === 'text'
                                      ? 'Leia o texto e clique em "Marcar como lido".'
                                      : 'Visualize e clique em "Marcar como visualizado".'}
                              </p>
                            ) : null}

                            {quiz ? (
                              <div className="learning-quiz-box">
                                <h4>Quiz</h4>
                                {!shouldHideQuizForm ? (
                                  <>
                                    <div className="quiz-question-stack">
                                      {quiz.questions.map((question) => (
                                        <fieldset key={question.id} className="quiz-question-card">
                                          <legend>{question.questionText}</legend>

                                          {question.type === 'essay' ? (
                                            <textarea
                                              rows={4}
                                              value={typeof quizAnswers[content.id]?.[question.id] === 'string' ? quizAnswers[content.id]?.[question.id] : ''}
                                              onChange={(event) => handleQuizTextChange(content.id, question.id, event.target.value)}
                                            />
                                          ) : question.type === 'multiple_choice' ? (
                                            <div className="quiz-option-stack">
                                              {(question.options ?? []).map((option) => {
                                                const currentValue = quizAnswers[content.id]?.[question.id];
                                                const selectedOptions = Array.isArray(currentValue)
                                                  ? currentValue
                                                  : typeof currentValue === 'string' && currentValue
                                                    ? [currentValue]
                                                    : [];

                                                return (
                                                  <label key={option.id} className="quiz-option-row">
                                                    <input
                                                      type="checkbox"
                                                      value={option.id}
                                                      checked={selectedOptions.includes(option.id)}
                                                      onChange={(event) => handleQuizMultipleOptionToggle(content.id, question.id, option.id, event.target.checked)}
                                                    />
                                                    <span>{option.optionText}</span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <div className="quiz-option-stack">
                                              {(question.options ?? []).map((option) => (
                                                <label key={option.id} className="quiz-option-row">
                                                  <input
                                                    type="radio"
                                                    name={`${content.id}-${question.id}`}
                                                    value={option.id}
                                                    checked={quizAnswers[content.id]?.[question.id] === option.id}
                                                    onChange={(event) => handleQuizSingleOptionChange(content.id, question.id, event.target.value)}
                                                  />
                                                  <span>{option.optionText}</span>
                                                </label>
                                              ))}
                                            </div>
                                          )}
                                        </fieldset>
                                      ))}
                                    </div>

                                    <button type="button" className="button" onClick={() => handleQuizSubmit(content.id)} disabled={loading}>
                                      Enviar quiz
                                    </button>
                                  </>
                                ) : null}

                                {attemptResult ? (
                                  <div className="quiz-result-box">
                                    <strong>
                                      Resultado: {attemptResult.attempt.totalScore ?? 0}% · {attemptResult.attempt.isPassed ? 'Aprovado' : 'Reprovado'}
                                    </strong>

                                    <div className="quiz-review-stack">
                                      {attemptResult.answers.map((answer) => {
                                        const selectedOptionIdSet = new Set(answer.selectedOptionIds);

                                        return (
                                          <article key={answer.questionId} className="quiz-review-card">
                                            <strong>{answer.questionText}</strong>

                                            <div className="quiz-review-options">
                                              {answer.options.map((option) => {
                                                const isSelected = selectedOptionIdSet.has(option.id) || answer.selectedOptionId === option.id;

                                                return (
                                                  <div
                                                    key={option.id}
                                                    className={`quiz-review-option ${
                                                      option.isCorrect
                                                        ? 'quiz-review-option--correct'
                                                        : isSelected
                                                          ? 'quiz-review-option--selected'
                                                          : ''
                                                    }`}
                                                  >
                                                    <span>{option.text}</span>
                                                    <small>
                                                      {option.isCorrect
                                                        ? 'Correta'
                                                        : isSelected
                                                          ? 'Sua resposta'
                                                          : 'Alternativa'}
                                                    </small>
                                                  </div>
                                                );
                                              })}
                                            </div>

                                            {answer.textResponse ? (
                                              <p className="muted">Resposta enviada: {answer.textResponse}</p>
                                            ) : null}
                                          </article>
                                        );
                                      })}
                                    </div>

                                  </div>
                                ) : null}
                              </div>
                            ) : null}

                            {content.type === 'assignment' ? (
                              <div className="learning-assignment-box">
                                <label className="field">
                                  <span>URL da entrega</span>
                                  <input
                                    value={assignmentInputs[content.id] ?? ''}
                                    onChange={(event) => setAssignmentInputs((previous) => ({
                                      ...previous,
                                      [content.id]: event.target.value,
                                    }))}
                                    placeholder="https://..."
                                  />
                                </label>
                                <button type="button" className="button" onClick={() => handleAssignmentSubmit(content.id)} disabled={loading}>
                                  Enviar atividade
                                </button>
                                {assignment ? (
                                  <p className="muted">
                                    Entrega registrada{assignment.grade !== null && assignment.grade !== undefined ? ` · nota ${assignment.grade}` : ''}.
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {isStudentView ? (
            <section className="panel learning-classroom-panel">
              <h2>Professor e turma</h2>

              {courseCommunity?.instructor ? (
                <article className="learning-community-card">
                  <p className="eyebrow">Professor</p>
                  <strong>{courseCommunity.instructor.name}</strong>
                  <small>{courseCommunity.instructor.email}</small>
                </article>
              ) : (
                <p className="muted">Professor não encontrado para este curso.</p>
              )}

              <div className="learning-community-students">
                <div className="panel-header-inline">
                  <h3>Alunos da turma</h3>
                  <span className="muted">{classmateList.length} colega(s)</span>
                </div>

                {classmateList.length === 0 ? (
                  <p className="muted">Nenhum outro aluno matriculado ainda.</p>
                ) : (
                  classmateList.map((student: CourseCommunityMember) => (
                    <article key={student.id} className="learning-community-card">
                      <strong>{student.name}</strong>
                      <small>{student.email}</small>
                    </article>
                  ))
                )}
              </div>
            </section>
          ) : null}

          {!isStudentView && selectedEnrollment ? (
            <section className="panel learning-feedback-grid">
                  <div>
                    <h2>Avaliações</h2>
                    <p className="muted">
                      Média atual: {reviewStats?.average ?? 0} · total de reviews: {reviewStats?.totalReviews ?? 0}
                    </p>

                    <form className="form" onSubmit={handleReviewSubmit}>
                      <label className="field">
                        <span>Nota</span>
                        <select
                          value={reviewForm.rating}
                          onChange={(event) => setReviewForm((previous) => ({ ...previous, rating: event.target.value }))}
                        >
                          <option value="5">5</option>
                          <option value="4">4</option>
                          <option value="3">3</option>
                          <option value="2">2</option>
                          <option value="1">1</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Comentário</span>
                        <textarea
                          rows={4}
                          value={reviewForm.comment}
                          onChange={(event) => setReviewForm((previous) => ({ ...previous, comment: event.target.value }))}
                        />
                      </label>

                      <button type="submit" className="button" disabled={loading}>
                        Enviar avaliação
                      </button>
                    </form>
                  </div>

                  <div>
                    <h2>Certificados</h2>
                    <div className="certificate-stack">
                      {selectedCertificates.length === 0 ? (
                        <p className="muted">Nenhum certificado emitido para este curso ainda.</p>
                      ) : (
                        selectedCertificates.map((certificate) => (
                          <article key={certificate.id} className="certificate-card">
                            <strong>{certificate.verificationCode}</strong>
                            <a href={certificate.certificateUrl} target="_blank" rel="noreferrer">
                              Abrir certificado
                            </a>
                          </article>
                        ))
                      )}
                    </div>

                    <div className="reviews-stack">
                      {reviews.map((review) => (
                        <article key={review.id} className="review-card">
                          <strong>{review.rating}/5</strong>
                          <p>{review.comment || 'Sem comentário.'}</p>
                        </article>
                      ))}
                    </div>
                  </div>
            </section>
          ) : null}
        </div>

        {isStudentView ? (
          <aside className="panel learning-chat-sidebar learning-ai-chat-panel">
            <div className="panel-header-inline">
              <h2>Tutor IA </h2>
              <small className="muted">
                {env.geminiApiKey ? 'Online' : 'Configure VITE_GEMINI_API_KEY'}
              </small>
            </div>

            <div className="learning-ai-chat__messages" aria-live="polite">
              {chatMessages.map((item, index) => (
                <article
                  key={`${item.role}-${index}`}
                  className={`learning-ai-chat__bubble learning-ai-chat__bubble--${item.role}`}
                >
                  <strong>{item.role === 'assistant' ? 'Tutor' : 'Você'}</strong>
                  <p>{item.text}</p>
                </article>
              ))}

              {chatLoading ? (
                <p className="muted">Tutor está digitando...</p>
              ) : null}
            </div>

            {chatError ? <p className="learning-ai-chat__error">{chatError}</p> : null}

            <form className="learning-ai-chat__form" onSubmit={handleChatSubmit}>
              <textarea
                rows={3}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ex.: Me explique o conceito de polimorfismo."
              />
              <button type="submit" className="button" disabled={chatLoading || !chatInput.trim() || !env.geminiApiKey}>
                Enviar
              </button>
            </form>
          </aside>
        ) : null}
      </section>

      {isCertificateModalOpen && activeCertificate ? (
        <div className="learning-certificate-modal__overlay" role="presentation" onClick={() => setIsCertificateModalOpen(false)}>
          <section
            className="learning-certificate-modal__card"
            role="dialog"
            aria-modal="true"
            aria-label="Certificado do curso"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="learning-certificate-modal__header">
              <div>
                <p className="eyebrow">Certificado</p>
                <h3>{selectedCourse?.title ?? 'Curso concluído'}</h3>
              </div>

              <button
                type="button"
                className="button button--ghost"
                onClick={() => setIsCertificateModalOpen(false)}
              >
                Fechar
              </button>
            </header>

            <article className="learning-certificate-preview-card">
              <strong>{session.user.name}</strong>
              <p className="muted">Código de verificação: {activeCertificate.verificationCode}</p>
              <p className="muted">
                Emitido em: {activeCertificate.issuedAt ? new Date(activeCertificate.issuedAt).toLocaleDateString('pt-BR') : 'agora'}
              </p>
            </article>

            <div className="learning-certificate-modal__actions">
              <button
                type="button"
                className="button"
                onClick={handleDownloadCertificate}
                disabled={certificateLoading}
              >
                Download PDF
              </button>

              <button
                type="button"
                className="button button--ghost"
                onClick={handleOpenCertificateLink}
                disabled={certificateLoading}
              >
                Abrir certificado
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}