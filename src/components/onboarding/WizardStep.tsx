import React from 'react';

interface WizardStepProps {
  title: string;
  children: React.ReactNode;
}

const WizardStep: React.FC<WizardStepProps> = ({ title, children }) => {
  return (
    <div className="my-4 p-4 border border-gray-200 rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
};

export default WizardStep; 