<template>
  <div class="p-4 flex items-center justify-center bg-transparent min-w-full max-w-xs">
    <div class="flex items-center bg-[#353542] rounded-2xl px-4 h-12 w-full max-w-xs shadow-md relative">
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
      <img src="/avatar.png" alt="Avatar" class="w-8 h-8 rounded-full ml-2" />
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
