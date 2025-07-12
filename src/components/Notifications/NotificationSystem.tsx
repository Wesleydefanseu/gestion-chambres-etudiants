import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

interface Notification {
  id: string;
  type: 'booking_expiry' | 'payment_reminder' | 'booking_confirmed' | 'message_received' | 'info';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  booking_id?: string;
  room_title?: string;
  expiry_date?: string;
}

interface NotificationSystemProps {
  onNotificationCount?: (count: number) => void;
}

export default function NotificationSystem({ onNotificationCount }: NotificationSystemProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      generateNotifications();
      // Vérifier les notifications toutes les heures
      const interval = setInterval(generateNotifications, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    onNotificationCount?.(count);
  }, [notifications, onNotificationCount]);

  const generateNotifications = async () => {
    if (!user) return;

    try {
      const mockNotifications: Notification[] = [];

      // Notifications pour les étudiants
      if (user.role === 'student') {
        // Simulation de réservations qui expirent bientôt
        const bookingsResponse = await apiService.getStudentBookings();
        if (bookingsResponse.success) {
          const bookings = bookingsResponse.data;
          
          bookings.forEach((booking: any) => {
            const endDate = new Date(booking.end_date);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            // Notification 7 jours avant expiration
            if (daysUntilExpiry <= 7 && daysUntilExpiry > 0 && booking.status === 'confirmed') {
              mockNotifications.push({
                id: `expiry_${booking.id}`,
                type: 'booking_expiry',
                title: 'Réservation bientôt expirée',
                message: `Votre réservation pour "${booking.room?.title}" expire dans ${daysUntilExpiry} jour(s). Pensez à renouveler si nécessaire.`,
                created_at: new Date().toISOString(),
                read: false,
                booking_id: booking.id,
                room_title: booking.room?.title,
                expiry_date: booking.end_date
              });
            }

            // Notification pour paiement en attente
            if (booking.payment_status === 'pending' && booking.status !== 'cancelled') {
              mockNotifications.push({
                id: `payment_${booking.id}`,
                type: 'payment_reminder',
                title: 'Paiement en attente',
                message: `Le paiement pour votre réservation "${booking.room?.title}" est en attente. Finalisez votre paiement pour confirmer la réservation.`,
                created_at: new Date().toISOString(),
                read: false,
                booking_id: booking.id,
                room_title: booking.room?.title
              });
            }
          });
        }

        // Notifications générales pour étudiants
        mockNotifications.push({
          id: 'welcome_student',
          type: 'info',
          title: 'Bienvenue sur KmerLogis !',
          message: 'Explorez nos chambres vérifiées et trouvez votre logement idéal à Douala.',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false
        });
      }

      // Notifications pour les propriétaires
      if (user.role === 'owner') {
        const bookingsResponse = await apiService.getOwnerBookings();
        if (bookingsResponse.success) {
          const pendingBookings = bookingsResponse.data.filter((b: any) => b.status === 'pending');
          
          if (pendingBookings.length > 0) {
            mockNotifications.push({
              id: 'pending_bookings',
              type: 'booking_confirmed',
              title: 'Nouvelles demandes de réservation',
              message: `Vous avez ${pendingBookings.length} nouvelle(s) demande(s) de réservation en attente de validation.`,
              created_at: new Date().toISOString(),
              read: false
            });
          }
        }

        mockNotifications.push({
          id: 'owner_tips',
          type: 'info',
          title: 'Conseils pour propriétaires',
          message: 'Répondez rapidement aux demandes pour améliorer votre taux de réservation.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: false
        });
      }

      // Notifications pour les admins
      if (user.role === 'admin') {
        mockNotifications.push({
          id: 'admin_stats',
          type: 'info',
          title: 'Rapport quotidien',
          message: 'Consultez les statistiques de la plateforme dans votre dashboard.',
          created_at: new Date().toISOString(),
          read: false
        });
      }

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erreur lors de la génération des notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_expiry':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'payment_reminder':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'booking_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'message_received':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeAgo(notification.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary-600 hover:text-primary-700"
                              >
                                Marquer comme lu
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}