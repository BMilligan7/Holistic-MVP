import { OnboardingQuiz } from '../lib/types/onboarding';

export const defaultOnboardingQuiz: OnboardingQuiz = {
  id: 'default_quiz_v1',
  title: 'Welcome Onboarding',
  description: 'Let\'s get to know you a bit better to personalize your experience.',
  questions: [
    {
      id: 'q1_name',
      questionType: 'text',
      text: 'What is your name?',
      placeholder: 'Enter your name',
      validationRules: [
        { type: 'required', message: 'Name is required.' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters.' }
      ]
    },
    {
      id: 'q2_goal',
      questionType: 'select',
      text: 'What is your primary goal for using our platform?',
      options: [
        { value: 'learn', label: 'Learn new skills' },
        { value: 'productivity', label: 'Boost productivity' },
        { value: 'connect', label: 'Connect with others' },
        { value: 'other', label: 'Other' }
      ],
      validationRules: [
        { type: 'required', message: 'Please select a goal.' }
      ]
    },
    {
      id: 'q2_other_detail',
      questionType: 'text',
      text: 'Could you specify your \"Other\" goal?',
      placeholder: 'Describe your goal',
      validationRules: [
        { type: 'required', message: 'Please specify your goal.' }
      ],
      branchingLogic: [
        {
          conditions: [
            { questionId: 'q2_goal', operator: 'not_equals', value: 'other' }
          ],
          // This question is skipped if q2_goal is NOT 'other'
          // To implement skipping, the wizard logic will need to identify this question should not be shown.
          // A more direct way to skip is to have nextQuestionId point to q3_experience,
          // and this question (q2_other_detail) would only be navigated to if q2_goal IS 'other'.
          // For now, this structure implies conditional visibility managed by the wizard.
          // A better approach for branching would be to define explicit \"nextQuestionId\" based on conditions.
          // Let's refine branchingLogic in the types to be more explicit about next steps.
          // For now, this acts as a \"show_if\" condition.
          nextQuestionId: 'q3_experience' // Default next if shown
        }
      ]
    },
    {
      id: 'q3_experience',
      questionType: 'mcq',
      text: 'What is your current experience level with similar platforms?',
      options: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'expert', label: 'Expert' }
      ],
      validationRules: [
        { type: 'required', message: 'Please select an experience level.' }
      ]
    },
    // Example of a slider question
    {
        id: 'q4_usage_frequency',
        questionType: 'slider',
        text: 'How often do you anticipate using the platform?',
        min: 1,
        max: 7,
        step: 1,
        minLabel: 'Once a week',
        maxLabel: 'Daily',
        validationRules: [
            {type: 'required', message: 'Please select your anticipated usage frequency.'}
        ]
    },
    // Example of a multiple select question
    {
        id: 'q5_features_interest',
        questionType: 'multiple_select',
        text: 'Which features are you most interested in? (Select up to 3)',
        options: [
            {value: 'feature_a', label: 'Feature A'},
            {value: 'feature_b', label: 'Feature B'},
            {value: 'feature_c', label: 'Feature C'},
            {value: 'feature_d', label: 'Feature D'},
            {value: 'feature_e', label: 'Feature E'},
        ],
        maxSelections: 3,
        validationRules: [
            {type: 'required', message: 'Please select at least one feature.'}
        ]
    }
    // Add more questions as needed
  ]
}; 