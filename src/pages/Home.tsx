import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Shield, Users, Star, ArrowRight, Calendar, TrendingUp, Award, CheckCircle } from 'lucide-react';
import apiService from '../lib/api';
import RoomCard from '../components/UI/RoomCard';
import type { Room } from '../types';

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      const response = await apiService.getRooms({ available: true });
      setFeaturedRooms(response.data?.slice(0, 6) || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      // Données de démonstration avec images africaines
      setFeaturedRooms([
        {
          id: '1',
          title: 'Chambre moderne à Akwa',
          description: 'Belle chambre meublée dans un quartier calme',
          price: 45000,
          location: 'Akwa Nord',
          district: 'Akwa',
          room_type: 'single',
          amenities: ['WiFi', 'Électricité'],
          images: ['https://images.pexels.com/photos/6186810/pexels-photo-6186810.jpeg?auto=compress&cs=tinysrgb&w=500'],
          available: true,
          owner_id: '1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          title: 'Studio meublé à Bonanjo',
          description: 'Studio entièrement équipé avec cuisine',
          price: 65000,
          location: 'Bonanjo Centre',
          district: 'Bonanjo',
          room_type: 'studio',
          amenities: ['WiFi', 'Cuisine'],
          images: ['https://images.pexels.com/photos/6186808/pexels-photo-6186808.jpeg?auto=compress&cs=tinysrgb&w=500'],
          available: true,
          owner_id: '2',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ]);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedDistrict) params.set('district', selectedDistrict);
    window.location.href = `/rooms?${params.toString()}`;
  };

  const features = [
    {
      icon: <Search className="w-8 h-8 text-primary-600" />,
      title: 'Recherche intelligente',
      description: 'Trouvez rapidement la chambre idéale avec nos filtres avancés et notre IA'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Sécurisé & Vérifié',
      description: 'Toutes les chambres sont vérifiées et les paiements 100% sécurisés'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Communauté active',
      description: 'Rejoignez une communauté de 10,000+ étudiants et propriétaires'
    }
  ];

  const districts = [
    { name: 'Akwa', count: 45, image: 'https://images.pexels.com/photos/6186810/pexels-photo-6186810.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Centre-ville animé' },
    { name: 'Bonanjo', count: 32, image: 'https://images.pexels.com/photos/6186808/pexels-photo-6186808.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Quartier d\'affaires' },
    { name: 'Makepe', count: 28, image: 'https://images.pexels.com/photos/6186807/pexels-photo-6186807.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Proche universités' },
    { name: 'Bonapriso', count: 23, image: 'https://images.pexels.com/photos/6186809/pexels-photo-6186809.jpeg?auto=compress&cs=tinysrgb&w=300', description: 'Résidentiel huppé' }
  ];

  const testimonials = [
    {
      name: 'Aminata Diallo',
      role: 'Étudiante en Médecine',
      content: 'KmerLogis m\'a aidé à trouver une chambre parfaite près de l\'université. Le processus était simple et sécurisé.',
      rating: 5,
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      name: 'Kwame Asante',
      role: 'Propriétaire',
      content: 'Excellent service ! J\'ai pu louer toutes mes chambres rapidement grâce à cette plateforme.',
      rating: 5,
      image: 'https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      name: 'Fatou Mbaye',
      role: 'Étudiante en Ingénierie',
      content: 'Interface intuitive et support client réactif. Je recommande vivement !',
      rating: 5,
      image: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Étudiants satisfaits', icon: <Users className="w-6 h-6" /> },
    { number: '2,500+', label: 'Chambres disponibles', icon: <MapPin className="w-6 h-6" /> },
    { number: '500+', label: 'Propriétaires partenaires', icon: <Award className="w-6 h-6" /> },
    { number: '98%', label: 'Taux de satisfaction', icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Trouvez votre
              <span className="block text-cameroon-yellow">logement étudiant</span>
              à Douala
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-100">
              La plateforme de référence pour les chambres étudiantes au Cameroun. 
              Plus de 2,500 chambres vérifiées vous attendent.
            </p>
          </div>
          
          {/* Barre de recherche principale */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Où cherchez-vous ?
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Tous les quartiers</option>
                    {districts.map(district => (
                      <option key={district.name} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Que recherchez-vous ?
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Chambre, studio, appartement..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>Rechercher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/rooms"
              className="bg-cameroon-yellow text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-yellow-400 transition-colors text-lg inline-flex items-center justify-center space-x-2"
            >
              <span>Explorer toutes les chambres</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register?role=owner"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors text-lg inline-flex items-center justify-center space-x-2"
            >
              <span>Devenir propriétaire</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quartiers populaires */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Quartiers populaires
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez les meilleurs quartiers pour étudiants à Douala
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {districts.map((district) => (
              <Link
                key={district.name}
                to={`/rooms?district=${district.name}`}
                className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={district.image}
                    alt={district.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{district.name}</h3>
                  <p className="text-sm text-gray-200 mb-2">{district.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{district.count} chambres</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Pourquoi choisir KmerLogis ?
            </h2>
            <p className="text-xl text-gray-600">
              Une solution complète pour tous vos besoins de logement étudiant
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl hover:bg-gray-50 transition-colors group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary-100 rounded-2xl group-hover:bg-primary-200 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chambres en vedette */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Chambres en vedette
              </h2>
              <p className="text-xl text-gray-600">
                Découvrez nos meilleures offres du moment
              </p>
            </div>
            <Link
              to="/rooms"
              className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <span>Voir toutes les chambres</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/rooms"
              className="bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors font-semibold inline-flex items-center space-x-2"
            >
              <span>Voir toutes les chambres</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 10,000 étudiants nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Prêt à trouver votre chambre idéale ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui ont trouvé leur logement parfait sur KmerLogis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-cameroon-yellow text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-yellow-400 transition-colors text-lg inline-flex items-center justify-center space-x-2"
            >
              <span>Commencer maintenant</span>
              <CheckCircle className="w-5 h-5" />
            </Link>
            <Link
              to="/rooms"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors text-lg"
            >
              Explorer les chambres
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}