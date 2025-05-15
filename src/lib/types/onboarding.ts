export type QuestionType = 'mcq' | 'text' | 'select' | 'slider' | 'multiple_select';

export interface QuestionOption {
  value: string | number;
  label: string;
  image?: string; // Optional image for options
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
  value?: string | number; // e.g., for minLength: 5, for pattern: '^[a-zA-Z]+$'
  message: string; // Custom validation message
}

export interface BranchCondition {
  questionId: string; // The ID of the question whose answer triggers the branch
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any; // The value to compare the answer against
}

export interface BranchTarget {
  conditions: BranchCondition[]; // All conditions must be met for this target
  nextQuestionId: string | null; // null means end of quiz or specific outcome
}

export interface QuestionBase {
  id: string; // Unique ID for the question
  text: string; // The question text itself
  description?: string; // Optional additional context for the question
  questionType: QuestionType;
  validationRules?: ValidationRule[];
  branchingLogic?: BranchTarget[];
  // metadata?: Record<string, any>; // For any other custom properties
}

export interface MCQQuestion extends QuestionBase {
  questionType: 'mcq';
  options: QuestionOption[];
}

export interface TextQuestion extends QuestionBase {
  questionType: 'text';
  placeholder?: string;
  multiline?: boolean;
}

export interface SelectQuestion extends QuestionBase {
  questionType: 'select';
  options: QuestionOption[];
}

export interface MultipleSelectQuestion extends QuestionBase {
  questionType: 'multiple_select';
  options: QuestionOption[];
  maxSelections?: number;
}

export interface SliderQuestion extends QuestionBase {
  questionType: 'slider';
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
}

export type OnboardingQuestion =
  | MCQQuestion
  | TextQuestion
  | SelectQuestion
  | MultipleSelectQuestion
  | SliderQuestion;

// Represents the overall structure of an onboarding quiz
export interface OnboardingQuiz {
  id: string;
  title: string;
  description?: string;
  questions: OnboardingQuestion[];
  // initialAnswers?: Record<string, any>; // To pre-fill answers if needed
}

// Represents the user's answers
export type UserAnswers = Record<string, any>; // Key is questionId 