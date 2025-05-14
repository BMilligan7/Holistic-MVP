import React, { useState } from 'react';
import OnboardingWizard from '../components/onboarding/OnboardingWizard'; // Adjusted path

const sampleSteps = [
  { 
    title: 'Welcome to Holistic AI!',
    content: (
      <>
        <p className="mb-2">We're excited to help you achieve your goals.</p>
        <p>This quick onboarding will personalize your experience.</p>
      </>
    )
  },
  { 
    title: 'Your Primary Goal',
    content: (
      <>
        <p className="mb-3">What is the main area you'd like to focus on?</p>
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
          <input type="text" name="goal" id="goal" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" placeholder="e.g., Improve Fitness, Learn Coding" />
        </div>
      </>
    )
  },
  { 
    title: 'Time Commitment',
    content: (
      <>
        <p className="mb-3">How much time can you dedicate weekly?</p>
        {/* Replace with actual form elements later */}
        <div className="space-y-2">
          <div><input type="radio" name="time" value="1-3" id="time1" className="mr-2"/><label htmlFor="time1">1-3 hours</label></div>
          <div><input type="radio" name="time" value="4-6" id="time2" className="mr-2"/><label htmlFor="time2">4-6 hours</label></div>
          <div><input type="radio" name="time" value="7+" id="time3" className="mr-2"/><label htmlFor="time3">7+ hours</label></div>
        </div>
      </>
    )
  },
  {
    title: 'Final Touches',
    content: <p>Just one more step to go!</p>
  }
];

const OnboardingTestPage: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(true); // Default to open for testing

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Onboarding Wizard Test Page</h1>
        <p className="text-gray-600">Use the button below to toggle the wizard.</p>
      </div>
      
      <button 
        onClick={() => setIsWizardOpen(!isWizardOpen)}
        className="px-6 py-3 mb-8 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150"
      >
        {isWizardOpen ? 'Close' : 'Open'} Onboarding Wizard
      </button>

      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        steps={sampleSteps}
      />

      {/* Optional: Some content behind the modal to see the overlay effect */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-md w-full max-w-lg text-center">
        <p className="text-gray-700">This is content on the test page, behind the modal.</p>
        <p className="text-sm text-gray-500 mt-2">You should see the wizard overlay this when it's open.</p>
      </div>
    </div>
  );
};

export default OnboardingTestPage; 