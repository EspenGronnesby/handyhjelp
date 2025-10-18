import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  balance: number;
  lifetime_points: number;
  tier: 'bronze' | 'silver' | 'gold';
  tier_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'expired' | 'bonus' | 'referral' | 'welcome';
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface LoyaltyTier {
  tier: 'bronze' | 'silver' | 'gold';
  points_required: number;
  discount_percentage: number;
  benefits: any;
}

export const useLoyalty = () => {
  const { user } = useAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
      fetchTiers();
      setupRealtimeSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      // Fetch loyalty points
      const { data: pointsData, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        console.error('Error fetching loyalty points:', pointsError);
      } else if (pointsData) {
        setLoyaltyPoints(pointsData);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error in fetchLoyaltyData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) {
        console.error('Error fetching tiers:', error);
      } else {
        setTiers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchTiers:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('loyalty-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_points',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchLoyaltyData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'points_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchLoyaltyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getTierProgress = () => {
    if (!loyaltyPoints || tiers.length === 0) return { current: 0, next: 0, percentage: 0 };

    const currentTierIndex = tiers.findIndex(t => t.tier === loyaltyPoints.tier);
    const nextTierIndex = currentTierIndex + 1;

    if (nextTierIndex >= tiers.length) {
      // Already at max tier
      return { current: loyaltyPoints.lifetime_points, next: loyaltyPoints.lifetime_points, percentage: 100 };
    }

    const currentTierPoints = tiers[currentTierIndex].points_required;
    const nextTierPoints = tiers[nextTierIndex].points_required;
    const progressPoints = loyaltyPoints.lifetime_points - currentTierPoints;
    const requiredPoints = nextTierPoints - currentTierPoints;
    const percentage = Math.min((progressPoints / requiredPoints) * 100, 100);

    return {
      current: loyaltyPoints.lifetime_points,
      next: nextTierPoints,
      remaining: nextTierPoints - loyaltyPoints.lifetime_points,
      percentage
    };
  };

  const getPointsValue = (points: number) => {
    return Math.floor(points / 10);
  };

  return {
    loyaltyPoints,
    transactions,
    tiers,
    loading,
    getTierProgress,
    getPointsValue,
    refresh: fetchLoyaltyData
  };
};
