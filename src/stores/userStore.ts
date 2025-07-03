import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { 
  addFavorite, 
  removeFavorite, 
  isFavorite, 
  addToWatchlist, 
  removeFromWatchlist, 
  isInWatchlist,
  addWatchedMovie,
  isMovieWatched
} from '../utils/database';

export interface Show {
  id: number;
  name: string;
  image?: string;
  type: 'movie' | 'series';
  [key: string]: any;
}

export const useUserStore = defineStore('user', () => {
  // Usar el composable de autenticación
  const { user, isAuthenticated } = useAuth();

  // Listas del usuario (para caché local)
  const favorites = ref<Show[]>([]);
  const watchlist = ref<Show[]>([]);
  const watched = ref<Show[]>([]);
  
  // Estados de carga
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters computados
  const favoritesCount = computed(() => favorites.value.length);
  const watchlistCount = computed(() => watchlist.value.length);
  const watchedCount = computed(() => watched.value.length);

  // Acciones para manejar favoritos
  const addToFavorites = async (show: Show) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'Debes estar logueado para agregar favoritos';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Agregar a la base de datos
      if (show.type === 'movie') {
        await addFavorite(user.value.id, show.id);
      } else {
        await addFavorite(user.value.id, undefined, show.id);
      }

      // Actualizar caché local
      if (!favorites.value.find(item => item.id === show.id && item.type === show.type)) {
        favorites.value.push(show);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al agregar favorito';
      console.error('Error adding favorite:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromFavorites = async (showId: number, type: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'Debes estar logueado para quitar favoritos';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Quitar de la base de datos
      if (type === 'movie') {
        await removeFavorite(user.value.id, showId);
      } else {
        await removeFavorite(user.value.id, undefined, showId);
      }

      // Actualizar caché local
      favorites.value = favorites.value.filter(item => !(item.id === showId && item.type === type));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al quitar favorito';
      console.error('Error removing favorite:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const checkIsFavorite = async (showId: number, type: string): Promise<boolean> => {
    if (!isAuthenticated.value || !user.value) {
      return false;
    }

    try {
      if (type === 'movie') {
        return await isFavorite(user.value.id, showId);
      } else {
        return await isFavorite(user.value.id, undefined, showId);
      }
    } catch (err) {
      console.error('Error checking favorite:', err);
      return false;
    }
  };

  // Función de favoritos sincronizada (para compatibilidad)
  const isFavoriteSync = (showId: number, type: string) => {
    return favorites.value.some(item => item.id === showId && item.type === type);
  };

  // Acciones para manejar watchlist
  const addToWatchlistAction = async (show: Show) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'Debes estar logueado para agregar a la watchlist';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Agregar a la base de datos
      if (show.type === 'movie') {
        await addToWatchlist(user.value.id, show.id);
      } else {
        await addToWatchlist(user.value.id, undefined, show.id);
      }

      // Actualizar caché local
      if (!watchlist.value.find(item => item.id === show.id && item.type === show.type)) {
        watchlist.value.push(show);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al agregar a watchlist';
      console.error('Error adding to watchlist:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromWatchlistAction = async (showId: number, type: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'Debes estar logueado para quitar de la watchlist';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Quitar de la base de datos
      if (type === 'movie') {
        await removeFromWatchlist(user.value.id, showId);
      } else {
        await removeFromWatchlist(user.value.id, undefined, showId);
      }

      // Actualizar caché local
      watchlist.value = watchlist.value.filter(item => !(item.id === showId && item.type === type));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al quitar de watchlist';
      console.error('Error removing from watchlist:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const checkIsInWatchlist = async (showId: number, type: string): Promise<boolean> => {
    if (!isAuthenticated.value || !user.value) {
      return false;
    }

    try {
      if (type === 'movie') {
        return await isInWatchlist(user.value.id, showId);
      } else {
        return await isInWatchlist(user.value.id, undefined, showId);
      }
    } catch (err) {
      console.error('Error checking watchlist:', err);
      return false;
    }
  };

  // Función de watchlist sincronizada (para compatibilidad)
  const isInWatchlistSync = (showId: number, type: string) => {
    return watchlist.value.some(item => item.id === showId && item.type === type);
  };

  // Acciones para manejar watched
  const addToWatched = async (show: Show, rating?: number, notes?: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'Debes estar logueado para marcar como visto';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Agregar a la base de datos (solo películas por ahora)
      if (show.type === 'movie') {
        await addWatchedMovie(user.value.id, show.id, rating, notes);
      }
      // Para series necesitaríamos manejar episodios individualmente

      // Actualizar caché local
      if (!watched.value.find(item => item.id === show.id && item.type === show.type)) {
        watched.value.push(show);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al marcar como visto';
      console.error('Error adding to watched:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromWatched = async (showId: number, type: string) => {
    if (!isAuthenticated.value || !user.value) {
      error.value = 'Debes estar logueado para quitar de vistas';
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Por ahora solo removemos del caché local
      // TODO: Implementar remove de watched en la BD
      watched.value = watched.value.filter(item => !(item.id === showId && item.type === type));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al quitar de vistas';
      console.error('Error removing from watched:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const checkIsWatched = async (showId: number, type: string): Promise<boolean> => {
    if (!isAuthenticated.value || !user.value) {
      return false;
    }

    try {
      if (type === 'movie') {
        return await isMovieWatched(user.value.id, showId);
      }
      // Para series necesitaríamos verificar episodios
      return false;
    } catch (err) {
      console.error('Error checking watched:', err);
      return false;
    }
  };

  // Función de watched sincronizada (para compatibilidad)
  const isWatchedSync = (showId: number, type: string) => {
    return watched.value.some(item => item.id === showId && item.type === type);
  };

  // Función para cargar datos del usuario desde la BD
  const loadUserData = async () => {
    if (!isAuthenticated.value || !user.value) {
      return;
    }

    try {
      isLoading.value = true;
      // TODO: Implementar funciones para cargar listas completas desde la BD
      // Por ahora usamos el caché local
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando datos del usuario';
      console.error('Error loading user data:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Función para limpiar datos al hacer logout
  const clearUserData = () => {
    favorites.value = [];
    watchlist.value = [];
    watched.value = [];
    error.value = null;
  };

  // Observar cambios en la autenticación
  watch(isAuthenticated, (newValue) => {
    if (newValue) {
      loadUserData();
    } else {
      clearUserData();
    }
  });

  return {
    // Estado
    user,
    isAuthenticated,
    favorites,
    watchlist,
    watched,
    isLoading,
    error,

    // Getters
    favoritesCount,
    watchlistCount,
    watchedCount,

    // Acciones de favoritos
    addToFavorites,
    removeFromFavorites,
    checkIsFavorite,
    isFavorite: isFavoriteSync, // Función síncrona para compatibilidad

    // Acciones de watchlist
    addToWatchlist: addToWatchlistAction,
    removeFromWatchlist: removeFromWatchlistAction,
    checkIsInWatchlist,
    isInWatchlist: isInWatchlistSync, // Función síncrona para compatibilidad

    // Acciones de watched
    addToWatched,
    removeFromWatched,
    checkIsWatched,
    isWatched: isWatchedSync, // Función síncrona para compatibilidad

    // Utilidades
    loadUserData,
    clearUserData,
  };
}); 