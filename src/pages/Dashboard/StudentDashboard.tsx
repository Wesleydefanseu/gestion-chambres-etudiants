import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Star, AlertCircle, CreditCard, Heart, MessageCircle, Search, Filter, Trash2, Eye, Phone, FileText, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';
import MessageCenter from '../../components/Messaging/MessageCenter';
import PaymentModal from '../../components/Payment/PaymentModal';
import InvoiceGenerator from '../../components/Invoice/InvoiceGenerator';
import type { Booking, Room } from '../../types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Room[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const [bookingsResponse, favoritesResponse, paymentsResponse, messagesResponse] = await Promise.all([
        apiService.getStudentBookings(),
        apiService.getFavorites(),
        apiService.getStudentPayments(),
        apiService.getMessages()
      ]);

      if (bookingsResponse.success) setBookings(bookingsResponse.data);
      if (favoritesResponse.success) setFavorites(favoritesResponse.data);
      if (paymentsResponse.success) setPayments(paymentsResponse.data);
      
      // Compter les messages non lus
      if (messagesResponse.success) {
        const unread = messagesResponse.data.filter((msg: any) => 
          !msg.is_read && msg.receiver_id === user?.id
        ).length;
        setUnreadMessages(unread);
      }
      
      // Simuler l'historique de recherche
      setSearchHistory(['Akwa', 'Bonanjo', 'Studio meublé']);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== GESTION DES RÉSERVATIONS ====================

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      try {
        const response = await apiService.cancelBooking(bookingId);
        if (response.success) {
          setBookings(bookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' as const }
              : booking
          ));
          alert(response.message);
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de l\'annulation de la réservation');
      }
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        const response = await apiService.deleteBooking(bookingId);
        if (response.success) {
          setBookings(bookings.filter(booking => booking.id !== bookingId));
          alert(response.message);
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handlePayBooking = (booking: any) => {
    setSelectedBookingForPayment({
      id: booking.id,
      room_title: booking.room?.title || 'Chambre',
      total_price: booking.total_price,
      start_date: booking.start_date,
      end_date: booking.end_date
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      const response = await apiService.createPayment(paymentData);
      if (response.success) {
        // Mettre à jour la réservation
        setBookings(bookings.map(booking => 
          booking.id === paymentData.booking_id 
            ? { ...booking, payment_status: 'paid' as const, status: 'confirmed' as const }
            : booking
        ));
        
        // Recharger les paiements
        const paymentsResponse = await apiService.getStudentPayments();
        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data);
        }
        
        alert('Paiement effectué avec succès !');
        setShowPaymentModal(false);
        setSelectedBookingForPayment(null);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de l\'enregistrement du paiement');
    }
  };

  // ==================== GESTION DES FAVORIS ====================

  const handleRemoveFromFavorites = async (roomId: string) => {
    try {
      const response = await apiService.removeFromFavorites(roomId);
      if (response.success) {
        setFavorites(favorites.filter(room => room.id !== roomId));
        alert(response.message);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  // ==================== ACTIONS EN LOT ====================

  const handleBulkCancelBookings = async () => {
    if (selectedBookings.length === 0) {
      alert('Aucune réservation sélectionnée');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir annuler ${selectedBookings.length} réservation(s) ?`)) {
      try {
        const promises = selectedBookings.map(id => apiService.cancelBooking(id));
        await Promise.all(promises);
        
        setBookings(bookings.map(booking => 
          selectedBookings.includes(booking.id) 
            ? { ...booking, status: 'cancelled' as const }
            : booking
        ));
        setSelectedBookings([]);
        alert(`${selectedBookings.length} réservation(s) annulée(s) avec succès`);
      } catch (error) {
        alert('Erreur lors de l\'annulation en lot');
      }
    }
  };

  const handleBulkDeleteBookings = async () => {
    if (selectedBookings.length === 0) {
      alert('Aucune réservation sélectionnée');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedBookings.length} réservation(s) ?`)) {
      try {
        const promises = selectedBookings.map(id => apiService.deleteBooking(id));
        await Promise.all(promises);
        
        setBookings(bookings.filter(booking => !selectedBookings.includes(booking.id)));
        setSelectedBookings([]);
        alert(`${selectedBookings.length} réservation(s) supprimée(s) avec succès`);
      } catch (error) {
        alert('Erreur lors de la suppression en lot');
      }
    }
  };

  const handleBulkRemoveFavorites = async () => {
    if (selectedFavorites.length === 0) {
      alert('Aucun favori sélectionné');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir retirer ${selectedFavorites.length} favori(s) ?`)) {
      try {
        const promises = selectedFavorites.map(id => apiService.removeFromFavorites(id));
        await Promise.all(promises);
        
        setFavorites(favorites.filter(room => !selectedFavorites.includes(room.id)));
        setSelectedFavorites([]);
        alert(`${selectedFavorites.length} favori(s) retiré(s) avec succès`);
      } catch (error) {
        alert('Erreur lors de la suppression en lot');
      }
    }
  };

  const handleViewInvoice = (booking: any, payment: any) => {
    const invoiceData = {
      id: `INV-${payment.id.slice(0, 8)}`,
      booking: {
        id: booking.id,
        room: {
          title: booking.room?.title || 'Chambre',
          location: booking.room?.location || 'Douala',
          district: booking.room?.district || 'Akwa'
        },
        student: {
          name: user?.name || 'Étudiant',
          email: user?.email || '',
          phone: user?.phone
        },
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_price: booking.total_price
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        payment_date: payment.payment_date
      }
    };
    
    setSelectedInvoiceData(invoiceData);
    setShowInvoiceModal(true);
  };

  // ==================== UTILITAIRES ====================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Fonction pour déterminer si le bouton de paiement doit être affiché
  const shouldShowPayButton = (booking: any) => {
    return booking.payment_status === 'pending' && booking.status !== 'cancelled';
  };

  const filteredBookings = bookings.filter(booking =>
    booking.room?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFavorites = favorites.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: <Calendar className="w-5 h-5" /> },
    { id: 'bookings', name: 'Mes réservations', icon: <Calendar className="w-5 h-5" /> },
    { id: 'payments', name: 'Mes paiements', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'invoices', name: 'Mes factures', icon: <FileText className="w-5 h-5" /> },
    { id: 'favorites', name: 'Mes favoris', icon: <Heart className="w-5 h-5" /> },
    { id: 'search', name: 'Recherche', icon: <Search className="w-5 h-5" /> },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: <MessageCircle className="w-5 h-5" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Tableau de bord étudiant
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.name}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedBookings([]);
                    setSelectedFavorites([]);
                    setSearchTerm('');
                    if (tab.id === 'messages') {
                      setShowMessageCenter(true);
                    }
                  }}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm relative ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Réservations actives</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter(b => b.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Favoris</p>
                    <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Paiements</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {payments.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions rapides
                </h3>
                <div className="space-y-3">
                  <a
                    href="/rooms"
                    className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Rechercher des chambres
                  </a>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Voir mes favoris
                  </button>
                  <button 
                    onClick={() => setShowMessageCenter(true)}
                    className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Mes messages</span>
                    {unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Réservations récentes
                </h3>
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.room?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(booking.total_price)} FCFA
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        {shouldShowPayButton(booking) && (
                          <button
                            onClick={() => handlePayBooking(booking)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            Payer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Mes réservations</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {selectedBookings.length > 0 && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleBulkCancelBookings}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Annuler ({selectedBookings.length})</span>
                  </button>
                  <button
                    onClick={handleBulkDeleteBookings}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer ({selectedBookings.length})</span>
                  </button>
                </div>
              )}
            </div>
            
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune réservation trouvée' : 'Aucune réservation'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Essayez de modifier votre recherche'
                    : 'Vous n\'avez pas encore de réservation. Explorez nos chambres disponibles.'
                  }
                </p>
                {!searchTerm && (
                  <a
                    href="/rooms"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Rechercher des chambres
                  </a>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookings([...selectedBookings, booking.id]);
                            } else {
                              setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                            }
                          }}
                          className="mt-1 rounded border-gray-300"
                        />
                        <img
                          src={booking.room?.images?.[0] || 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={booking.room?.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.room?.title}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{booking.room?.district}, {booking.room?.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              Du {new Date(booking.start_date).toLocaleDateString('fr-FR')} 
                              au {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                          {/* Bouton de paiement disponible seulement si payment_status est 'pending' et status n'est pas 'cancelled' */}
                          {shouldShowPayButton(booking) && (
                            <button
                              onClick={() => handlePayBooking(booking)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Payer</span>
                            </button>
                          )}
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(booking.total_price)} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.payment_status === 'paid' ? (
                            <span className="text-green-600 font-medium">✓ Payé</span>
                          ) : (
                            <span className="text-orange-600 font-medium">⏳ En attente de paiement</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={`/rooms/${booking.room_id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir détails</span>
                      </a>
                      
                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <button 
                          onClick={() => setShowMessageCenter(true)}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Contacter le propriétaire</span>
                        </button>
                      )}
                      
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                        >
                          Annuler
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                      
                      {/* Bouton de paiement principal - affiché seulement si nécessaire */}
                      {shouldShowPayButton(booking) && (
                        <button 
                          onClick={() => handlePayBooking(booking)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Payer maintenant</span>
                        </button>
                      )}
                      
                      {/* Bouton facture - affiché seulement si payé */}
                      {booking.payment_status === 'paid' && (
                        <button 
                          onClick={() => {
                            const payment = payments.find(p => p.booking_id === booking.id);
                            if (payment) {
                              handleViewInvoice(booking, payment);
                            }
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Voir la facture</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Mes paiements</h2>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun paiement
                </h3>
                <p className="text-gray-600">
                  Vos paiements apparaîtront ici après vos réservations.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.booking?.room?.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Transaction ID: {payment.transaction_id}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Méthode: {payment.payment_method?.toUpperCase()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Date: {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'completed' ? 'Payé' : 'En cours'}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          {formatPrice(payment.amount)} FCFA
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Mes factures</h2>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune facture
                </h3>
                <p className="text-gray-600">
                  Vos factures apparaîtront ici après vos paiements.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const booking = bookings.find(b => b.id === payment.booking_id);
                  return (
                    <div key={payment.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Facture #{payment.id.slice(0, 8)}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {booking?.room?.title || 'Chambre'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Date: {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Transaction: {payment.transaction_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(payment.amount)} FCFA
                          </p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Payée
                          </span>
                          <div className="mt-2">
                            <button
                              onClick={() => handleViewInvoice(booking, payment)}
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Télécharger</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Mes chambres favorites</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {selectedFavorites.length > 0 && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleBulkRemoveFavorites}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Retirer ({selectedFavorites.length})</span>
                  </button>
                </div>
              )}
            </div>
            
            {filteredFavorites.length === 0 ? (
              <div className="p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucun favori trouvé' : 'Aucune chambre favorite'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Essayez de modifier votre recherche'
                    : 'Ajoutez des chambres à vos favoris pour les retrouver facilement'
                  }
                </p>
                {!searchTerm && (
                  <a
                    href="/rooms"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Parcourir les chambres
                  </a>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {filteredFavorites.map((room) => (
                  <div key={room.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src={room.images?.[0] || 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={room.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedFavorites.includes(room.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFavorites([...selectedFavorites, room.id]);
                            } else {
                              setSelectedFavorites(selectedFavorites.filter(id => id !== room.id));
                            }
                          }}
                          className="rounded border-gray-300 bg-white/90"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{room.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{room.district}, {room.location}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(room.price)} FCFA/mois
                        </span>
                        <div className="flex space-x-2">
                          <a
                            href={`/rooms/${room.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Voir
                          </a>
                          <button
                            onClick={() => handleRemoveFromFavorites(room.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Quick Search */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recherche rapide
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quartier
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Tous les quartiers</option>
                    <option value="Akwa">Akwa</option>
                    <option value="Bonanjo">Bonanjo</option>
                    <option value="Bonapriso">Bonapriso</option>
                    <option value="Makepe">Makepe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix maximum
                  </label>
                  <input
                    type="number"
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Tous les types</option>
                    <option value="single">Chambre simple</option>
                    <option value="shared">Chambre partagée</option>
                    <option value="studio">Studio</option>
                    <option value="apartment">Appartement</option>
                  </select>
                </div>
              </div>
              <a
                href="/rooms"
                className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-block"
              >
                Rechercher
              </a>
            </div>

            {/* Search History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recherches récentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </span>
                ))}
              </div>
            </div>

            {/* Saved Searches */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Alertes de recherche
              </h3>
              <p className="text-gray-600 mb-4">
                Créez des alertes pour être notifié quand de nouvelles chambres correspondent à vos critères.
              </p>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Créer une alerte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Center Modal */}
      {showMessageCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl h-[80vh]">
            <MessageCenter 
              onClose={() => {
                setShowMessageCenter(false);
                fetchStudentData(); // Recharger pour mettre à jour le compteur
              }} 
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBookingForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
          }}
          booking={selectedBookingForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoiceData && (
        <InvoiceGenerator
          invoiceData={selectedInvoiceData}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoiceData(null);
          }}
        />
      )}
    </div>
  );
}