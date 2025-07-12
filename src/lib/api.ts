import { supabase } from './supabase';
import { authService } from './auth';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  // ==================== GESTION DES UTILISATEURS ====================
  
  async getAllUsers(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createUser(userData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          email_verified: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Utilisateur créé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId: string, userData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Utilisateur mis à jour avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return {
        success: true,
        message: 'Utilisateur supprimé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async toggleUserStatus(userId: string, active: boolean): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ email_verified: active })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Utilisateur ${active ? 'activé' : 'désactivé'} avec succès`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES CHAMBRES ====================

  async getAllRooms(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:users!rooms_owner_id_fkey(id, name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getRooms(filters: Record<string, any> = {}): Promise<ApiResponse> {
    try {
      let query = supabase
        .from('rooms')
        .select(`
          *,
          owner:users!rooms_owner_id_fkey(id, name, phone, email)
        `);

      // Appliquer les filtres
      if (filters.available !== undefined) {
        query = query.eq('available', filters.available);
      }
      if (filters.district) {
        query = query.eq('district', filters.district);
      }
      if (filters.room_type) {
        query = query.eq('room_type', filters.room_type);
      }
      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getRoom(id: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:users!rooms_owner_id_fkey(id, name, phone, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createRoom(roomData: any): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          ...roomData,
          owner_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Chambre créée avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateRoom(id: string, roomData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Chambre mise à jour avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteRoom(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Chambre supprimée avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async toggleRoomAvailability(roomId: string, available: boolean): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ available })
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Chambre ${available ? 'activée' : 'désactivée'} avec succès`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getOwnerRooms(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('owner_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES RÉSERVATIONS ====================

  async getAllBookings(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          student:users!bookings_student_id_fkey(id, name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createBooking(bookingData: any): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          student_id: currentUser.id
        })
        .select(`
          *,
          room:rooms(*)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Réservation créée avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateBooking(id: string, bookingData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Réservation mise à jour avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async cancelBooking(id: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Réservation annulée avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteBooking(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Réservation supprimée avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getStudentBookings(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*)
        `)
        .eq('student_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getOwnerBookings(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms!inner(*),
          student:users!bookings_student_id_fkey(id, name, email, phone)
        `)
        .eq('room.owner_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES FAVORIS ====================

  async getFavorites(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          room:rooms(*)
        `)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      return {
        success: true,
        data: data?.map(fav => fav.room) || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addToFavorites(roomId: string): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: currentUser.id,
          room_id: roomId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Ajouté aux favoris'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async removeFromFavorites(roomId: string): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('room_id', roomId);

      if (error) throw error;

      return {
        success: true,
        message: 'Retiré des favoris'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES AVIS ====================

  async getReviews(roomId: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          student:users!reviews_student_id_fkey(id, name)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createReview(reviewData: any): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          student_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Avis ajouté avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateReview(id: string, reviewData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(reviewData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Avis mis à jour avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteReview(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Avis supprimé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES MESSAGES ====================

  async getMessages(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, role),
          receiver:users!messages_receiver_id_fkey(id, name, role),
          room:rooms(id, title)
        `)
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async sendMessage(messageData: any): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          sender_id: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Message envoyé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Message marqué comme lu'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteMessage(messageId: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      return {
        success: true,
        message: 'Message supprimé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES PAIEMENTS ====================

  async createPayment(paymentData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: paymentData.booking_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id,
          status: paymentData.status,
          payment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le statut de la réservation
      await supabase
        .from('bookings')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('id', paymentData.booking_id);

      return {
        success: true,
        data,
        message: 'Paiement enregistré avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getPayments(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            *,
            room:rooms(title),
            student:users!bookings_student_id_fkey(name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getOwnerPayments(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings!inner(
            *,
            room:rooms!inner(title, owner_id),
            student:users!bookings_student_id_fkey(name, email)
          )
        `)
        .eq('booking.room.owner_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getStudentPayments(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings!inner(
            *,
            room:rooms(title)
          )
        `)
        .eq('booking.student_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTION DES QUARTIERS ====================

  async getDistricts(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createDistrict(districtData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('districts')
        .insert(districtData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Quartier créé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateDistrict(id: string, districtData: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('districts')
        .update(districtData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Quartier mis à jour avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteDistrict(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Quartier supprimé avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== STATISTIQUES ====================

  async getOwnerStats(): Promise<ApiResponse> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Non authentifié' };
      }

      // Récupérer les chambres du propriétaire
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('owner_id', currentUser.id);

      if (roomsError) throw roomsError;

      // Récupérer les réservations
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, room:rooms!inner(*)')
        .eq('room.owner_id', currentUser.id);

      if (bookingsError) throw bookingsError;

      // Récupérer les paiements
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings!inner(
            room:rooms!inner(owner_id)
          )
        `)
        .eq('booking.room.owner_id', currentUser.id);

      if (paymentsError) throw paymentsError;

      const totalRooms = rooms?.length || 0;
      const availableRooms = rooms?.filter(r => r.available).length || 0;
      const totalBookings = bookings?.length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const commission = totalRevenue * 0.05; // 5% de commission
      const netRevenue = totalRevenue - commission;
      const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

      return {
        success: true,
        data: {
          totalRooms,
          availableRooms,
          totalBookings,
          totalRevenue: netRevenue,
          grossRevenue: totalRevenue,
          commission,
          monthlyRevenue: Math.round(netRevenue / 6),
          occupancyRate
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAdminStats(): Promise<ApiResponse> {
    try {
      const [usersResult, roomsResult, bookingsResult, paymentsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('rooms').select('*', { count: 'exact' }),
        supabase.from('bookings').select('total_price, status'),
        supabase.from('payments').select('amount')
      ]);

      const totalUsers = usersResult.count || 0;
      const totalRooms = roomsResult.count || 0;
      const bookings = bookingsResult.data || [];
      const payments = paymentsResult.data || [];
      
      const totalBookings = bookings.length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const commission = totalRevenue * 0.05; // 5% de commission pour l'admin
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;

      return {
        success: true,
        data: {
          totalUsers,
          totalRooms,
          totalBookings,
          totalRevenue,
          commission,
          pendingBookings,
          activeUsers: Math.round(totalUsers * 0.7)
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== UPLOAD D'IMAGES ====================

  async uploadImage(file: File): Promise<ApiResponse> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `room-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return {
        success: true,
        data: { url: publicUrl },
        message: 'Image uploadée avec succès'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== ACTIONS EN LOT ====================

  async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', userIds);

      if (error) throw error;

      return {
        success: true,
        message: `${userIds.length} utilisateur(s) supprimé(s) avec succès`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async bulkDeleteRooms(roomIds: string[]): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .in('id', roomIds);

      if (error) throw error;

      return {
        success: true,
        message: `${roomIds.length} chambre(s) supprimée(s) avec succès`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async bulkUpdateRoomStatus(roomIds: string[], available: boolean): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ available })
        .in('id', roomIds);

      if (error) throw error;

      return {
        success: true,
        message: `${roomIds.length} chambre(s) ${available ? 'activée(s)' : 'désactivée(s)'} avec succès`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async bulkUpdateBookingStatus(bookingIds: string[], status: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .in('id', bookingIds);

      if (error) throw error;

      return {
        success: true,
        message: `${bookingIds.length} réservation(s) mise(s) à jour avec succès`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Instance singleton de l'API
const apiService = new ApiService();
export default apiService;