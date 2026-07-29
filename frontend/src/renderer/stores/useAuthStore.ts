// src/renderer/stores/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '../utils/apiService'

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  palmData: string
  balance: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  enrollmentProgress: number
  
  // Actions
  setUser: (user: User) => void
  logout: () => void
  updateBalance: (amount: number) => void
  setEnrollmentProgress: (progress: number) => void
  
  // Real API Actions
  login: (phoneNumber: string, pin: string) => Promise<boolean>
  register: (name: string, email: string, phoneNumber: string, pin: string) => Promise<boolean>
  enrollBiometric: (userId: string, palmImages: string[], handSide?: string) => Promise<{ success: boolean; error?: string }>
  fetchProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      enrollmentProgress: 0,

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: () => {
        apiService.logout()
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null,
          enrollmentProgress: 0
        })
      },

      updateBalance: (amount) =>
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            balance: state.user.balance + amount 
          } : null,
        })),

      setEnrollmentProgress: (progress) => set({ enrollmentProgress: progress }),

      // ============ REAL API METHODS ============
      login: async (phoneNumber: string, pin: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiService.login(phoneNumber, pin)
          
          if (response.success && response.data) {
            const backendUser = response.data.user;
            
            // Convert backend user to frontend format
            const frontendUser: User = {
              id: backendUser.id,
              fullName: backendUser.name,
              email: backendUser.email,
              phone: backendUser.phoneNumber,
              palmData: backendUser.biometricEnrolled ? 'enrolled' : 'pending',
              balance: backendUser.balance
            };
            
            set({ 
              user: frontendUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
          return false;
        }
      },

      register: async (name: string, email: string, phoneNumber: string, pin: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Pass parameters separately
          const response = await apiService.register(name, email, phoneNumber, pin)
          
          if (response.success && response.data) {
            const backendUser = response.data.user;
            
            // Convert backend user to frontend format
            const frontendUser: User = {
              id: backendUser.id,
              fullName: backendUser.name,
              email: backendUser.email,
              phone: backendUser.phoneNumber,
              palmData: 'pending', // Need to enroll biometric after registration
              balance: backendUser.balance
            };
            
            set({ 
              user: frontendUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.error || 'Registration failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          });
          return false;
        }
      },

      enrollBiometric: async (userId: string, palmImages: string[], handSide: string = 'RIGHT') => {
        set({ isLoading: true, error: null, enrollmentProgress: 0 });
        
        try {
          console.log(`Enrolling ${palmImages.length} palm images for user: ${userId}`);
          
          // Send images one by one to avoid "request entity too large" error
          for (let i = 0; i < palmImages.length; i++) {
            // Use the single image enrollment endpoint
            const response = await apiService.registerBiometric(palmImages[i]);
            
            if (!response.success) {
              throw new Error(`Failed to enroll image ${i + 1}: ${response.error}`);
            }
            
            // Update progress after each successful enrollment
            const progress = Math.round(((i + 1) / palmImages.length) * 100);
            set({ enrollmentProgress: progress });
          }
          
          // Update user's palm data status
          set((state) => ({
            isLoading: false,
            enrollmentProgress: 100,
            user: state.user ? { 
              ...state.user, 
              palmData: 'enrolled' 
            } : null,
            error: null
          }));
          
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Biometric enrollment failed';
          set({
            error: errorMessage,
            isLoading: false
          });
          return { success: false, error: errorMessage };
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiService.getUserProfile()
          
          if (response.success && response.data) {
            const backendUser = response.data;
            
            const frontendUser: User = {
              id: backendUser.id,
              fullName: backendUser.name,
              email: backendUser.email,
              phone: backendUser.phoneNumber,
              palmData: backendUser.biometricEnrolled ? 'enrolled' : 'pending',
              balance: backendUser.balance
            };
            
            set({ 
              user: frontendUser,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            set({
              error: response.error || 'Failed to fetch profile',
              isLoading: false
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch profile',
            isLoading: false
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'palmpay-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        enrollmentProgress: state.enrollmentProgress
      }),
    }
  )
)

// Helper hook for easy consumption
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, enrollmentProgress } = useAuthStore()
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    enrollmentProgress,
    isAdmin: user?.email === 'admin@palm-pay.com',
  }
}

// Convenience hooks for specific functionality
export const useAuthActions = () => {
  const { 
    login, 
    register, 
    logout, 
    enrollBiometric, 
    fetchProfile, 
    clearError,
    setEnrollmentProgress 
  } = useAuthStore()
  
  return {
    login,
    register,
    logout,
    enrollBiometric,
    fetchProfile,
    clearError,
    setEnrollmentProgress
  }
}

export const useAuthUser = () => {
  const { user, isAuthenticated } = useAuthStore()
  return { user, isAuthenticated }
}