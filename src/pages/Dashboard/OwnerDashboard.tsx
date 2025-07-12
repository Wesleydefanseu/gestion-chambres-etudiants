import React, { useState, useEffect } from 'react';
import { Plus, Home, Users, DollarSign, Eye, Edit, Trash2, Calendar, MessageCircle, Star, TrendingUp, BarChart3, Search, Filter, ToggleLeft, ToggleRight, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';
import MessageCenter from '../../components/Messaging/MessageCenter';
import InvoiceGenerator from '../../components/Invoice/InvoiceGenerator';
import type { Room, Booking } from '../../types';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    grossRevenue: 0,
    commission: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);

  const [newRoom, setNewRoom] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    district: '',
    room_type: 'single',
    amenities: [] as string[],
    images: [] as string[]
  });

  useEffect(() => {
    fetchOwnerData();
  }, [user]);

  const fetchOwnerData = async () => {
    try {
      const [roomsResponse, bookingsResponse, statsResponse, paymentsResponse, messagesResponse] = await Promise.all([
        apiService.getOwnerRooms(),
        apiService.getOwnerBookings(),
        apiService.getOwnerStats(),
        apiService.getOwnerPayments(),
        apiService.getMessages()
      ]);

      if (roomsResponse.success) setRooms(roomsResponse.data);
      if (bookingsResponse.success) setBookings(bookingsResponse.data);
      if (statsResponse.success) setStats(statsResponse.data);
      if (paymentsResponse.success) setPayments(paymentsResponse.data);
      
      // Compter les messages non lus
      if (messagesResponse.success) {
        const unread = messagesResponse.data.filter((msg: any) => 
          !msg.is_read && msg.receiver_id === user?.id
        ).length;
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== GESTION DES CHAMBRES ====================

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roomData = {
        ...newRoom,
        price: parseFloat(newRoom.price)
      };
      
      const response = await apiService.createRoom(roomData);
      if (response.success) {
        setRooms([response.data, ...rooms]);
        setShowAddRoomModal(false);
        setNewRoom({
          title: '',
          description: '',
          price: '',
          location: '',
          district: '',
          room_type: 'single',
          amenities: [],
          images: []
        });
        alert(response.message);
        fetchOwnerData(); // Refresh stats
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de l\'ajout de la chambre');
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      const response = await apiService.updateRoom(editingRoom.id, {
        title: editingRoom.title,
        description: editingRoom.description,
        price: editingRoom.price,
        location: editingRoom.location,
        district: editingRoom.district,
        room_type: editingRoom.room_type,
        available: editingRoom.available
      });
      
      if (response.success) {
        setRooms(rooms.map(room => room.id === editingRoom.id ? response.data : room));
        setEditingRoom(null);
        alert(response.message);
        fetchOwnerData(); // Refresh stats
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la modification');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      try {
        const response = await apiService.deleteRoom(roomId);
        if (response.success) {
          setRooms(rooms.filter(room => room.id !== roomId));
          alert(response.message);
          fetchOwnerData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleRoomAvailability = async (roomId: string, available: boolean) => {
    try {
      const response = await apiService.toggleRoomAvailability(roomId, available);
      if (response.success) {
        setRooms(rooms.map(room => 
          room.id === roomId ? { ...room, available } : room
        ));
        alert(response.message);
        fetchOwnerData(); // Refresh stats
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // ==================== GESTION DES RÉSERVATIONS ====================

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await apiService.updateBooking(bookingId, { status });
      if (response.success) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: status as any } : booking
        ));
        alert(response.message);
        fetchOwnerData(); // Refresh stats
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        const response = await apiService.deleteBooking(bookingId);
        if (response.success) {
          setBookings(bookings.filter(booking => booking.id !== bookingId));
          alert(response.message);
          fetchOwnerData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  // ==================== ACTIONS EN LOT ====================

  const handleBulkDeleteRooms = async () => {
    if (selectedRooms.length === 0) {
      alert('Aucune chambre sélectionnée');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRooms.length} chambre(s) ?`)) {
      try {
        const response = await apiService.bulkDeleteRooms(selectedRooms);
        if (response.success) {
          setRooms(rooms.filter(room => !selectedRooms.includes(room.id)));
          setSelectedRooms([]);
          alert(response.message);
          fetchOwnerData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression en lot');
      }
    }
  };

  const handleBulkToggleAvailability = async (available: boolean) => {
    if (selectedRooms.length === 0) {
      alert('Aucune chambre sélectionnée');
      return;
    }

    try {
      const response = await apiService.bulkUpdateRoomStatus(selectedRooms, available);
      if (response.success) {
        setRooms(rooms.map(room => 
          selectedRooms.includes(room.id) ? { ...room, available } : room
        ));
        setSelectedRooms([]);
        alert(response.message);
        fetchOwnerData(); // Refresh stats
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour en lot');
    }
  };

  const handleViewInvoice = (payment: any) => {
    const booking = bookings.find(b => b.id === payment.booking_id);
    if (!booking) return;

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
          name: booking.student?.name || 'Étudiant',
          email: booking.student?.email || '',
          phone: booking.student?.phone
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.room?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'rooms', name: 'Mes chambres', icon: <Home className="w-5 h-5" /> },
    { id: 'bookings', name: 'Réservations', icon: <Calendar className="w-5 h-5" /> },
    { id: 'payments', name: 'Paiements', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'invoices', name: 'Factures', icon: <FileText className="w-5 h-5" /> },
    { 
      id: 'messages', 
      name: 'Messages', 
      icon: <MessageCircle className="w-5 h-5" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined
    }
  ];

  const districts = ['Akwa', 'Bonanjo', 'Bonapriso', 'Makepe', 'Ndogpassi', 'New Bell', 'Deido', 'Bali', 'Logbaba', 'Bangue', 'Kotto'];
  const amenitiesList = ['WiFi', 'Électricité', 'Eau courante', 'Climatisation', 'Ventilateur', 'Cuisine', 'Parking', 'Sécurité', 'Bureau', 'Armoire'];

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Tableau de bord propriétaire
            </h1>
            <p className="text-gray-600">
              Bienvenue, {user?.name}
            </p>
          </div>
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une chambre</span>
          </button>
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
                    setSelectedRooms([]);
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Home className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Mes chambres</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Disponibles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.availableRooms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Revenus nets</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.totalRevenue)} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance financière
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenus bruts</span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(stats.grossRevenue)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission plateforme (5%)</span>
                    <span className="font-bold text-red-600">
                      -{formatPrice(stats.commission)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-600">Revenus nets</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(stats.totalRevenue)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taux d'occupation</span>
                    <span className="font-bold text-blue-600">{stats.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stats.occupancyRate}%` }}
                    ></div>
                  </div>
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
                          {booking.room?.title || `Chambre #${booking.room_id}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.student?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(booking.total_price)} FCFA
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status === 'confirmed' ? 'Confirmée' :
                         booking.status === 'pending' ? 'En attente' : 'Annulée'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Mes chambres</h2>
                <div className="flex space-x-3">
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
                  <button
                    onClick={() => setShowAddRoomModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>
              
              {selectedRooms.length > 0 && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleBulkToggleAvailability(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <ToggleRight className="w-4 h-4" />
                    <span>Activer ({selectedRooms.length})</span>
                  </button>
                  <button
                    onClick={() => handleBulkToggleAvailability(false)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <ToggleLeft className="w-4 h-4" />
                    <span>Désactiver ({selectedRooms.length})</span>
                  </button>
                  <button
                    onClick={handleBulkDeleteRooms}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer ({selectedRooms.length})</span>
                  </button>
                </div>
              )}
            </div>
            
            {filteredRooms.length === 0 ? (
              <div className="p-8 text-center">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune chambre trouvée' : 'Aucune chambre ajoutée'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Essayez de modifier votre recherche'
                    : 'Commencez par ajouter votre première chambre pour commencer à recevoir des réservations.'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddRoomModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Ajouter une chambre
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedRooms.includes(room.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRooms([...selectedRooms, room.id]);
                            } else {
                              setSelectedRooms(selectedRooms.filter(id => id !== room.id));
                            }
                          }}
                          className="mt-1 rounded border-gray-300"
                        />
                        <img
                          src={room.images?.[0] || 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={room.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {room.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {room.district}, {room.location}
                          </p>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleToggleRoomAvailability(room.id, !room.available)}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                room.available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {room.available ? 'Disponible' : 'Occupée'}
                            </button>
                            <span className="text-sm text-gray-500">
                              {room.room_type === 'single' ? 'Chambre simple' :
                               room.room_type === 'shared' ? 'Chambre partagée' :
                               room.room_type === 'studio' ? 'Studio' : 'Appartement'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(room.price)} FCFA/mois
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <a
                            href={`/rooms/${room.id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setEditingRoom(room)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Réservations</h2>
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
            </div>
            
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucune réservation trouvée' : 'Aucune réservation'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Essayez de modifier votre recherche'
                    : 'Les réservations de vos chambres apparaîtront ici.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Réservation #{booking.id.slice(0, 8)}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {booking.room?.title || `Chambre #${booking.room_id}`}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Du {new Date(booking.start_date).toLocaleDateString('fr-FR')} 
                          au {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Étudiant: {booking.student?.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Contact: {booking.student?.phone || booking.student?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status === 'confirmed' ? 'Confirmée' :
                           booking.status === 'pending' ? 'En attente' : 'Annulée'}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatPrice(booking.total_price)} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.payment_status === 'paid' ? 'Payé' : 'En attente de paiement'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowMessageCenter(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Contacter l'étudiant</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Supprimer
                      </button>
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
                  Les paiements de vos réservations apparaîtront ici.
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
                          Étudiant: {payment.booking?.student?.name}
                        </p>
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
                          {payment.status === 'completed' ? 'Reçu' : 'En cours'}
                        </span>
                        <p className="text-lg font-bold text-green-600 mt-2">
                          +{formatPrice(payment.amount * 0.95)} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                          (Montant brut: {formatPrice(payment.amount)} FCFA)
                        </p>
                        <p className="text-xs text-red-500">
                          Commission: -{formatPrice(payment.amount * 0.05)} FCFA
                        </p>
                        <p className="text-xs text-gray-500">
                          Propriétaire: {formatPrice(payment.amount * 0.95)} FCFA
                        </p>
                        <div className="mt-2">
                          <button
                            onClick={() => handleViewInvoice(payment)}
                            className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center space-x-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Voir facture</span>
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

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Factures des paiements</h2>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune facture
                </h3>
                <p className="text-gray-600">
                  Les factures des paiements reçus apparaîtront ici.
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
                            {payment.booking?.room?.title}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Étudiant: {booking?.student?.name}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Date: {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{formatPrice(payment.amount * 0.95)} FCFA
                          </p>
                          <p className="text-sm text-gray-500">
                            (Montant brut: {formatPrice(payment.amount)} FCFA)
                          </p>
                          <p className="text-xs text-red-500">
                            Commission: -{formatPrice(payment.amount * 0.05)} FCFA
                          </p>
                          <div className="mt-2">
                            <button
                              onClick={() => handleViewInvoice(payment)}
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Voir facture</span>
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
      </div>

      {/* Message Center Modal */}
      {showMessageCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl h-[80vh]">
            <MessageCenter 
              onClose={() => {
                setShowMessageCenter(false);
                fetchOwnerData(); // Recharger pour mettre à jour le compteur
              }} 
            />
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter une nouvelle chambre</h3>
              
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRoom.title}
                      onChange={(e) => setNewRoom({...newRoom, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ex: Chambre moderne à Akwa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA/mois) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newRoom.price}
                      onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="45000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Décrivez votre chambre..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quartier *
                    </label>
                    <select
                      required
                      value={newRoom.district}
                      onChange={(e) => setNewRoom({...newRoom, district: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un quartier</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de chambre *
                    </label>
                    <select
                      required
                      value={newRoom.room_type}
                      onChange={(e) => setNewRoom({...newRoom, room_type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="single">Chambre simple</option>
                      <option value="shared">Chambre partagée</option>
                      <option value="studio">Studio</option>
                      <option value="apartment">Appartement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation précise *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom.location}
                    onChange={(e) => setNewRoom({...newRoom, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Akwa Nord, près de l'Université"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipements
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenitiesList.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newRoom.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRoom({...newRoom, amenities: [...newRoom.amenities, amenity]});
                            } else {
                              setNewRoom({...newRoom, amenities: newRoom.amenities.filter(a => a !== amenity)});
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddRoomModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Ajouter la chambre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Modifier la chambre</h3>
              
              <form onSubmit={handleEditRoom} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingRoom.title}
                      onChange={(e) => setEditingRoom({...editingRoom, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (FCFA/mois) *
                    </label>
                    <input
                      type="number"
                      required
                      value={editingRoom.price}
                      onChange={(e) => setEditingRoom({...editingRoom, price: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingRoom.description}
                    onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quartier *
                    </label>
                    <select
                      required
                      value={editingRoom.district}
                      onChange={(e) => setEditingRoom({...editingRoom, district: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disponibilité
                    </label>
                    <select
                      value={editingRoom.available ? 'true' : 'false'}
                      onChange={(e) => setEditingRoom({...editingRoom, available: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="true">Disponible</option>
                      <option value="false">Occupée</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingRoom(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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