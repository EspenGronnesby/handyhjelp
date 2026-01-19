import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Profile } from '@/types/admin';
import { ChevronRight } from 'lucide-react';

interface CustomerCardProps {
  profile: Profile;
  onClick?: () => void;
}

export const CustomerCard = ({ profile, onClick }: CustomerCardProps) => {
  return (
    <Card 
      className="cursor-pointer interactive-card hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {profile.full_name}
              <Badge className="ml-1" variant="outline">
                {profile.customer_type === 'business' ? 'Bedrift' : 'Privat'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Registrert {formatDistanceToNow(new Date(profile.created_at), { 
                addSuffix: true,
                locale: nb 
              })}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm flex-wrap">
          <div>
            <span className="font-medium">E-post:</span> {profile.email}
          </div>
          {profile.phone && (
            <div>
              <span className="font-medium">Telefon:</span> {profile.phone}
            </div>
          )}
          {profile.company_name && (
            <div>
              <span className="font-medium">Firma:</span> {profile.company_name}
            </div>
          )}
          {profile.org_number && (
            <div>
              <span className="font-medium">Org.nr:</span> {profile.org_number}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
