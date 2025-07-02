import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Show {
  id: number;
  name: string;
  image?: string;
  type: 'movie' | 'series';
  [key: string]: any;
}

export const useUserStore = defineStore('user', () => {
  // Estado del usuario
  const currentUser = ref<{ id: string; name: string } | null>(null);
  const isAuthenticated = ref(false);

  // Listas del usuario
  const favorites = ref<Show[]>([]);
  const watchlist = ref<Show[]>([]);
  const watched = ref<Show[]>([]);

  // Getters computados
  const favoritesCount = computed(() => favorites.value.length);
  const watchlistCount = computed(() => watchlist.value.length);
  const watchedCount = computed(() => watched.value.length);

  // Acciones para manejar favoritos
  const addToFavorites = (show: Show) => {
    if (!favorites.value.find(item => item.id === show.id && item.type === show.type)) {
      favorites.value.push(show);
      saveToLocalStorage();
    }
  };

  const removeFromFavorites = (showId: number, type: string) => {
    favorites.value = favorites.value.filter(item => !(item.id === showId && item.type === type));
    saveToLocalStorage();
  };

  const isFavorite = (showId: number, type: string) => {
    return favorites.value.some(item => item.id === showId && item.type === type);
  };

  // Acciones para manejar watchlist
  const addToWatchlist = (show: Show) => {
    if (!watchlist.value.find(item => item.id === show.id && item.type === show.type)) {
      watchlist.value.push(show);
      saveToLocalStorage();
    }
  };

  const removeFromWatchlist = (showId: number, type: string) => {
    watchlist.value = watchlist.value.filter(item => !(item.id === showId && item.type === type));
    saveToLocalStorage();
  };

  const isInWatchlist = (showId: number, type: string) => {
    return watchlist.value.some(item => item.id === showId && item.type === type);
  };

  // Acciones para manejar watched
  const addToWatched = (show: Show) => {
    if (!watched.value.find(item => item.id === show.id && item.type === show.type)) {
      watched.value.push(show);
      saveToLocalStorage();
    }
  };

  const removeFromWatched = (showId: number, type: string) => {
    watched.value = watched.value.filter(item => !(item.id === showId && item.type === type));
    saveToLocalStorage();
  };

  const isWatched = (showId: number, type: string) => {
    return watched.value.some(item => item.id === showId && item.type === type);
  };

  // Persistencia en localStorage
  const saveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-favorites', JSON.stringify(favorites.value));
      localStorage.setItem('user-watchlist', JSON.stringify(watchlist.value));
      localStorage.setItem('user-watched', JSON.stringify(watched.value));
    }
  };

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedFavorites = localStorage.getItem('user-favorites');
        const savedWatchlist = localStorage.getItem('user-watchlist');
        const savedWatched = localStorage.getItem('user-watched');

        if (savedFavorites) favorites.value = JSON.parse(savedFavorites);
        if (savedWatchlist) watchlist.value = JSON.parse(savedWatchlist);
        if (savedWatched) watched.value = JSON.parse(savedWatched);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  };

  // Inicializar datos desde localStorage
  loadFromLocalStorage();

  return {
    // Estado
    currentUser,
    isAuthenticated,
    favorites,
    watchlist,
    watched,

    // Getters
    favoritesCount,
    watchlistCount,
    watchedCount,

    // Acciones
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToWatched,
    removeFromWatched,
    isWatched,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
}); 