import React, { useState } from 'react';
import WizardProgress from './WizardProgress';
import WizardStep from './WizardStep';

interface WizardStepConfig {
  title: string;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  // totalSteps: number; // Will be derived from steps.length
  steps: WizardStepConfig[];
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  // totalSteps, // Derived
  steps,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle finish
      onClose(); // Placeholder
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) {
    return null;
  }

  const currentStepConfig = steps[currentStep - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        {/* Close button moved inside the modal content box and styled */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close wizard"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-xl font-semibold mb-2 text-center">Onboarding Wizard</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">Step {currentStep} of {totalSteps}</p>

        <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <WizardStep title={currentStepConfig.title}>
          {currentStepConfig.content}
        </WizardStep>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard; 