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
  removeWatchedMovie,
  isMovieWatched,
  addWatchedSeries,
  removeWatchedSeries,
  isSeriesWatched,
  getUserFavorites,
  getUserWatchlist,
  getUserWatchedMovies,
  getUserWatchedSeries
} from '../utils/database';
import { useTVDB } from '../utils/useTVDB';

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

      // Agregar a la base de datos
      if (show.type === 'movie') {
        await addWatchedMovie(user.value.id, show.id, rating, notes);
        console.log(`✅ Película ${show.id} agregada a watched en BD`);
      } else if (show.type === 'series') {
        await addWatchedSeries(user.value.id, show.id);
        console.log(`✅ Serie ${show.id} agregada a watched en BD`);
      }

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

      // Quitar de la base de datos
      if (type === 'movie') {
        await removeWatchedMovie(user.value.id, showId);
        console.log(`✅ Película ${showId} removida de watched en BD`);
      } else if (type === 'series') {
        await removeWatchedSeries(user.value.id, showId);
        console.log(`✅ Serie ${showId} removida de watched en BD`);
      }

      // Actualizar caché local
      watched.value = watched.value.filter(item => !(item.id === showId && item.type === type));
      console.log(`✅ ${type} ${showId} removida del caché local`);
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
      } else if (type === 'series') {
        return await isSeriesWatched(user.value.id, showId);
      }
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
      error.value = null;

      console.log('🔄 Cargando datos del usuario desde la BD...');
      
      // Usar el composable de TVDB
      const tvdbComposable = useTVDB();
      
      // Asegurar que TVDB esté autenticado
      if (!tvdbComposable.token.value) {
        console.log('🔑 TVDB no está autenticado, inicializando...');
        await tvdbComposable.loginAndFetchContent();
      }
      
      // Cargar datos desde la BD
      const [favoritesData, watchlistData, watchedMoviesData, watchedSeriesData] = await Promise.all([
        getUserFavorites(user.value.id),
        getUserWatchlist(user.value.id),
        getUserWatchedMovies(user.value.id),
        getUserWatchedSeries(user.value.id)
      ]);

      // Procesar favoritos
      const favoritesPromises = favoritesData.map(async (fav) => {
        try {
          if (fav.movie_id) {
            const movieDetail = await tvdbComposable.fetchMovieDetails(fav.movie_id);
            return movieDetail ? {
              id: fav.movie_id,
              name: movieDetail.name,
              image: movieDetail.image,
              type: 'movie' as const,
              year: movieDetail.year,
              ...movieDetail
            } : null;
          } else if (fav.series_id) {
            const seriesDetail = await tvdbComposable.fetchSeriesDetails(fav.series_id);
            return seriesDetail ? {
              id: fav.series_id,
              name: seriesDetail.name,
              image: seriesDetail.image,
              type: 'series' as const,
              year: seriesDetail.year,
              ...seriesDetail
            } : null;
          }
        } catch (err) {
          console.error('Error cargando detalles de favorito:', err);
          return null;
        }
      });

      // Procesar watchlist
      const watchlistPromises = watchlistData.map(async (item) => {
        try {
          if (item.movie_id) {
            const movieDetail = await tvdbComposable.fetchMovieDetails(item.movie_id);
            return movieDetail ? {
              id: item.movie_id,
              name: movieDetail.name,
              image: movieDetail.image,
              type: 'movie' as const,
              year: movieDetail.year,
              ...movieDetail
            } : null;
          } else if (item.series_id) {
            const seriesDetail = await tvdbComposable.fetchSeriesDetails(item.series_id);
            return seriesDetail ? {
              id: item.series_id,
              name: seriesDetail.name,
              image: seriesDetail.image,
              type: 'series' as const,
              year: seriesDetail.year,
              ...seriesDetail
            } : null;
          }
        } catch (err) {
          console.error('Error cargando detalles de watchlist:', err);
          return null;
        }
      });

      // Procesar watched movies
      const watchedMoviesPromises = watchedMoviesData.map(async (item) => {
        try {
          const movieDetail = await tvdbComposable.fetchMovieDetails(item.movie_id);
          return movieDetail ? {
            id: item.movie_id,
            name: movieDetail.name,
            image: movieDetail.image,
            type: 'movie' as const,
            year: movieDetail.year,
            ...movieDetail
          } : null;
        } catch (err) {
          console.error('Error cargando detalles de watched movie:', err);
          return null;
        }
      });

      // Procesar watched series
      const watchedSeriesPromises = watchedSeriesData.map(async (item) => {
        try {
          const seriesDetail = await tvdbComposable.fetchSeriesDetails(item.series_id);
          return seriesDetail ? {
            id: item.series_id,
            name: seriesDetail.name,
            image: seriesDetail.image,
            type: 'series' as const,
            year: seriesDetail.year,
            ...seriesDetail
          } : null;
        } catch (err) {
          console.error('Error cargando detalles de watched series:', err);
          return null;
        }
      });

      // Resolver todas las promesas
      const [favoritesResults, watchlistResults, watchedMoviesResults, watchedSeriesResults] = await Promise.all([
        Promise.all(favoritesPromises),
        Promise.all(watchlistPromises),
        Promise.all(watchedMoviesPromises),
        Promise.all(watchedSeriesPromises)
      ]);

      // Filtrar resultados null y actualizar el estado
      favorites.value = favoritesResults.filter(Boolean) as Show[];
      watchlist.value = watchlistResults.filter(Boolean) as Show[];
      watched.value = [...watchedMoviesResults, ...watchedSeriesResults].filter(Boolean) as Show[];

      console.log(`✅ Datos cargados: ${favorites.value.length} favoritos, ${watchlist.value.length} watchlist, ${watched.value.length} watched`);
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

  // Inicializar datos si el usuario ya está autenticado (por ejemplo desde localStorage)
  if (isAuthenticated.value) {
    loadUserData();
  }

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