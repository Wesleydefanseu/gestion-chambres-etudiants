# Configuration Supabase pour CamerLogis

## 🚀 Étapes de Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Nommez votre projet : `camerlogis`
6. Choisissez un mot de passe pour la base de données
7. Sélectionnez la région la plus proche (Europe West pour le Cameroun)
8. Cliquez sur "Create new project"

### 2. Exécuter le script SQL

1. Dans votre projet Supabase, allez dans l'onglet **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez tout le contenu du fichier `supabase/migrations/001_initial_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **"Run"** pour exécuter le script

### 3. Configurer l'authentification

#### Dans Supabase Dashboard :

1. Allez dans **Authentication > Settings**
2. Dans **Site URL**, mettez : `http://localhost:5173`
3. Dans **Redirect URLs**, ajoutez :
   - `http://localhost:5173`
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/**`
4. **Désactivez** "Enable email confirmations" (pour le développement)
5. **Activez** "Enable signup"

#### Configuration des providers :

1. Dans **Authentication > Providers**
2. **Email** : Activé par défaut
3. Vous pouvez ajouter d'autres providers plus tard si nécessaire

### 4. Récupérer les clés API

1. Allez dans **Settings > API**
2. Copiez les valeurs suivantes :
   - **Project URL** : `https://your-project-id.supabase.co`
   - **anon public** : `eyJ...` (clé publique)
   - **service_role** : `eyJ...` (clé privée - gardez-la secrète)

### 5. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Configurer le Storage (optionnel)

Pour les images des chambres :

1. Allez dans **Storage**
2. Créez un nouveau bucket : `room-images`
3. Rendez-le public :
   ```sql
   -- Dans SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('room-images', 'room-images', true);
   
   -- Politique pour permettre l'upload
   CREATE POLICY "Anyone can upload room images" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'room-images');
   
   -- Politique pour permettre la lecture
   CREATE POLICY "Anyone can view room images" ON storage.objects
   FOR SELECT USING (bucket_id = 'room-images');
   ```

## 🔐 Comptes de Test

Le script crée automatiquement ces comptes :

### Administrateur
- **Email** : `admin@camerlogis.cm`
- **Mot de passe** : `admin123`
- **Rôle** : admin

### Comptes de test (créés via l'interface)
- **Étudiant** : `etudiant@test.com` / `password`
- **Propriétaire** : `proprietaire@test.com` / `password`

## 🛠️ Fonctionnalités Configurées

### Authentification
- ✅ Inscription par email/mot de passe
- ✅ Connexion sécurisée
- ✅ Gestion des rôles (student, owner, admin)
- ✅ Synchronisation automatique avec la table users
- ✅ Pas de confirmation email (pour le développement)

### Base de Données
- ✅ 8 tables principales avec relations
- ✅ RLS (Row Level Security) activé
- ✅ Politiques de sécurité appropriées
- ✅ Triggers pour les timestamps
- ✅ Vues pour les statistiques
- ✅ Données de test

### Sécurité
- ✅ Chaque utilisateur ne peut voir que ses données
- ✅ Les propriétaires gèrent leurs chambres
- ✅ Les étudiants gèrent leurs réservations
- ✅ Les admins ont accès à tout

## 🧪 Test de la Configuration

1. Démarrez votre application : `npm run dev`
2. Allez sur `http://localhost:5173`
3. Testez l'inscription avec un nouvel utilisateur
4. Testez la connexion avec les comptes de test
5. Vérifiez que les dashboards se chargent correctement

## 🔧 Dépannage

### Erreur de connexion
- Vérifiez que les variables d'environnement sont correctes
- Assurez-vous que le projet Supabase est actif
- Vérifiez les URLs de redirection

### Erreur RLS
- Vérifiez que l'utilisateur est bien authentifié
- Contrôlez les politiques RLS dans Supabase Dashboard

### Erreur de synchronisation
- Vérifiez que le trigger `handle_new_user` est actif
- Contrôlez que la table `users` existe

## 📊 Monitoring

Dans Supabase Dashboard :
- **Database** : Voir les tables et données
- **Authentication** : Gérer les utilisateurs
- **Storage** : Gérer les fichiers
- **Logs** : Voir les erreurs et requêtes
- **API Docs** : Documentation auto-générée

## 🚀 Déploiement

Pour la production :
1. Changez les URLs de redirection
2. Activez la confirmation email
3. Configurez un domaine personnalisé
4. Activez les sauvegardes automatiques
5. Configurez les alertes de monitoring