-- Facebook lagt til som gyldig kilde for anmeldelser (frontend-valg i CreateReviewModal).
-- Kolonnen er fri tekst uten CHECK-constraint; kun dokumentasjonen oppdateres.
COMMENT ON COLUMN public.reviews.source IS 'Kilde: website, google, facebook, manual';
