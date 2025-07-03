import { ref, computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import type { Show } from '../stores/userStore';

export const useUserLists = () => {
  const userStore = useUserStore();
  
  // Estados de las listas
  const favorites = computed(() => userStore.favorites);
  const watchlist = computed(() => userStore.watchlist);
  const watched = computed(() => userStore.watched);
  
  // Estados de carga y errores
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  
  // Contadores
  const favoritesCount = computed(() => userStore.favoritesCount);
  const watchlistCount = computed(() => userStore.watchlistCount);
  const watchedCount = computed(() => userStore.watchedCount);

  // Funciones de favoritos
  const addToFavorites = async (show: Show) => {
    await userStore.addToFavorites(show);
  };

  const removeFromFavorites = async (showId: number, type: 'movie' | 'series') => {
    await userStore.removeFromFavorites(showId, type);
  };

  const toggleFavorite = async (show: Show) => {
    try {
      console.log(`🔄 Toggle favorito: ${show.name} (${show.type})`);
      // Verificar estado actual desde la BD
      const isFav = await userStore.checkIsFavorite(show.id, show.type);
      
      if (isFav) {
        console.log('🗑️ Removiendo de favoritos...');
        await removeFromFavorites(show.id, show.type);
        console.log('✅ Removido de favoritos');
      } else {
        console.log('❤️ Agregando a favoritos...');
        await addToFavorites(show);
        console.log('✅ Agregado a favoritos');
      }
    } catch (error) {
      console.error('Error en toggleFavorite:', error);
    }
  };

  const isFavorite = (showId: number, type: 'movie' | 'series') => {
    return userStore.isFavorite(showId, type);
  };

  // Funciones de watchlist
  const addToWatchlist = async (show: Show) => {
    await userStore.addToWatchlist(show);
  };

  const removeFromWatchlist = async (showId: number, type: 'movie' | 'series') => {
    await userStore.removeFromWatchlist(showId, type);
  };

  const toggleWatchlist = async (show: Show) => {
    try {
      console.log(`🔄 Toggle watchlist: ${show.name} (${show.type})`);
      // Verificar estado actual desde la BD
      const isInList = await userStore.checkIsInWatchlist(show.id, show.type);
      
      if (isInList) {
        console.log('🗑️ Removiendo de watchlist...');
        await removeFromWatchlist(show.id, show.type);
        console.log('✅ Removido de watchlist');
      } else {
        console.log('📋 Agregando a watchlist...');
        await addToWatchlist(show);
        console.log('✅ Agregado a watchlist');
      }
    } catch (error) {
      console.error('Error en toggleWatchlist:', error);
    }
  };

  const isInWatchlist = (showId: number, type: 'movie' | 'series') => {
    return userStore.isInWatchlist(showId, type);
  };

  // Funciones de watched
  const addToWatched = async (show: Show, rating?: number, notes?: string) => {
    await userStore.addToWatched(show, rating, notes);
  };

  const removeFromWatched = async (showId: number, type: 'movie' | 'series') => {
    await userStore.removeFromWatched(showId, type);
  };

  const toggleWatched = async (show: Show, rating?: number, notes?: string) => {
    try {
      console.log(`🔄 Toggle watched: ${show.name} (${show.type})`);
      // Verificar estado actual desde la BD
      const isWatchedShow = await userStore.checkIsWatched(show.id, show.type);
      
      if (isWatchedShow) {
        console.log('🗑️ Removiendo de watched...');
        await removeFromWatched(show.id, show.type);
        console.log('✅ Removido de watched');
      } else {
        console.log('👁️ Agregando a watched...');
        await addToWatched(show, rating, notes);
        console.log('✅ Agregado a watched');
      }
    } catch (error) {
      console.error('Error en toggleWatched:', error);
    }
  };

  const isWatched = (showId: number, type: 'movie' | 'series') => {
    return userStore.isWatched(showId, type);
  };

  // Función para verificar estado actual desde la BD
  const checkCurrentState = async (showId: number, type: 'movie' | 'series') => {
    try {
      const [isFav, inWatchlist, watchedStatus] = await Promise.all([
        userStore.checkIsFavorite(showId, type),
        userStore.checkIsInWatchlist(showId, type),
        userStore.checkIsWatched(showId, type)
      ]);

      return {
        isFavorite: isFav,
        isInWatchlist: inWatchlist,
        isWatched: watchedStatus
      };
    } catch (error) {
      console.error('Error checking current state:', error);
      return {
        isFavorite: false,
        isInWatchlist: false,
        isWatched: false
      };
    }
  };

  // Función para cargar datos del usuario
  const loadUserData = async () => {
    await userStore.loadUserData();
  };

  return {
    // Estados
    favorites,
    watchlist,
    watched,
    isLoading,
    error,

    // Contadores
    favoritesCount,
    watchlistCount,
    watchedCount,

    // Funciones de favoritos
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,

    // Funciones de watchlist
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,

    // Funciones de watched
    addToWatched,
    removeFromWatched,
    toggleWatched,
    isWatched,

    // Utilidades
    checkCurrentState,
    loadUserData,
  };
}; 