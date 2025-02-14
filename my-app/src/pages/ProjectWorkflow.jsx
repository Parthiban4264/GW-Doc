import React from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useStep } from '../hooks/useStep';
import StepNavigation from '../components/StepNavigation';
import ImageUploadStep from '../components/steps/ImageUploadStep';
import ScreenDescriptionStep from '../components/steps/ScreenDescriptionStep';
import RequirementsStep from '../components/steps/RequirementsStep';
import AppFlowStep from '../components/steps/AppFlowStep';
import APIDocsStep from '../components/steps/APIDocsStep';

const steps = [
  { id: 'upload', title: 'Upload Screens', component: ImageUploadStep },
  { id: 'describe', title: 'Describe Screens', component: ScreenDescriptionStep },
  { id: 'requirements', title: 'Generate Requirements', component: RequirementsStep },
  { id: 'flow', title: 'Create App Flow', component: AppFlowStep },
  { id: 'api', title: 'Generate API Docs', component: APIDocsStep }
];

function ProjectWorkflow() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, isFirstStep, isLastStep } = useStep(steps);

  const getCurrentStepIndex = () => {
    const currentPath = window.location.pathname.split('/').pop();
    return steps.findIndex(step => step.id === currentPath);
  };

  const handleNext = (nextStepId) => {
    if (isLastStep) {
      navigate('/');
    } else {
      const currentIndex = getCurrentStepIndex();
      const nextStep = nextStepId || steps[currentIndex + 1].id;
      navigate(`/project/${projectId}/${nextStep}`);
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      navigate(`/project/${projectId}/${steps[currentIndex - 1].id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Projects
        </button>
        <StepNavigation 
          steps={steps} 
          currentStep={currentStep} 
        />
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <Routes>
          {steps.map(({ id, component: StepComponent }) => (
            <Route
              key={id}
              path={id}
              element={
                <StepComponent
                  projectId={projectId}
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={isFirstStep}
                  isLastStep={isLastStep}
                />
              }
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}

export default ProjectWorkflow;
