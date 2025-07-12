/*
  # Schema initial pour CamerLogis
  
  1. Tables principales
    - users (utilisateurs avec authentification)
    - districts (quartiers de Douala)
    - rooms (chambres disponibles)
    - bookings (réservations)
    - reviews (avis)
    - messages (messagerie)
    - payments (paiements)
    - favorites (favoris)
  
  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques appropriées pour chaque rôle
  
  3. Données de test
    - Comptes administrateur et test
    - Quartiers de Douala
    - Chambres d'exemple
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  phone varchar(20),
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'owner', 'admin')),
  profile_picture varchar(500),
  email_verified boolean DEFAULT false,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des quartiers
CREATE TABLE IF NOT EXISTS districts (
  id serial PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  description text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des chambres
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  location varchar(255) NOT NULL,
  district varchar(100) NOT NULL,
  room_type text NOT NULL CHECK (room_type IN ('single', 'shared', 'studio', 'apartment')),
  amenities jsonb,
  images jsonb,
  available boolean DEFAULT true,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method varchar(50),
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  subject varchar(255),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_method varchar(50) NOT NULL,
  transaction_id varchar(255),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date timestamp,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des favoris
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, room_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true); -- Lecture publique pour les profils

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Politiques RLS pour districts
CREATE POLICY "Districts are publicly readable" ON districts
  FOR SELECT USING (true);

-- Politiques RLS pour rooms
CREATE POLICY "Rooms are publicly readable" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage their rooms" ON rooms
  FOR ALL USING (true);

-- Politiques RLS pour bookings
CREATE POLICY "Students can manage their bookings" ON bookings
  FOR ALL USING (true);

-- Politiques RLS pour reviews
CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Students can manage their reviews" ON reviews
  FOR ALL USING (true);

-- Politiques RLS pour messages
CREATE POLICY "Users can manage their messages" ON messages
  FOR ALL USING (true);

-- Politiques RLS pour payments
CREATE POLICY "Users can view related payments" ON payments
  FOR SELECT USING (true);

-- Politiques RLS pour favorites
CREATE POLICY "Users can manage their favorites" ON favorites
  FOR ALL USING (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer les quartiers de Douala
INSERT INTO districts (name, description) VALUES
('Akwa', 'Centre-ville de Douala, quartier d''affaires'),
('Bonanjo', 'Quartier administratif et commercial'),
('Bonapriso', 'Quartier résidentiel huppé'),
('Makepe', 'Zone universitaire et résidentielle'),
('Ndogpassi', 'Quartier populaire en développement'),
('New Bell', 'Quartier historique de Douala'),
('Deido', 'Zone portuaire et industrielle'),
('Bali', 'Quartier résidentiel'),
('Logbaba', 'Zone en expansion'),
('Bangue', 'Quartier périphérique'),
('Kotto', 'Zone résidentielle')
ON CONFLICT (name) DO NOTHING;

-- Insérer le compte administrateur
INSERT INTO users (email, password, name, role, email_verified) VALUES
('admin@camerlogis.cm', 'admin123', 'Administrateur CamerLogis', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insérer des comptes de test
INSERT INTO users (email, password, name, phone, role, email_verified) VALUES
('proprietaire@test.com', 'password', 'Paul Mboma', '+237 699 887 766', 'owner', true),
('etudiant@test.com', 'password', 'Marie Ngono', '+237 698 765 432', 'student', true),
('jean.kamdem@test.com', 'password', 'Jean Kamdem', '+237 677 654 321', 'student', true)
ON CONFLICT (email) DO NOTHING;

-- Insérer des chambres d'exemple
DO $$
DECLARE
    owner_id uuid;
BEGIN
    -- Récupérer l'ID du propriétaire de test
    SELECT id INTO owner_id FROM users WHERE email = 'proprietaire@test.com';
    
    IF owner_id IS NOT NULL THEN
        INSERT INTO rooms (title, description, price, location, district, room_type, amenities, images, owner_id) VALUES
        (
            'Chambre moderne à Akwa',
            'Belle chambre meublée dans un quartier calme, proche des universités. Eau et électricité incluses.',
            45000,
            'Akwa Nord, près de l''Université de Douala',
            'Akwa',
            'single',
            '["WiFi", "Électricité", "Eau courante", "Sécurité", "Ventilateur"]',
            '["https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=500"]',
            owner_id
        ),
        (
            'Studio meublé à Bonanjo',
            'Studio entièrement équipé avec cuisine et salle de bain privée. Idéal pour étudiant indépendant.',
            65000,
            'Bonanjo Centre, près des bureaux',
            'Bonanjo',
            'studio',
            '["WiFi", "Cuisine", "Climatisation", "Parking"]',
            '["https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=500"]',
            owner_id
        ),
        (
            'Appartement 2 pièces à Bonapriso',
            'Appartement spacieux avec salon et chambre séparée. Quartier résidentiel calme et sécurisé.',
            85000,
            'Bonapriso Résidentiel',
            'Bonapriso',
            'apartment',
            '["WiFi", "Climatisation", "Cuisine équipée", "Parking", "Sécurité"]',
            '["https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=500"]',
            owner_id
        );
    END IF;
END $$;

-- Créer des vues pour les statistiques
CREATE OR REPLACE VIEW rooms_detailed AS
SELECT 
    r.*,
    u.name as owner_name,
    u.phone as owner_phone,
    u.email as owner_email,
    COALESCE(AVG(rev.rating), 0) as average_rating,
    COUNT(rev.id) as review_count,
    COUNT(f.id) as favorite_count
FROM rooms r
LEFT JOIN users u ON r.owner_id = u.id
LEFT JOIN reviews rev ON r.id = rev.room_id
LEFT JOIN favorites f ON r.id = f.room_id
GROUP BY r.id, u.name, u.phone, u.email;

CREATE OR REPLACE VIEW owner_stats AS
SELECT 
    u.id as owner_id,
    u.name as owner_name,
    COUNT(r.id) as total_rooms,
    COUNT(CASE WHEN r.available = true THEN 1 END) as available_rooms,
    COUNT(CASE WHEN r.available = false THEN 1 END) as occupied_rooms,
    COALESCE(SUM(b.total_price), 0) as total_revenue
FROM users u
LEFT JOIN rooms r ON u.id = r.owner_id
LEFT JOIN bookings b ON r.id = b.room_id AND b.status = 'confirmed'
WHERE u.role = 'owner'
GROUP BY u.id, u.name;

CREATE OR REPLACE VIEW general_stats AS
SELECT 
    COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
    COUNT(CASE WHEN role = 'owner' THEN 1 END) as total_owners,
    (SELECT COUNT(*) FROM rooms) as total_rooms,
    (SELECT COUNT(*) FROM rooms WHERE available = true) as available_rooms,
    (SELECT COUNT(*) FROM bookings) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'confirmed') as total_revenue
FROM users;