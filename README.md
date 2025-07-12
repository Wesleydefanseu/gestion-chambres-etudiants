 Gestion de Chambres Étudiantes – Douala 

Application web développée dans le cadre d’un projet tutoré à l’Institut Universitaire de la Côte (IUC), destinée à faciliter la gestion de logements étudiants dans la ville de Douala, Cameroun.

## Objectif du projet

Permettre aux étudiants de :
- Rechercher des chambres disponibles
- Réserver en ligne
- Gérer leurs réservations, avis et messages

Permettre aux gestionnaires de :
- Administrer les logements
- Gérer les utilisateurs, réservations et avis

## Technologies utilisées

| Côté       | Stack                      |
|------------|----------------------------|
| **Frontend** | React.js, TypeScript, Tailwind CSS |
| **Backend**  | Supabase (Auth, API REST) |
| **Base de données** | PostgreSQL (via Supabase) |


## Fonctionnalités principales

- Recherche et consultation des chambres disponibles
- Réservation en ligne
- Système de favoris
- Ajout d’avis sur les chambres
- Authentification sécurisée (Supabase Auth)
- nterface admin (gestion utilisateurs, logements, réservations)
- Design responsive et intuitif

## Architecture

L’application suit une architecture **frontend-backend découplée** :

- Le frontend (React) consomme les API REST de Supabase
- Supabase agit comme backend et gestionnaire de base de données
- Authentification via Supabase Auth avec gestion des rôles

## Lancer le projet en local

### 1. Cloner le repo
```bash
git clone https://github.com/ton-utilisateur/gestion-chambres-etudiantes.git
cd gestion-chambres-etudiantes
