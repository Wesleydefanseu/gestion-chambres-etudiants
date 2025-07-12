import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Star, Wifi, Car, Utensils, Zap, Phone, Mail, Calendar, ArrowLeft, Heart, Share2, MessageCircle, Shield, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';
import type { Room, Review } from '../../types';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [contactData, setContactData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (id) {
      fetchRoomDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const response = await apiService.getRoom(id!);
      setRoom(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      // Données de démonstration
      const mockRoom: Room = {
        id: id || '1',
        title: 'Chambre moderne à Akwa',
        description: 'Belle chambre meublée dans un quartier calme, proche des universités. Cette chambre spacieuse offre tout le confort nécessaire pour un étudiant. Elle est située dans un immeuble sécurisé avec gardien 24h/24. L\'eau et l\'électricité sont incluses dans le loyer. Transport facile vers toutes les universités de Douala.',
        price: 45000,
        location: 'Akwa Nord, près de l\'Université de Douala',
        district: 'Akwa',
        room_type: 'single',
        amenities: ['WiFi', 'Électricité', 'Eau courante', 'Sécurité', 'Ventilateur', 'Bureau', 'Armoire', 'Matelas'],
        images: [
          'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        available: true,
        owner_id: 'owner-001',
        owner: {
          id: 'owner-001',
          name: 'Paul Mboma',
          email: 'paul.mboma@email.com',
          phone: '+237 699 887 766',
          role: 'owner',
          created_at: '2024-01-01'
        },
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };
      setRoom(mockRoom);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiService.getReviews(id!);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      // Avis de démonstration
      setReviews([
        {
          id: '1',
          room_id: id || '1',
          student_id: 'student-001',
          rating: 5,
          comment: 'Excellente chambre ! Très propre et bien située. Le propriétaire est très sympa et réactif. Je recommande vivement !',
          created_at: '2025-01-15',
          updated_at: '2025-01-15',
          student: {
            id: 'student-001',
            name: 'Marie Ngono',
            email: 'marie@email.com',
            role: 'student',
            created_at: '2025-01-01'
          }
        },
        {
          id: '2',
          room_id: id || '1',
          student_id: 'student-002',
          rating: 4,
          comment: 'Bonne chambre dans l\'ensemble. Seul petit bémol : un peu bruyant le soir à cause de la route. Mais sinon parfait pour étudier.',
          created_at: '2025-01-10',
          updated_at: '2025-01-10',
          student: {
            id: 'student-002',
            name: 'Jean Kamdem',
            email: 'jean@email.com',
            role: 'student',
            created_at: '2025-01-01'
          }
        }
      ]);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Veuillez sélectionner les dates de séjour');
      return;
    }

    try {
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const totalPrice = room!.price * months;

      await apiService.createBooking({
        room_id: room!.id,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_price: totalPrice,
        notes: bookingData.notes
      });

      alert('Demande de réservation envoyée avec succès !');
      setShowBookingModal(false);
      setBookingData({ startDate: '', endDate: '', notes: '' });
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await apiService.sendMessage({
        receiver_id: room!.owner_id,
        room_id: room!.id,
        subject: contactData.subject,
        message: contactData.message
      });

      alert('Message envoyé avec succès !');
      setShowContactModal(false);
      setContactData({ subject: '', message: '' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await apiService.removeFromFavorites(room!.id);
        setIsFavorite(false);
      } else {
        await apiService.addToFavorites(room!.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: room!.title,
          text: `Découvrez cette chambre: ${room!.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-5 h-5" />,
    parking: <Car className="w-5 h-5" />,
    cuisine: <Utensils className="w-5 h-5" />,
    électricité: <Zap className="w-5 h-5" />,
  };

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

  const calculateMonths = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 30);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chambre non trouvée</h2>
          <Link to="/rooms" className="text-primary-600 hover:text-primary-700">
            Retour aux chambres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Partager</span>
              </button>
              <button
                onClick={toggleFavorite}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">
                  {isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galerie d'images */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-2 h-96">
                <div className="col-span-2 row-span-2">
                  <img
                    src={room.images[0]}
                    alt={room.title}
                    className="w-full h-full object-cover rounded-l-xl cursor-pointer"
                    onClick={() => setShowImageGallery(true)}
                  />
                </div>
                {room.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Photo ${index + 2}`}
                      className={`w-full h-full object-cover cursor-pointer ${
                        index === 1 ? 'rounded-tr-xl' : 
                        index === 3 ? 'rounded-br-xl' : ''
                      }`}
                      onClick={() => setShowImageGallery(true)}
                    />
                    {index === 3 && room.images.length > 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-br-xl">
                        <div className="text-white text-center">
                          <Camera className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-sm font-medium">+{room.images.length - 5}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowImageGallery(true)}
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Voir toutes les photos</span>
              </button>
            </div>

            {/* Informations de la chambre */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-1" />
                      <span>{getRoomTypeLabel(room.room_type)}</span>
                    </div>
                    {reviews.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({reviews.length} avis)</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 text-sm font-medium">Vérifié</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">À propos de cette chambre</h3>
                <p className="text-gray-600 leading-relaxed">{room.description}</p>
              </div>
            </div>

            {/* Équipements */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Équipements inclus</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {amenityIcons[amenity.toLowerCase()] || <CheckCircle className="w-5 h-5 text-green-500" />}
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avis */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Avis des étudiants ({reviews.length})
                </h3>
                {reviews.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun avis pour le moment</p>
                  <p className="text-gray-400 text-sm">Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-lg">
                            {review.student?.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{review.student?.name}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar de réservation */}
          <div className="space-y-6">
            {/* Carte de réservation */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(room.price)} FCFA
                </div>
                <div className="text-gray-600">par mois</div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                  room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {room.available ? 'Disponible maintenant' : 'Occupée'}
                </span>
              </div>

              {room.available && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-primary-600 text-white py-4 rounded-xl hover:bg-primary-700 transition-colors font-semibold text-lg"
                  >
                    Réserver maintenant
                  </button>
                  
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center justify-center space-x-2 border-2 border-primary-600 text-primary-600 py-3 rounded-xl hover:bg-primary-50 transition-colors font-semibold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Contacter le propriétaire</span>
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Paiement sécurisé • Annulation gratuite
                </div>
              </div>
            </div>

            {/* Informations du propriétaire */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Votre hôte</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-xl">
                    {room.owner?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{room.owner?.name}</div>
                  <div className="text-sm text-gray-500">Propriétaire vérifié</div>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.9 • 127 avis</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{room.owner?.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{room.owner?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Répond généralement en moins d'une heure</span>
                </div>
              </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Conseils de sécurité
              </h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Visitez toujours la chambre avant de payer</li>
                <li>• Ne payez jamais d'avance sans avoir signé un contrat</li>
                <li>• Vérifiez l'identité du propriétaire</li>
                <li>• Gardez tous les reçus de paiement</li>
                <li>• Utilisez notre système de paiement sécurisé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Réserver cette chambre</h3>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message pour le propriétaire (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Présentez-vous et expliquez vos besoins..."
                />
              </div>

              {calculateMonths() > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span>Durée:</span>
                    <span className="font-medium">{calculateMonths()} mois</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total estimé:</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {formatPrice(room.price * calculateMonths())} FCFA
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  Confirmer la réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de contact */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contacter le propriétaire</h3>
            
            <form onSubmit={handleContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  required
                  value={contactData.subject}
                  onChange={(e) => setContactData({...contactData, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Question sur la chambre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactData.message}
                  onChange={(e) => setContactData({...contactData, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Bonjour, je suis intéressé(e) par votre chambre..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  Envoyer le message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Galerie d'images en plein écran */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">
                {selectedImage + 1} / {room.images.length}
              </h3>
              <button
                onClick={() => setShowImageGallery(false)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <img
              src={room.images[selectedImage]}
              alt={`Photo ${selectedImage + 1}`}
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {room.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}