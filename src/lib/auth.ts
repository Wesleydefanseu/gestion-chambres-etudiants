import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'student' | 'owner' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('kmerlogis_user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  private saveUserToStorage(user: User) {
    localStorage.setItem('kmerlogis_user', JSON.stringify(user));
    this.currentUser = user;
  }

  private clearUserFromStorage() {
    localStorage.removeItem('kmerlogis_user');
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'student' | 'owner';
  }): Promise<AuthResponse> {
    try {
      // Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Cet email est déjà utilisé' };
      }

      // Créer l'utilisateur dans Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          password: userData.password, // En production, hasher le mot de passe
          email_verified: true
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Erreur lors de la création du compte' };
      }

      const user: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        created_at: newUser.created_at
      };

      this.saveUserToStorage(user);
      return { success: true, user };

    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // En production, comparer les hashes
        .single();

      if (error || !user) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      const authUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      };

      this.saveUserToStorage(authUser);
      return { success: true, user: authUser };

    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  }

  async logout(): Promise<void> {
    this.clearUserFromStorage();
  }

  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    if (!this.currentUser) {
      return { success: false, error: 'Non connecté' };
    }

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Erreur lors de la mise à jour' };
      }

      const user: User = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        created_at: updatedUser.created_at
      };

      this.saveUserToStorage(user);
      return { success: true, user };

    } catch (error) {
      console.error('Erreur mise à jour:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  }
}

export const authService = new AuthService();