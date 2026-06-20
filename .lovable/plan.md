# Fjern bonus-/lojalitetssystemet

Systemet brukes ikke og fjernes i sin helhet — frontend, edge functions og database.

## Frontend
- Slett `src/pages/DashboardLoyalty.tsx`
- Slett mappen `src/components/loyalty/` (TierBadge, PointsHistory, UsePointsModal, ActiveCampaigns, ReferralSection)
- Slett `src/hooks/useLoyalty.tsx`
- `src/App.tsx`: fjern `DashboardLoyalty` lazy-import og `<Route path="loyalty" …>`
- `src/types/notifications.ts`: fjern `LOYALTY: 'loyalty'` fra type-enum
- `src/hooks/useAuth.tsx`: fjern kommentarene om welcome bonus trigger

## Edge functions (slettes)
- `award-welcome-bonus`
- `apply-points-discount`
- `calculate-points-value`
- `check-active-campaigns`
- `process-referral`

## Database (migrasjon)
Slipper triggere, funksjoner og tabeller knyttet til poeng/lojalitet/referral:
- Triggere/funksjoner: `award_welcome_bonus_trigger`, `award_points`, `check_and_update_tier`, `expire_old_points`, `get_active_campaign_multiplier`, `update_loyalty_updated_at`
- Enums: `app_role` beholdes; `transaction_type` og `loyalty_tier` slettes
- Tabeller (DROP CASCADE): `points_transactions`, `loyalty_points`, `loyalty_campaigns`, `loyalty_tiers`, `referral_codes`
- Fjerner `'loyalty'`-relaterte notifikasjoner ikke nødvendig — type er bare en streng

## Verifisering
- Bygg passerer (ingen importer til slettede filer)
- `/dashboard/loyalty` finnes ikke lenger
- Ingen referanser til `useLoyalty`, `loyalty_*`-tabeller eller fjernede edge functions
