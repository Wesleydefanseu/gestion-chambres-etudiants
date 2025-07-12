import React, { useState, useEffect } from 'react';
import { Users, Home, Calendar, DollarSign, TrendingUp, Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, MessageCircle, CreditCard, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';
import MessageCenter from '../../components/Messaging/MessageCenter';
import InvoiceGenerator from '../../components/Invoice/InvoiceGenerator';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    commission: 0,
    pendingBookings: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student'
  });

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [usersResponse, roomsResponse, bookingsResponse, paymentsResponse, statsResponse, messagesResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllRooms(),
        apiService.getAllBookings(),
        apiService.getPayments(),
        apiService.getAdminStats(),
        apiService.getMessages()
      ]);

      if (usersResponse.success) setUsers(usersResponse.data);
      if (roomsResponse.success) setRooms(roomsResponse.data);
      if (bookingsResponse.success) setBookings(bookingsResponse.data);
      if (paymentsResponse.success) setPayments(paymentsResponse.data);
      if (statsResponse.success) setStats(statsResponse.data);
      
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

  // ==================== GESTION DES UTILISATEURS ====================

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createUser(newUser);
      if (response.success) {
        setUsers([response.data, ...users]);
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', password: '', phone: '', role: 'student' });
        alert(response.message);
        fetchAdminData(); // Refresh stats
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await apiService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role
      });
      
      if (response.success) {
        setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
        setEditingUser(null);
        alert(response.message);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await apiService.deleteUser(userId);
        if (response.success) {
          setUsers(users.filter(u => u.id !== userId));
          alert(response.message);
          fetchAdminData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, active: boolean) => {
    try {
      const response = await apiService.toggleUserStatus(userId, active);
      if (response.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, email_verified: active } : u
        ));
        alert(response.message);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // ==================== GESTION DES CHAMBRES ====================

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      try {
        const response = await apiService.deleteRoom(roomId);
        if (response.success) {
          setRooms(rooms.filter(r => r.id !== roomId));
          alert(response.message);
          fetchAdminData(); // Refresh stats
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
        setRooms(rooms.map(r => 
          r.id === roomId ? { ...r, available } : r
        ));
        alert(response.message);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  // ==================== GESTION DES RÉSERVATIONS ====================

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await apiService.updateBooking(bookingId, { status });
      if (response.success) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status } : b
        ));
        alert(response.message);
        fetchAdminData(); // Refresh stats
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
          setBookings(bookings.filter(b => b.id !== bookingId));
          alert(response.message);
          fetchAdminData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  // ==================== ACTIONS EN LOT ====================

  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      alert('Aucun utilisateur sélectionné');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      try {
        const response = await apiService.bulkDeleteUsers(selectedUsers);
        if (response.success) {
          setUsers(users.filter(u => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
          alert(response.message);
          fetchAdminData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression en lot');
      }
    }
  };

  const handleBulkDeleteRooms = async () => {
    if (selectedRooms.length === 0) {
      alert('Aucune chambre sélectionnée');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRooms.length} chambre(s) ?`)) {
      try {
        const response = await apiService.bulkDeleteRooms(selectedRooms);
        if (response.success) {
          setRooms(rooms.filter(r => !selectedRooms.includes(r.id)));
          setSelectedRooms([]);
          alert(response.message);
          fetchAdminData(); // Refresh stats
        } else {
          alert(response.error);
        }
      } catch (error) {
        alert('Erreur lors de la suppression en lot');
      }
    }
  };

  const handleBulkToggleRoomAvailability = async (available: boolean) => {
    if (selectedRooms.length === 0) {
      alert('Aucune chambre sélectionnée');
      return;
    }

    try {
      const response = await apiService.bulkUpdateRoomStatus(selectedRooms, available);
      if (response.success) {
        setRooms(rooms.map(r => 
          selectedRooms.includes(r.id) ? { ...r, available } : r
        ));
        setSelectedRooms([]);
        alert(response.message);
      } else {
        alert(response.error);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour en lot');
    }
  };

  const handleViewInvoice = (payment: any) => {
    const invoiceData = {
      id: `INV-${payment.id.slice(0, 8)}`,
      booking: {
        id: payment.booking?.id || '',
        room: {
          title: payment.booking?.room?.title || 'Chambre',
          location: 'Douala, Cameroun',
          district: 'Akwa'
        },
        student: {
          name: payment.booking?.student?.name || 'Étudiant',
          email: payment.booking?.student?.email || '',
          phone: payment.booking?.student?.phone
        },
        start_date: payment.booking?.start_date || new Date().toISOString(),
        end_date: payment.booking?.end_date || new Date().toISOString(),
        total_price: payment.amount || 0
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'owner': return 'Propriétaire';
      case 'student': return 'Étudiant';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.room?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(payment =>
    payment.booking?.room?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.booking?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'users', name: 'Utilisateurs', icon: <Users className="w-5 h-5" /> },
    { id: 'rooms', name: 'Chambres', icon: <Home className="w-5 h-5" /> },
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
              Tableau de bord administrateur
            </h1>
            <p className="text-gray-600">
              Bienvenue, {user?.name}
            </p>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
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
                    setSelectedUsers([]);
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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Chambres</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Commissions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.commission)} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenus de la plateforme
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenus totaux</span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(stats.totalRevenue)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commissions (5%)</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(stats.commission)} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Utilisateurs actifs</span>
                    <span className="font-bold text-blue-600">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Réservations en attente</span>
                    <span className="font-bold text-yellow-600">{stats.pendingBookings}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activité récente
                </h3>
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Nouvelle réservation
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.student?.name} - {booking.room?.title}
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

            {/* Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Alertes système
                  </h3>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• {stats.pendingBookings} réservation(s) en attente de validation</li>
                    <li>• {unreadMessages} message(s) non lu(s)</li>
                    <li>• Système de paiement simulé actif</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h2>
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
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleBulkDeleteUsers}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer ({selectedUsers.length})</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, !user.email_verified)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.email_verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.email_verified ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des chambres</h2>
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
              
              {selectedRooms.length > 0 && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleBulkToggleRoomAvailability(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <ToggleRight className="w-4 h-4" />
                    <span>Activer ({selectedRooms.length})</span>
                  </button>
                  <button
                    onClick={() => handleBulkToggleRoomAvailability(false)}
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
                        <p className="text-gray-600 text-sm">
                          Propriétaire: {room.owner?.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
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
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(room.price)} FCFA/mois
                      </p>
                      <div className="flex space-x-2 mt-2">
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
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des réservations</h2>
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
            
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Réservation #{booking.id.slice(0, 8)}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {booking.room?.title}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Étudiant: {booking.student?.name} ({booking.student?.email})
                      </p>
                      <p className="text-gray-600 text-sm">
                        Propriétaire: {booking.room?.owner?.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Du {new Date(booking.start_date).toLocaleDateString('fr-FR')} 
                        au {new Date(booking.end_date).toLocaleDateString('fr-FR')}
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
                      <p className="text-xs text-green-600 mt-1">
                        Commission: +{formatPrice(booking.total_price * 0.05)} FCFA
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
                          Annuler
                        </button>
                      </>
                    )}
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
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des paiements</h2>
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
            
            {filteredPayments.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun paiement
                </h3>
                <p className="text-gray-600">
                  Les paiements effectués apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
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
                          {payment.status === 'completed' ? 'Terminé' : 'En cours'}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          {formatPrice(payment.amount)} FCFA
                        </p>
                        <p className="text-sm text-green-600">
                          Commission: +{formatPrice(payment.amount * 0.05)} FCFA
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
              <h2 className="text-lg font-semibold text-gray-900">Toutes les factures</h2>
            </div>
            
            {filteredPayments.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune facture
                </h3>
                <p className="text-gray-600">
                  Les factures des transactions apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
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
                          Étudiant: {payment.booking?.student?.name}
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
                        <p className="text-sm text-green-600">
                          Commission: +{formatPrice(payment.amount * 0.05)} FCFA
                        </p>
                        <p className="text-xs text-gray-500">
                          Propriétaire: {formatPrice(payment.amount * 0.95)} FCFA
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
                ))}
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
                fetchAdminData(); // Recharger pour mettre à jour le compteur
              }} 
            />
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter un utilisateur</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="student">Étudiant</option>
                  <option value="owner">Propriétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Modifier l'utilisateur</h3>
            
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  required
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="student">Étudiant</option>
                  <option value="owner">Propriétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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