import { questions, Question, getQuestionsForState, shuffleQuestions } from '@/data/questions';
import { stateBySlug } from '@/data/states';

export interface QuestionForClient {
  id: string;
  text: string;
  options: string[];
  category: string;
  topic: string;
  states: string[];
}

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  correctAnswer: number;
  selectedAnswer: number;
  explanation: string;
  text: string;
  options: string[];
}

export interface TestResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  review: AnswerResult[];
}

/**
 * Get questions for a state and test type, stripped of answers for client
 */
export function getQuestionsForTest(
  stateSlugOrAbbr: string,
  type: 'permit' | 'drivers' | 'motorcycle',
  count: number = 40
): QuestionForClient[] {
  // Accept either a slug ("california") or abbreviation ("CA") — resolve to abbreviation
  const state = stateBySlug(stateSlugOrAbbr);
  const abbr = state ? state.abbreviation : stateSlugOrAbbr.toUpperCase();
  const allQuestions = getQuestionsForState(abbr, type);
  const shuffled = shuffleQuestions(allQuestions);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    category: q.category,
    topic: q.topic,
    states: q.states,
  }));
}

/**
 * Score submitted answers against correct answers
 */
export function scoreAnswers(
  submittedAnswers: Array<{ questionId: string; selectedAnswer: number }>,
  passingPercent: number = 80
): TestResult {
  const review: AnswerResult[] = [];
  let correctCount = 0;

  for (const answer of submittedAnswers) {
    const question = questions.find((q) => q.id === answer.questionId);

    if (!question) continue;

    const isCorrect = answer.selectedAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;

    review.push({
      questionId: question.id,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      selectedAnswer: answer.selectedAnswer,
      explanation: question.explanation,
      text: question.text,
      options: question.options,
    });
  }

  const total = review.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = percentage >= passingPercent;

  return {
    score: correctCount,
    total,
    percentage,
    passed,
    passingScore: passingPercent,
    review,
  };
}

/**
 * Get question by ID (for validation purposes)
 */
export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

/**
 * Get the count of questions available for a state and type
 */
export function getQuestionCount(
  stateAbbr: string,
  type: 'permit' | 'drivers' | 'motorcycle'
): number {
  return getQuestionsForState(stateAbbr, type).length;
}

/**
 * Get questions grouped by topic for a state/type
 */
export function getQuestionsByTopic(
  stateAbbr: string,
  type: 'permit' | 'drivers' | 'motorcycle'
): Record<string, number> {
  const qs = getQuestionsForState(stateAbbr, type);
  const topicCounts: Record<string, number> = {};

  for (const q of qs) {
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  }

  return topicCounts;
}
