import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createUser, getUserByEmail, createDemoUser, updateUserPassword, type User } from '../utils/database';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useAuth = () => {
  const router = useRouter();
  
  // Estado de autenticación
  const user = ref<AuthUser | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  
  // Función para hashear contraseñas (versión simplificada)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };
  
  // Cargar usuario desde localStorage al inicializar
  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('auth-user');
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('auth-user');
        }
      }
    }
  };
  
  // Guardar usuario en localStorage
  const saveUser = (userData: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-user', JSON.stringify(userData));
    }
  };
  
  // Función de login con validación de contraseña
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      console.log('🔐 Iniciando proceso de login...');
      console.log('📧 Email:', credentials.email);
      
      // Buscar usuario por email
      const foundUser = await getUserByEmail(credentials.email);
      
      if (!foundUser) {
        console.log('❌ Usuario no encontrado en BD');
        error.value = 'Usuario no encontrado';
        return false;
      }
      
      console.log('✅ Usuario encontrado:', foundUser.name);
      console.log('🔒 Contraseña en BD (primeros 20 chars):', foundUser.password.substring(0, 20) + '...');
      
      // Verificar contraseña
      const hashedPassword = await hashPassword(credentials.password);
      console.log('🔑 Contraseña hasheada (primeros 20 chars):', hashedPassword.substring(0, 20) + '...');
      console.log('🔍 ¿Coinciden?', foundUser.password === hashedPassword);
      
      if (foundUser.password !== hashedPassword) {
        console.log('❌ Contraseñas no coinciden');
        console.log('📝 BD:', foundUser.password);
        console.log('📝 Calculada:', hashedPassword);
        error.value = 'Contraseña incorrecta';
        return false;
      }
      
      console.log('✅ Login exitoso');
      
      // Crear usuario sin contraseña para el estado local
      const userWithoutPassword = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        created_at: foundUser.created_at
      };
      
      user.value = userWithoutPassword;
      saveUser(userWithoutPassword);
      
      return true;
    } catch (err) {
      console.error('❌ Error en login:', err);
      error.value = err instanceof Error ? err.message : 'Error al iniciar sesión';
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Función de registro
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Validaciones básicas
      if (credentials.password !== credentials.confirmPassword) {
        error.value = 'Las contraseñas no coinciden';
        return false;
      }
      
      if (credentials.password.length < 6) {
        error.value = 'La contraseña debe tener al menos 6 caracteres';
        return false;
      }
      
      // Verificar si el usuario ya existe
      const existingUser = await getUserByEmail(credentials.email);
      if (existingUser) {
        error.value = 'Ya existe un usuario con este email';
        return false;
      }
      
      // Hashear contraseña antes de guardar
      const hashedPassword = await hashPassword(credentials.password);
      
      // Crear nuevo usuario
      const newUser = await createUser({
        name: credentials.name,
        email: credentials.email,
        password: hashedPassword
      });
      
      // Crear usuario sin contraseña para el estado local
      const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at
      };
      
      user.value = userWithoutPassword;
      saveUser(userWithoutPassword);
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar usuario';
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Función de logout
  const logout = () => {
    user.value = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user');
    }
    router.push('/');
  };
  
  // Limpiar errores
  const clearError = () => {
    error.value = null;
  };
  
  // Función para forzar actualización del usuario demo (temporal para debugging)
  const fixDemoUser = async () => {
    try {
      console.log('🔧 Forzando actualización del usuario demo...');
      await createDemoUser();
      console.log('✅ Usuario demo verificado/actualizado');
    } catch (error) {
      console.error('❌ Error actualizando usuario demo:', error);
    }
  };
  
  // Función para actualizar contraseña de usuario (temporal para debugging)
  const resetUserPassword = async (email: string, newPassword: string) => {
    try {
      console.log(`🔧 Actualizando contraseña para ${email}...`);
      const success = await updateUserPassword(email, newPassword);
      if (success) {
        console.log('✅ Contraseña actualizada correctamente');
      } else {
        console.log('❌ No se pudo actualizar la contraseña');
      }
      return success;
    } catch (error) {
      console.error('❌ Error actualizando contraseña:', error);
      return false;
    }
  };
  
  // Inicializar
  loadUser();
  
  // Asegurar que el usuario demo esté correctamente configurado
  createDemoUser().catch(err => console.error('Error inicializando usuario demo:', err));
  
  // Exponer funciones de debugging en desarrollo
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    (window as any).authDebug = {
      fixDemoUser,
      resetUserPassword,
      hashPassword
    };
    console.log('🔧 Funciones de debugging disponibles en window.authDebug');
    console.log('   - window.authDebug.fixDemoUser()');
    console.log('   - window.authDebug.resetUserPassword(email, password)');
    console.log('   - window.authDebug.hashPassword(password)');
  }
  
  return {
    // Estado
    user,
    isLoading,
    error,
    isAuthenticated,
    
    // Métodos
    login,
    register,
    logout,
    clearError,
    
    // Debugging (temporal)
    fixDemoUser,
    resetUserPassword,
  };
}; 