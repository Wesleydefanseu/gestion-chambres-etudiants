import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, MapPin, SlidersHorizontal } from 'lucide-react';
import apiService from '../../lib/api';
import RoomCard from '../../components/UI/RoomCard';
import SearchFilters from '../../components/UI/SearchFilters';
import type { Room } from '../../types';

export default function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, rooms, sortBy]);

  const fetchRooms = async () => {
    try {
      const response = await apiService.getRooms({ available: true });
      setRooms(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des chambres:', error);
      // Données de démonstration en cas d'erreur
      setRooms([
        {
          id: '1',
          title: 'Chambre moderne à Akwa',
          description: 'Belle chambre meublée dans un quartier calme, proche des universités. Eau et électricité incluses.',
          price: 45000,
          location: 'Akwa Nord',
          district: 'Akwa',
          room_type: 'single',
          amenities: ['WiFi', 'Électricité', 'Eau courante', 'Sécurité'],
          images: ['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=500'],
          available: true,
          owner_id: '1',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          owner: {
            id: '1',
            name: 'Paul Mboma',
            email: 'paul@email.com',
            phone: '+237 699 887 766',
            role: 'owner',
            created_at: '2025-01-01'
          }
        },
        {
          id: '2',
          title: 'Studio meublé à Bonanjo',
          description: 'Studio entièrement équipé avec cuisine et salle de bain privée. Idéal pour étudiant indépendant.',
          price: 65000,
          location: 'Bonanjo Centre',
          district: 'Bonanjo',
          room_type: 'studio',
          amenities: ['WiFi', 'Cuisine', 'Climatisation', 'Parking'],
          images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=500'],
          available: true,
          owner_id: '2',
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
          owner: {
            id: '2',
            name: 'Marie Ange',
            email: 'marie@email.com',
            phone: '+237 698 765 432',
            role: 'owner',
            created_at: '2025-01-01'
          }
        },
        {
          id: '3',
          title: 'Chambre partagée à Makepe',
          description: 'Chambre dans appartement partagé avec 2 autres étudiants. Ambiance conviviale garantie.',
          price: 25000,
          location: 'Makepe Missoke',
          district: 'Makepe',
          room_type: 'shared',
          amenities: ['WiFi', 'Eau courante', 'Ventilateur', 'Cuisine partagée'],
          images: ['https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=500'],
          available: true,
          owner_id: '3',
          created_at: '2025-01-03',
          updated_at: '2025-01-03',
          owner: {
            id: '3',
            name: 'Jean Kamdem',
            email: 'jean@email.com',
            phone: '+237 677 654 321',
            role: 'owner',
            created_at: '2024-01-01'
          }
        },
        {
          id: '4',
          title: 'Appartement 2 pièces à Bonapriso',
          description: 'Appartement spacieux avec salon et chambre séparée. Quartier résidentiel calme.',
          price: 85000,
          location: 'Bonapriso Résidentiel',
          district: 'Bonapriso',
          room_type: 'apartment',
          amenities: ['WiFi', 'Climatisation', 'Cuisine équipée', 'Parking', 'Sécurité'],
          images: ['https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=500'],
          available: true,
          owner_id: '4',
          created_at: '2025-01-04',
          updated_at: '2025-01-04',
          owner: {
            id: '4',
            name: 'Sophie Kamdem',
            email: 'sophie@email.com',
            phone: '+237 677 998 877',
            role: 'owner',
            created_at: '2025-01-01'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...rooms];

    // Appliquer les filtres
    if (filters.search) {
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.district) {
      filtered = filtered.filter(room => room.district === filters.district);
    }

    if (filters.roomType) {
      filtered = filtered.filter(room => room.room_type === filters.roomType);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(room => room.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(room => room.price <= parseInt(filters.maxPrice));
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(room =>
        filters.amenities.some((amenity: string) =>
          room.amenities?.some(roomAmenity =>
            roomAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Appliquer le tri
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default:
        break;
    }

    setFilteredRooms(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des chambres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec recherche */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Trouvez votre chambre idéale
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Plus de {filteredRooms.length} chambres disponibles à Douala
            </p>
          </div>
          
          {/* Barre de recherche rapide */}
          <div className="max-w-4xl mx-auto">
            <SearchFilters onFilterChange={setFilters} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec contrôles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredRooms.length} chambre{filteredRooms.length > 1 ? 's' : ''} trouvée{filteredRooms.length > 1 ? 's' : ''}
            </h2>
            <p className="text-gray-600">
              Chambres étudiantes vérifiées à Douala
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Bouton filtres mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtres</span>
            </button>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="price_low">Prix croissant</option>
              <option value="price_high">Prix décroissant</option>
            </select>

            {/* Mode d'affichage */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filtres sidebar (desktop) */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <SearchFilters onFilterChange={setFilters} />
            </div>
          </div>

          {/* Liste des chambres */}
          <div className="flex-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <MapPin className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Aucune chambre trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos filtres ou de rechercher dans un autre quartier.
                </p>
                <button
                  onClick={() => setFilters({})}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-6'
              }>
                {filteredRooms.map((room) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onFavoriteChange={fetchRooms}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredRooms.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Précédent
                  </button>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    3
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}