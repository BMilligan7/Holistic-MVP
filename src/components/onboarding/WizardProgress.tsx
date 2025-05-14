import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-2 my-6">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-in-out 
                ${isActive ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2' : 
                  isCompleted ? 'bg-green-500 text-white' : 
                  'bg-gray-200 text-gray-600'}`}
            >
              {isCompleted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < totalSteps && (
              <div className={`flex-1 h-1 rounded 
                ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WizardProgress; 