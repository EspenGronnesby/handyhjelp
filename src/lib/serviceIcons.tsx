import { Wrench, Hammer, Droplets, CloudRain, LucideIcon } from 'lucide-react';
import { cn } from './utils';

// Service icon and color mapping for consistent styling across the app
export interface ServiceConfig {
  icon: LucideIcon;
  label: string;
  labelShort: string;
}

export interface ServiceColors {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
}

// Icon mapping for each service type
export const serviceIcons: Record<string, ServiceConfig> = {
  vaktmester: { icon: Wrench, label: 'Vaktmester', labelShort: 'Vaktmester' },
  tomrer: { icon: Hammer, label: 'Tømrer', labelShort: 'Tømrer' },
  blikk: { icon: Droplets, label: 'Blikkenslager', labelShort: 'Blikk' },
  takrennerens: { icon: CloudRain, label: 'Takrennerens', labelShort: 'Takrenner' },
};

// Subtle color tints for each service - provides visual differentiation
export const serviceColors: Record<string, ServiceColors> = {
  vaktmester: {
    bg: 'bg-blue-50/60 dark:bg-blue-950/30',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    iconBg: 'bg-blue-500 dark:bg-blue-600',
    iconColor: 'text-white',
  },
  tomrer: {
    bg: 'bg-amber-50/60 dark:bg-amber-950/30',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    iconBg: 'bg-amber-500 dark:bg-amber-600',
    iconColor: 'text-white',
  },
  blikk: {
    bg: 'bg-cyan-50/60 dark:bg-cyan-950/30',
    border: 'border-cyan-200/60 dark:border-cyan-800/40',
    iconBg: 'bg-cyan-500 dark:bg-cyan-600',
    iconColor: 'text-white',
  },
  takrennerens: {
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    iconBg: 'bg-emerald-500 dark:bg-emerald-600',
    iconColor: 'text-white',
  },
};

// Default fallback for unknown services
const defaultConfig: ServiceConfig = serviceIcons.vaktmester;
const defaultColors: ServiceColors = serviceColors.vaktmester;

// Get service configuration
export const getServiceConfig = (serviceId: string): ServiceConfig => {
  return serviceIcons[serviceId] || defaultConfig;
};

// Get service colors
export const getServiceColors = (serviceId: string): ServiceColors => {
  return serviceColors[serviceId] || defaultColors;
};

// Reusable ServiceIcon component with consistent styling
interface ServiceIconProps {
  serviceId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  useServiceColor?: boolean;
}

export const ServiceIcon = ({ 
  serviceId, 
  size = 'md', 
  className,
  useServiceColor = true 
}: ServiceIconProps) => {
  const config = getServiceConfig(serviceId);
  const colors = getServiceColors(serviceId);
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
  };
  
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  };

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        useServiceColor ? colors.iconBg : 'bg-primary',
        className
      )}
    >
      <IconComponent 
        className={cn(
          iconSizeClasses[size],
          useServiceColor ? colors.iconColor : 'text-primary-foreground'
        )} 
      />
    </div>
  );
};

// Service Badge component for category labels
interface ServiceBadgeProps {
  serviceId: string;
  className?: string;
  showIcon?: boolean;
}

export const ServiceBadge = ({ 
  serviceId, 
  className,
  showIcon = true 
}: ServiceBadgeProps) => {
  const config = getServiceConfig(serviceId);
  const colors = getServiceColors(serviceId);
  const IconComponent = config.icon;

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
        'bg-background/90 backdrop-blur-sm text-foreground',
        className
      )}
    >
      {showIcon && (
        <span className={cn('rounded-full p-1', colors.iconBg)}>
          <IconComponent className="h-3 w-3 text-white" />
        </span>
      )}
      {config.label}
    </span>
  );
};

// Get category label with icon for display
export const getCategoryLabel = (category: string): string => {
  const config = getServiceConfig(category);
  return config.label;
};
