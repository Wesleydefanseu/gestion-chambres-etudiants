# Guide d'installation CamerLogis

## Prérequis
- WAMP Server (Windows) ou XAMPP
- PHP 7.4 ou supérieur
- MySQL 5.7 ou supérieur
- Node.js 16 ou supérieur

## Installation de la base de données

### 1. Démarrer WAMP Server
- Lancez WAMP Server
- Assurez-vous que les services Apache et MySQL sont démarrés (icône verte)

### 2. Importer la base de données
1. Ouvrez votre navigateur et allez sur `http://localhost/phpmyadmin`
2. Connectez-vous avec vos identifiants MySQL (par défaut: root sans mot de passe)
3. Cliquez sur "Importer" dans le menu principal
4. Sélectionnez le fichier `camerlogis_db.sql`
5. Cliquez sur "Exécuter"

### 3. Vérification
- La base de données `camerlogis_db` devrait être créée
- Vérifiez que toutes les tables sont présentes:
  - users
  - rooms
  - bookings
  - reviews
  - messages
  - payments
  - favorites
  - districts

## Configuration du backend PHP (optionnel)

Si vous souhaitez créer l'API PHP pour connecter React à MySQL:

### 1. Structure des dossiers
```
C:/wamp64/www/camerlogis-api/
├── config/
│   └── database.php
├── controllers/
├── middleware/
├── routes/
└── index.php
```

### 2. Configuration de la base de données
Créez le fichier `config/database.php`:

```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "camerlogis_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
```

## Configuration de l'application React

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'API
Modifiez le fichier `src/lib/api.js` pour pointer vers votre serveur local:
```javascript
const API_BASE_URL = 'http://localhost/camerlogis-api';
```

### 3. Démarrage de l'application
```bash
npm run dev
```

## Comptes de test

Une fois la base de données importée, vous pouvez utiliser ces comptes de test:

### Administrateur
- Email: admin@camerlogis.cm
- Mot de passe: password

### Étudiant
- Email: etudiant@test.com
- Mot de passe: password

### Propriétaire
- Email: proprietaire@test.com
- Mot de passe: password

## Fonctionnalités disponibles

### Pour les étudiants:
- Recherche et filtrage des chambres
- Réservation de chambres
- Gestion des réservations
- Système de favoris
- Messagerie avec les propriétaires

### Pour les propriétaires:
- Ajout et gestion des chambres
- Gestion des réservations
- Statistiques et revenus
- Messagerie avec les étudiants

### Pour les administrateurs:
- Gestion complète des utilisateurs
- Modération des chambres
- Statistiques globales
- Gestion des paiements

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que MySQL est démarré dans WAMP
- Vérifiez les identifiants de connexion
- Assurez-vous que la base de données `camerlogis_db` existe

### Erreur CORS
Si vous développez l'API PHP, ajoutez ces headers:
```php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

### Port déjà utilisé
Si le port 5173 est occupé, Vite utilisera automatiquement le port suivant disponible.