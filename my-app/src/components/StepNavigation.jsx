import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/solid';

function StepNavigation({ steps, currentStep }) {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentPath;
          const isCompleted = index < steps.findIndex(s => s.id === currentPath);

          return (
            <li key={step.id} className={index !== 0 ? 'ml-8 relative' : ''}>
              {index !== 0 && (
                <div className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 w-8 flex items-center" aria-hidden="true">
                  <div className={`h-0.5 w-full mx-1 ${isCompleted ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                </div>
              )}
              <div className="relative flex items-center">
                <span className="flex h-8 items-center">
                  {isCompleted ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </span>
                  ) : isCurrent ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                    </span>
                  )}
                </span>
                <span className={`ml-3 text-sm font-medium ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StepNavigation;
