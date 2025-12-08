import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const FormProgress = ({ 
  currentStep, 
  totalSteps, 
  labels,
  className 
}: FormProgressProps) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        
        {/* Progress line */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-background border-primary text-primary",
                    !isCompleted && !isCurrent && "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {labels && labels[index] && (
                  <span 
                    className={cn(
                      "mt-2 text-xs text-center max-w-[80px] hidden sm:block",
                      (isCompleted || isCurrent) ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {labels[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile: show current step label */}
      {labels && labels[currentStep - 1] && (
        <p className="mt-4 text-sm text-center text-muted-foreground sm:hidden">
          Steg {currentStep} av {totalSteps}: <span className="font-medium text-foreground">{labels[currentStep - 1]}</span>
        </p>
      )}
    </div>
  );
};

// Simple linear progress for compact forms
interface LinearProgressProps {
  currentStep: number;
  totalSteps: number;
  showLabel?: boolean;
  className?: string;
}

export const LinearProgress = ({ 
  currentStep, 
  totalSteps, 
  showLabel = true,
  className 
}: LinearProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Steg {currentStep} av {totalSteps}
        </p>
      )}
    </div>
  );
};
