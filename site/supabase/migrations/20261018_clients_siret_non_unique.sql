-- Une entreprise peut ouvrir plusieurs comptes avec le même SIRET (un par collaborateur, service ou
-- site) : chaque compte a sa fiche client, ses courses et sa facture mensuelle.
-- La contrainte d'unicité faisait échouer l'inscription du deuxième compte. L'index simple
-- idx_clients_siret reste pour les recherches.
alter table public.clients drop constraint if exists clients_siret_key;
