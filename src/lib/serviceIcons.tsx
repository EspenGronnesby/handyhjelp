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

// Unified cyan color for all services - consistent visual expression
const unifiedColors: ServiceColors = {
  bg: 'bg-cyan-50/60 dark:bg-cyan-950/30',
  border: 'border-cyan-200/60 dark:border-cyan-800/40',
  iconBg: 'bg-cyan-500 dark:bg-cyan-600',
  iconColor: 'text-white',
};

// Special emerald colors for popular/featured cards
export const popularColors: ServiceColors = {
  bg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
  border: 'border-emerald-300/70 dark:border-emerald-700/50',
  iconBg: 'bg-emerald-500 dark:bg-emerald-600',
  iconColor: 'text-white',
};

export const serviceColors: Record<string, ServiceColors> = {
  vaktmester: unifiedColors,
  tomrer: unifiedColors,
  blikk: unifiedColors,
  takrennerens: unifiedColors,
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

// Gradient palette per service — used as the visual header for service cards
// across the site (Index, /tjenester, future service detail pages). Keeps
// every card visually distinct without needing external image assets.
export const serviceGradients: Record<string, string> = {
  vaktmester: 'from-cyan-500 via-blue-500 to-indigo-600',
  takrennerens: 'from-emerald-500 via-teal-500 to-cyan-600',
  tomrer: 'from-amber-500 via-orange-500 to-rose-600',
  blikk: 'from-slate-500 via-zinc-600 to-gray-700',
};

export const getServiceGradient = (serviceId: string): string => {
  return serviceGradients[serviceId] || serviceGradients.vaktmester;
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
