-- 2026-10-18 — Demande d'avis Google envoyée une seule fois par course livrée (cron review-requests).
alter table public.orders add column if not exists review_requested_at timestamptz;
