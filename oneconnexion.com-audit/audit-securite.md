# Audit de sécurité — oneconnexion.com

_Audit boîte blanche (code source + vérifs externes passives). Non destructif. 18/10/2026._

## Verdict global

Le site est **bien sécurisé** pour un projet de cette taille. Les points réellement
dangereux (contournement d'auth, manipulation de prix, prise de compte, secrets exposés)
sont **déjà couverts**. Les constats ci-dessous sont surtout du durcissement, avec **une**
vraie faille à corriger (`mission_anomalies`).

### Ce qui est déjà solide (vérifié dans le code)
- **Aucun secret en dur**, service role key uniquement côté serveur, `.env*` git-ignoré.
- **Prix recalculé côté serveur** (`calculatePrice`) dans `create-checkout` et `pay-saved` :
  impossible de payer un montant choisi par le client.
- **RLS + triggers** sur `orders`/`navettes` : un client ne peut qu'annuler (avant enlèvement),
  un chauffeur ne touche qu'aux champs de progression, jamais au prix/client.
- **Rôle protégé** (`protect_profile_role`) : personne ne peut se promouvoir admin.
- **Prise de compte invité empêchée** (`guest-account` : refus si le compte a déjà servi).
- **Webhook Stripe signé** (refus en prod sans `STRIPE_WEBHOOK_SECRET`).
- **Webhook Telegram** protégé par secret + filtrage `chat_id`.
- **Crons** protégés par `CRON_SECRET` (Bearer).
- **Formulaire contact** : validation zod, honeypot, rate-limit.
- **En-têtes** : CSP, HSTS (confirmé servi), X-Frame-Options, nosniff, Referrer-Policy,
  Permissions-Policy. `/admin` et `/dashboard` en `noindex`.

---

## Constats à corriger

### ✅ 1. `mission_anomalies` — FAUSSE ALERTE (déjà corrigé en prod)
> **Mise à jour après vérification en base :** la prod n'a PAS la policy `USING(true)`.
> Elle a 4 policies cloisonnées (`anomalies_driver_insert/select`, `anomalies_admin_update/delete`)
> qui réservent l'écriture au chauffeur assigné, update/delete à l'admin, et masquent même
> certains types d'anomalies au client. **Aucune action requise.** Seul bémol : le fichier de
> migration ci-dessous (versionné) contient encore l'ancienne policy ouverte et ne reflète donc
> PAS la prod — à recapturer dans une migration pour que le repo corresponde au déployé.

`site/supabase/migrations/20260920_create_mission_anomalies.sql`

```sql
CREATE POLICY "Allow all operations for authenticated users"
ON public.mission_anomalies FOR ALL TO authenticated
USING (true) WITH CHECK (true);
```

**Impact :** n'importe quel utilisateur connecté (client OU chauffeur) peut **lire, modifier
et supprimer TOUTES les anomalies** de toutes les missions, pas seulement les siennes.
C'est le seul vrai trou d'isolation entre comptes. Aucune autre table n'a ce défaut.

**Correctif proposé** (à adapter : vérifier le sens de `mission_type`/`mission_id`) :

```sql
drop policy if exists "Allow all operations for authenticated users" on public.mission_anomalies;

-- Lecture : admin, ou le chauffeur/le client concerné par la mission
create policy anomalies_read on public.mission_anomalies for select to authenticated
using (
  public.is_admin()
  or exists (select 1 from orders o where o.id = mission_id
             and (o.driver_id = auth.uid() or o.user_id = auth.uid()))
  or exists (select 1 from navettes n where n.id = mission_id
             and (n.driver_id = auth.uid() or n.user_id = auth.uid()))
);

-- Écriture : le chauffeur assigné à la mission signale l'anomalie
create policy anomalies_insert on public.mission_anomalies for insert to authenticated
with check (
  exists (select 1 from orders o where o.id = mission_id and o.driver_id = auth.uid())
  or exists (select 1 from navettes n where n.id = mission_id and n.driver_id = auth.uid())
);

-- Résolution réservée à l'admin
create policy anomalies_update on public.mission_anomalies for update to authenticated
using (public.is_admin()) with check (public.is_admin());
```

### 🟡 2. Backdoor admin par e-mail en dur  (FAIBLE)
`site/middleware.ts` (et logique de redirection)

```ts
if (profile?.role !== "admin" && user.email !== "cherkinicolas@gmail.com") { ... }
```

Le statut admin est accordé à une adresse en dur, hors base. **Vérification en base :** le
compte `cherkinicolas@gmail.com` visé par le backdoor est en réalité un **compte chauffeur**
(role=driver, avec fiche) — le backdoor lui donnait donc un accès admin silencieux. Un vrai
compte admin existe par ailleurs (`contact@oneconnexion.com`, role=admin).

**Correctif appliqué (code) :** condition e-mail retirée du middleware (×2) et de `AuthForm`.
L'accès `/admin` ne dépend plus que de `profiles.role = 'admin'`. **Sans risque de lockout**
puisque `contact@oneconnexion.com` est admin en base. Aucune migration de rôle nécessaire.
(À déployer pour être effectif.)

### 🟡 3. `guest-account` distribue un jeton de connexion sans authentification  (FAIBLE→MOYEN)
`site/app/api/orders/guest-account/route.ts`

L'endpoint est **public** et renvoie un `tokenHash` (magic-link) à quiconque fournit un
code de suivi `OC-XXXXXXXX` d'une commande < 2 h non encore réclamée. L'espace de codes
(~2,8·10¹²) rend le brute-force peu réaliste, **mais il n'y a aucun rate-limiting**. Un
code qui fuite (capture d'écran, logs, e-mail transféré) dans la fenêtre de 2 h permet de
récupérer un accès au compte fraîchement créé. **Reco :** ajouter un rate-limit par IP sur
`guest-account`/`claim`/`pay-saved`, et idéalement lier le jeton à une preuve e-mail plutôt
qu'au seul code de suivi.

### 🟡 4. `typescript.ignoreBuildErrors: true`  (FAIBLE)
`site/next.config.ts` — les erreurs de typage sont ignorées au build. Cela peut masquer des
bugs, y compris de sécurité (ex. champ non vérifié). **Reco :** corriger les types puis
repasser à `false`.

### 🔵 5. Durcissements mineurs  (INFO)
- **CSP** : `script-src 'unsafe-inline'` sans nonce → protection XSS affaiblie. Migrer vers
  des nonces quand possible (déjà noté en commentaire).
- **Rate-limit en mémoire** (contact) : non partagé entre instances serverless, donc
  contournable. Utiliser un store partagé (Upstash/Redis/table Supabase) si l'abus devient réel.
- **Comparaisons de secrets** (`CRON_SECRET`, secret Telegram) en `!==` non constant-time.
  Risque de timing quasi théorique sur réseau ; `crypto.timingSafeEqual` si on veut être carré.

---

## Volet externe à finir toi-même
Les vérifs actives sur le domaine en ligne ont été bloquées par le garde-fou de l'agent
(il assimile « taper sur le site » à une attaque). À lancer depuis ton terminal :

```bash
# En-têtes réellement servis
curl -sSIL https://oneconnexion.com/ | grep -iE "content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"

# Les endpoints sensibles doivent refuser sans auth (attendu : 401)
curl -s -o /dev/null -w "%{http_code}\n" https://oneconnexion.com/api/cron/deferred-payments
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://oneconnexion.com/api/admin/create-driver -H "content-type: application/json" -d '{}'

# Aucune fuite de fichier (attendu : 404)
for p in /.env /.git/config; do curl -s -o /dev/null -w "$p %{http_code}\n" "https://oneconnexion.com$p"; done
```

## Priorités
1. Corriger `mission_anomalies` (#1) — seule vraie faille.
2. Supprimer le backdoor e-mail (#2).
3. Rate-limiting sur `guest-account` / `claim` / `pay-saved` (#3).
4. Rétablir le typage strict (#4) quand le planning le permet.
