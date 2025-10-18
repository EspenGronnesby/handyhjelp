import { useState } from 'react';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Star, TrendingUp, Gift, Users, Calendar, Award } from 'lucide-react';
import { UsePointsModal } from '@/components/loyalty/UsePointsModal';
import { ReferralSection } from '@/components/loyalty/ReferralSection';
import { ActiveCampaigns } from '@/components/loyalty/ActiveCampaigns';
import { PointsHistory } from '@/components/loyalty/PointsHistory';
import { TierBadge } from '@/components/loyalty/TierBadge';

const DashboardLoyalty = () => {
  const { loyaltyPoints, transactions, tiers, loading, getTierProgress, getPointsValue } = useLoyalty();
  const [showUsePoints, setShowUsePoints] = useState(false);
  const tierProgress = getTierProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loyaltyPoints) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kundeklubb</CardTitle>
          <CardDescription>
            Velkommen til HandyHjelp Kundeklubb! Du vil automatisk bli med når du registrerer deg.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tierInfo = tiers.find(t => t.tier === loyaltyPoints.tier);
  const nextTier = tiers.find(t => t.points_required > loyaltyPoints.lifetime_points);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Kundeklubb</h1>
        <p className="text-muted-foreground">
          Du hjelper – vi hjelper deg tilbake ⭐
        </p>
      </div>

      {/* Points Balance Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Star className="h-8 w-8 text-primary fill-primary" />
                {loyaltyPoints.balance.toLocaleString()} poeng
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Verdi: <span className="font-semibold text-foreground">{getPointsValue(loyaltyPoints.balance)} kr</span>
              </CardDescription>
            </div>
            <TierBadge tier={loyaltyPoints.tier} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tier Progress */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mot neste nivå</span>
                <span className="font-medium">
                  {tierProgress.remaining?.toLocaleString()} poeng til {nextTier.tier === 'silver' ? 'Sølv' : 'Gull'}
                </span>
              </div>
              <Progress value={tierProgress.percentage} className="h-3" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={() => setShowUsePoints(true)}
              disabled={loyaltyPoints.balance < 200}
              className="flex-1"
            >
              <Gift className="h-4 w-4 mr-2" />
              Bruk poeng
            </Button>
            <Button variant="outline" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tjen mer
            </Button>
          </div>

          {loyaltyPoints.balance < 200 && (
            <p className="text-xs text-muted-foreground text-center">
              Du trenger minst 200 poeng for å bruke dem (minimum 20 kr rabatt)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      {tierInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Dine fordeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tierInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {tierInfo.discount_percentage > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium">
                  🎁 {tierInfo.discount_percentage}% ekstra rabatt på alle tjenester!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            Historikk
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Gift className="h-4 w-4 mr-2" />
            Kampanjer
          </TabsTrigger>
          <TabsTrigger value="referral">
            <Users className="h-4 w-4 mr-2" />
            Anbefalinger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <PointsHistory transactions={transactions} />
        </TabsContent>

        <TabsContent value="campaigns">
          <ActiveCampaigns />
        </TabsContent>

        <TabsContent value="referral">
          <ReferralSection />
        </TabsContent>
      </Tabs>

      {/* Use Points Modal */}
      <UsePointsModal
        open={showUsePoints}
        onClose={() => setShowUsePoints(false)}
        currentBalance={loyaltyPoints.balance}
        getPointsValue={getPointsValue}
      />
    </div>
  );
};

export default DashboardLoyalty;
