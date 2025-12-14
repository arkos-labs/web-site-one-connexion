# 📧 Configuration des Templates Email Supabase

## 📋 Templates Créés

Vous trouverez dans le dossier `email-templates/` les templates suivants :

1. ✅ **confirm-signup.html** - Confirmation d'inscription
2. ✅ **reset-password.html** - Réinitialisation de mot de passe

---

## 🚀 Configuration dans Supabase

### Étape 1 : Accéder aux Templates Email

1. Connectez-vous à votre **Dashboard Supabase**
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **Email Templates**

### Étape 2 : Configurer le Template "Confirm Signup"

1. Cliquez sur **"Confirm signup"**
2. **Copiez le contenu** de `email-templates/confirm-signup.html`
3. **Collez-le** dans l'éditeur Supabase
4. Cliquez sur **"Save"**

### Étape 3 : Configurer le Template "Reset Password"

1. Cliquez sur **"Reset Password"**
2. **Copiez le contenu** de `email-templates/reset-password.html`
3. **Collez-le** dans l'éditeur Supabase
4. Cliquez sur **"Save"**

---

## ⚙️ Configuration des URLs de Redirection

### Site URL

Dans **Authentication** → **URL Configuration** :

```
Site URL: https://votre-domaine.com
```

**Pour le développement local** :
```
Site URL: http://localhost:5173
```

### Redirect URLs

Ajoutez les URLs autorisées pour la redirection après confirmation :

```
http://localhost:5173/**
https://votre-domaine.com/**
https://www.votre-domaine.com/**
```

---

## 🎨 Personnalisation des Templates

### Variables Disponibles

Les templates utilisent les variables Supabase suivantes :

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Lien de confirmation complet |
| `{{ .Token }}` | Code OTP à 6 chiffres |
| `{{ .TokenHash }}` | Version hashée du token |
| `{{ .SiteURL }}` | URL de votre site |
| `{{ .Email }}` | Email de l'utilisateur |

### Modifier le Design

Pour personnaliser les templates :

1. **Couleurs** : Modifiez les gradients dans les sections `.header` et `.cta-button`
2. **Logo** : Remplacez le texte "One Connexion" par une image :
   ```html
   <img src="https://votre-domaine.com/logo.png" alt="Logo" style="max-width: 200px;">
   ```
3. **Footer** : Mettez à jour les coordonnées et liens

---

## 🧪 Tester les Emails

### Test en Local

1. **Inscrivez-vous** avec un email de test
2. **Vérifiez** que l'email arrive (peut prendre 1-2 minutes)
3. **Cliquez** sur le bouton ou utilisez le code OTP

### Vérifier les Logs

Dans Supabase Dashboard :
- **Authentication** → **Logs**
- Vérifiez les événements `user.signup` et `email.sent`

---

## 🔒 Sécurité

### Expiration des Liens

Par défaut, Supabase configure :
- **Confirmation d'inscription** : 24 heures
- **Réinitialisation de mot de passe** : 1 heure

Pour modifier :
- **Authentication** → **Settings** → **Email Auth**

### SMTP Personnalisé (Optionnel)

Pour utiliser votre propre serveur SMTP :

1. **Authentication** → **Settings** → **SMTP Settings**
2. Configurez :
   - Host
   - Port
   - Username
   - Password
   - Sender email

---

## 📱 Responsive Design

Les templates sont **100% responsive** :
- ✅ Desktop
- ✅ Tablette
- ✅ Mobile

Testez sur différents clients email :
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail

---

## 🎯 Bonnes Pratiques

### 1. **Texte Alternatif**
Ajoutez toujours un lien texte en plus du bouton pour les clients email qui bloquent les images.

### 2. **Prévisualisation**
Testez vos emails avant de les déployer :
- [Litmus](https://litmus.com/)
- [Email on Acid](https://www.emailonacid.com/)

### 3. **Accessibilité**
- Utilisez des contrastes de couleurs suffisants
- Taille de police minimum : 14px
- Boutons cliquables : minimum 44x44px

---

## 🐛 Dépannage

### Les emails n'arrivent pas

1. **Vérifiez les Logs** : Authentication → Logs
2. **Spam** : Vérifiez le dossier spam/courrier indésirable
3. **SMTP** : Si vous utilisez un SMTP personnalisé, vérifiez les credentials

### Le lien de confirmation ne fonctionne pas

1. **Vérifiez la Redirect URL** : Elle doit être dans la liste des URLs autorisées
2. **Expiration** : Le lien a peut-être expiré
3. **Token** : Utilisez le code OTP à 6 chiffres en alternative

### Le design ne s'affiche pas correctement

1. **Inline CSS** : Les styles sont inline pour une meilleure compatibilité
2. **Images** : Vérifiez que les images sont hébergées sur HTTPS
3. **Client Email** : Certains clients (Outlook) ont des limitations CSS

---

## 📚 Ressources

- [Documentation Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Guide des Variables Email](https://supabase.com/docs/reference/javascript/auth-signup)
- [Bonnes Pratiques Email HTML](https://www.campaignmonitor.com/css/)

---

**Date de création** : 14 décembre 2025  
**Statut** : ✅ Templates prêts à l'emploi
