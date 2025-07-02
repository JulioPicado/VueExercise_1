<template>
  <div
    class="p-4 flex items-center justify-between bg-gray-900 border-b border-gray-800"
  >
    <!-- Logo y navegación principal -->
    <div class="flex items-center space-x-6">
      <router-link to="/" class="flex items-center space-x-2">
        <img
          src="/netflixlogo.png"
          alt="Logo"
          class="h-8 w-auto hover:scale-110 transition-transform duration-200"
        />
      </router-link>
      
      <!-- Navegación a las listas del usuario -->
      <div class="flex items-center space-x-4">
        <router-link 
          to="/favorites" 
          class="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
        >
          <span class="text-xl">❤️</span>
          <span class="hidden sm:inline">Favoritos</span>
          <span v-if="favoritesCount > 0" class="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            {{ favoritesCount }}
          </span>
        </router-link>
        
        <router-link 
          to="/watchlist" 
          class="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
        >
          <span class="text-xl">📺</span>
          <span class="hidden sm:inline">Watchlist</span>
          <span v-if="watchlistCount > 0" class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {{ watchlistCount }}
          </span>
        </router-link>
        
        <router-link 
          to="/watched" 
          class="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
        >
          <span class="text-xl">✅</span>
          <span class="hidden sm:inline">Vistas</span>
          <span v-if="watchedCount > 0" class="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {{ watchedCount }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Barra de búsqueda -->
    <div class="relative flex w-[40%] items-center bg-gray-800 rounded-full">
      <button class="mr-3 ml-4 p-2">
        <svg
          class="h-5 w-5 inline-block hover:text-gray-400 transition-colors duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      <input
        v-model="searchQuery"
        @input="handleSearch"
        @focus="showResults = true"
        @blur="handleBlur"
        type="text"
        placeholder="Buscar shows..."
        class="w-full p-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-full"
        :disabled="!isAuthenticated || loading"
      />
      
      <!-- Resultados de búsqueda -->
      <SearchResults
        :movies="searchResults.movies"
        :series="searchResults.series"
        :loading="searchLoading"
        :error="searchError"
        :query="searchQuery"
        :show-results="showResults"
      />

      <div v-if="loading" class="absolute left-0 right-0 top-full bg-gray-900 text-blue-400 text-center py-2 rounded-b-lg z-50">
        Autenticando con TheTVDB...
      </div>
    </div>

    <!-- Avatar del usuario -->
    <div class="flex items-center space-x-3">
      <img
        src="/avatar.png"
        alt="Avatar"
        class="w-10 h-10 rounded-full hover:scale-125 transition-transform duration-200 cursor-pointer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useTVDB } from '../utils/useTVDB';
import SearchResults from './SearchResults.vue';

const userStore = useUserStore();
const { searchShows, isAuthenticated, loading, loginAndFetchContent } = useTVDB();

const favoritesCount = computed(() => userStore.favoritesCount);
const watchlistCount = computed(() => userStore.watchlistCount);
const watchedCount = computed(() => userStore.watchedCount);

// Estado de búsqueda
const searchQuery = ref('');
const searchResults = ref({ movies: [], series: [] });
const searchLoading = ref(false);
const searchError = ref<string | null>(null);
const showResults = ref(false);
let searchTimeout: number | null = null;

// Función para manejar la búsqueda con debounce
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (!searchQuery.value.trim()) {
    searchResults.value = { movies: [], series: [] };
    searchError.value = null;
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    searchLoading.value = true;
    searchError.value = null;
    
    try {
      const results = await searchShows(searchQuery.value);
      searchResults.value = results;
    } catch (error) {
      searchError.value = error instanceof Error ? error.message : 'Error al buscar';
      searchResults.value = { movies: [], series: [] };
    } finally {
      searchLoading.value = false;
    }
  }, 300); // Debounce de 300ms
};

// Función para manejar el blur del input
const handleBlur = () => {
  // Pequeño delay para permitir que los clicks en los resultados funcionen
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};

// Limpiar timeout al desmontar
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});

onMounted(() => {
  loginAndFetchContent();
});
</script>
