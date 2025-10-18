import { Badge } from '@/components/ui/badge';

interface TierBadgeProps {
  tier: 'bronze' | 'silver' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export const TierBadge = ({ tier, size = 'md' }: TierBadgeProps) => {
  const config = {
    bronze: {
      icon: '🥉',
      label: 'Bronse',
      className: 'bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/30'
    },
    silver: {
      icon: '🥈',
      label: 'Sølv',
      className: 'bg-[#C0C0C0]/20 text-foreground border-[#C0C0C0]/30'
    },
    gold: {
      icon: '🥇',
      label: 'Gull',
      className: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30'
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const tierConfig = config[tier];

  return (
    <Badge 
      variant="outline" 
      className={`${tierConfig.className} ${sizeClasses[size]} font-semibold`}
    >
      <span className="mr-1">{tierConfig.icon}</span>
      {tierConfig.label}
    </Badge>
  );
};
