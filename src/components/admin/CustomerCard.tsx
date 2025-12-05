import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Profile } from '@/types/admin';

interface CustomerCardProps {
  profile: Profile;
}

export const CustomerCard = ({ profile }: CustomerCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {profile.full_name}
              <Badge className="ml-2" variant="outline">
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
