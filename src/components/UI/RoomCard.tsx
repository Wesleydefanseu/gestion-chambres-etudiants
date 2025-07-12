import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, Wifi, Car, Utensils, Zap, Heart, Share2, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';
import type { Room } from '../../types';

interface RoomCardProps {
  room: Room;
  onFavoriteChange?: () => void;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
  cuisine: <Utensils className="w-4 h-4" />,
  électricité: <Zap className="w-4 h-4" />,
};

export default function RoomCard({ room, onFavoriteChange }: RoomCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getRoomTypeLabel = (type: string) => {
    const labels = {
      single: 'Chambre simple',
      shared: 'Chambre partagée',
      studio: 'Studio',
      apartment: 'Appartement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await apiService.removeFromFavorites(room.id);
        setIsFavorite(false);
      } else {
        await apiService.addToFavorites(room.id);
        setIsFavorite(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: room.title,
          text: `Découvrez cette chambre: ${room.title}`,
          url: `${window.location.origin}/rooms/${room.id}`
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(`${window.location.origin}/rooms/${room.id}`);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const defaultImage = "https://images.pexels.com/photos/6186810/pexels-photo-6186810.jpeg?auto=compress&cs=tinysrgb&w=400";

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative">
        <Link to={`/rooms/${room.id}`}>
          <img
            src={room.images?.[0] || defaultImage}
            alt={room.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Overlay avec actions */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            className={`p-2 backdrop-blur-sm rounded-full shadow-md transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 hover:bg-white text-gray-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Badge de disponibilité */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            room.available 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {room.available ? 'Disponible' : 'Occupée'}
          </span>
        </div>

        {/* Prix en overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(room.price)} FCFA
            </span>
            <span className="text-sm text-gray-600">/mois</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <Link to={`/rooms/${room.id}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {room.title}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 font-medium">4.8</span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{room.district}, {room.location}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-3">
            <Users className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{getRoomTypeLabel(room.room_type)}</span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {room.description}
          </p>

          {/* Amenities */}
          <div className="flex items-center space-x-3 mb-4">
            {room.amenities?.slice(0, 4).map((amenity, index) => (
              <div key={index} className="flex items-center space-x-1 text-gray-500">
                {amenityIcons[amenity.toLowerCase()] || <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                <span className="text-xs">{amenity}</span>
              </div>
            ))}
            {room.amenities?.length > 4 && (
              <span className="text-xs text-gray-500 font-medium">+{room.amenities.length - 4}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {room.owner?.name?.charAt(0) || 'P'}
                </span>
              </div>
              <span className="text-sm text-gray-600">{room.owner?.name || 'Propriétaire'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {new Date(room.created_at).toLocaleDateString('fr-FR')}
              </span>
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}