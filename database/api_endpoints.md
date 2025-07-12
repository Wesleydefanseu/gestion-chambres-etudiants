# Documentation API CamerLogis

## Configuration de base
- URL de base: `http://localhost/camerlogis-api`
- Format de réponse: JSON
- Authentification: Bearer Token (JWT)

## Endpoints d'authentification

### POST /auth/register
Inscription d'un nouvel utilisateur
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "student|owner"
}
```

### POST /auth/login
Connexion utilisateur
```json
{
  "email": "string",
  "password": "string"
}
```

### POST /auth/logout
Déconnexion utilisateur (nécessite authentification)

### GET /auth/me
Récupérer les informations de l'utilisateur connecté

### PUT /auth/profile
Mettre à jour le profil utilisateur

## Endpoints des chambres

### GET /rooms
Récupérer la liste des chambres
Paramètres optionnels:
- `district`: Filtrer par quartier
- `room_type`: Filtrer par type
- `min_price`: Prix minimum
- `max_price`: Prix maximum
- `available`: Disponibilité (1 ou 0)

### GET /rooms/{id}
Récupérer une chambre spécifique

### POST /rooms
Créer une nouvelle chambre (propriétaires uniquement)

### PUT /rooms/{id}
Mettre à jour une chambre (propriétaire uniquement)

### DELETE /rooms/{id}
Supprimer une chambre (propriétaire uniquement)

### GET /rooms/owner
Récupérer les chambres du propriétaire connecté

## Endpoints des réservations

### GET /bookings
Récupérer toutes les réservations (admin uniquement)

### GET /bookings/{id}
Récupérer une réservation spécifique

### POST /bookings
Créer une nouvelle réservation

### PUT /bookings/{id}
Mettre à jour une réservation

### POST /bookings/{id}/cancel
Annuler une réservation

### GET /bookings/student
Récupérer les réservations de l'étudiant connecté

### GET /bookings/owner
Récupérer les réservations des chambres du propriétaire connecté

## Endpoints des avis

### GET /rooms/{id}/reviews
Récupérer les avis d'une chambre

### POST /reviews
Créer un nouvel avis

## Endpoints des favoris

### GET /favorites
Récupérer les favoris de l'utilisateur connecté

### POST /favorites
Ajouter une chambre aux favoris

### DELETE /favorites/{room_id}
Retirer une chambre des favoris

## Endpoints des messages

### GET /messages
Récupérer les messages de l'utilisateur connecté

### POST /messages
Envoyer un nouveau message

### POST /messages/{id}/read
Marquer un message comme lu

## Endpoints des statistiques

### GET /stats/owner
Statistiques du propriétaire connecté

### GET /stats/admin
Statistiques générales (admin uniquement)

## Endpoints utilitaires

### GET /districts
Récupérer la liste des quartiers

### POST /upload/image
Upload d'une image

## Codes de réponse HTTP

- 200: Succès
- 201: Créé avec succès
- 400: Erreur de validation
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 500: Erreur serveur

## Format de réponse standard

### Succès
```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### Erreur
```json
{
  "success": false,
  "error": "string",
  "message": "string"
}
```