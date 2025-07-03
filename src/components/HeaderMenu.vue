<template>
  <div class="p-4 flex items-center justify-center bg-transparent w-full">
    <div class="flex items-center bg-[#353542] rounded-2xl px-4 h-12 w-full max-w-2xl shadow-md relative">
      <!-- Iconos de navegación solo en escritorio, ahora a la izquierda -->
      <div class="hidden md:flex items-center gap-4 mr-4">
        <router-link to="/" class="text-gray-300 hover:text-white" title="Explore">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l-4 8-4-4 8-4z"/></svg>
        </router-link>
        <router-link to="/watchlist" class="text-gray-300 hover:text-white" title="My shows">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><rect x="3" y="5" width="18" height="12" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9l5 3-5 3V9z"/></svg>
        </router-link>
        <router-link to="/calendar" class="text-gray-300 hover:text-white" title="Calendar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><rect x="3" y="7" width="18" height="14" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3v4M8 3v4M3 11h18"/></svg>
        </router-link>
        <router-link to="/notifications" class="text-gray-300 hover:text-white" title="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </router-link>
      </div>
      <button class="mr-2">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <input
        v-model="searchQuery"
        @input="handleSearch"
        @focus="showResults = true"
        @blur="handleBlur"
        type="text"
        placeholder="Search"
        class="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-base px-2"
        :disabled="!isAuthenticated || loading"
      />
      
      <!-- Botones de autenticación -->
      <div class="flex items-center ml-2 gap-2">
        <div v-if="authUser" class="flex items-center gap-2">
          <span class="text-white text-sm hidden md:block">{{ authUser.name }}</span>
          <img src="/avatar.png" alt="Avatar" class="w-8 h-8 rounded-full" />
          <button @click="handleLogout" class="text-gray-300 hover:text-white text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <div v-else class="flex items-center gap-2">
          <router-link to="/login" class="text-white bg-[#e50914] hover:bg-[#cc0812] px-3 py-1 rounded-md text-sm font-medium transition-colors">
            Login
          </router-link>
          <router-link to="/register" class="text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm font-medium transition-colors border border-gray-600 hover:border-gray-400">
            Registro
          </router-link>
        </div>
      </div>
      
      <!-- Resultados de búsqueda -->
      <div v-if="showResults && searchQuery" class="absolute left-0 right-0 top-14 z-50 bg-[#23232b] rounded-xl shadow-2xl max-h-96 min-w-full border border-gray-700 animate-fade-in custom-scrollbar">
        <SearchResults
          :movies="searchResults.movies"
          :series="searchResults.series"
          :loading="searchLoading"
          :error="searchError"
          :query="searchQuery"
          :show-results="showResults"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useTVDB } from '../utils/useTVDB';
import { useAuth } from '../composables/useAuth';
import SearchResults from './SearchResults.vue';

const userStore = useUserStore();
const { searchShows, isAuthenticated, loading, loginAndFetchContent } = useTVDB();
const { user: authUser, logout } = useAuth();

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

// Función para manejar el logout
const handleLogout = () => {
  logout();
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

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  background: #23232b;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #444456;
  border-radius: 4px;
}
.custom-scrollbar {
  scrollbar-color: #444456 #23232b;
  scrollbar-width: thin;
}
</style>
