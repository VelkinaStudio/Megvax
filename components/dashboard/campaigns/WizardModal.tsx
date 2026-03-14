'use client';

import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  children: ReactNode;
  isStepValid?: boolean;
}

export function WizardModal({ 
  isOpen, 
  onClose, 
  title, 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  onFinish,
  children,
  isStepValid = true
}: WizardModalProps) {
  if (!isOpen) return null;

  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 pointer-events-none p-4 md:p-6">
        <div className="bg-brand-white border-2 border-brand-black rounded-[2px] w-full max-w-[1440px] mx-auto pointer-events-auto flex flex-col max-h-[90vh] min-h-0">
          
          {/* Header */}
          <div className="px-8 py-6 border-b-2 border-brand-black bg-paper-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-black">{title}</h2>
              <p className="text-sm text-brand-black/70 mt-1">Step {currentStep + 1} / {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-brand-white rounded-[2px] border border-transparent hover:border-brand-black transition-colors text-brand-black/60 hover:text-brand-black">
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-paper-white w-full">
            <div 
              className="h-full bg-brand-black transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto flex-1 min-h-0">
            {children}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t-2 border-brand-black bg-paper-white flex items-center justify-between">
            <button 
              onClick={onBack}
              disabled={currentStep === 0}
              className="minimal-button secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {currentStep < totalSteps - 1 ? (
              <button 
                onClick={onNext}
                disabled={!isStepValid}
                className="minimal-button primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={onFinish}
                disabled={!isStepValid}
                className="minimal-button primary bg-action-blue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finish
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
