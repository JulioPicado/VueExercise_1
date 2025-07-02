<template>
  <transition name="fade-slide">
    <div v-if="showResults" class="absolute top-full left-0 right-0 z-50 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto mt-2 animate-dropdown">
      <div v-if="loading" class="p-6 text-center text-gray-400">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2">Buscando...</p>
      </div>
      <div v-else-if="error" class="p-6 text-center text-red-400">
        {{ error }}
      </div>
      <div v-else-if="!hasResults" class="p-6 text-center text-gray-400">
        <p>No se encontraron resultados para "{{ query }}"</p>
        <p class="text-xs text-gray-500 mt-2">La API de TheTVDB puede ser limitada en búsquedas genéricas. Intenta con un título más específico.</p>
      </div>
      <div v-else class="p-2 space-y-4">
        <!-- Películas -->
        <div v-if="movies.length > 0">
          <h3 class="text-xs font-bold text-gray-400 mb-2 px-2 tracking-widest uppercase">Películas</h3>
          <div class="divide-y divide-gray-700">
            <div 
              v-for="movie in (movies as any[]).filter(m => m.id)"
              :key="`movie-${movie.id}`"
              class="flex items-center space-x-4 p-3 hover:bg-gray-700/80 rounded-lg transition-colors duration-200 cursor-pointer group"
              @click="selectShow(movie)"
              :title="''"
            >
              <img 
                v-if="movie.image"
                :src="movie.image"
                :alt="movie.name"
                class="w-14 h-20 object-cover rounded-lg border border-gray-600 bg-gray-900 group-hover:scale-105 transition-transform duration-200"
                @error="handleImageError"
              />
              <div v-else class="w-14 h-20 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 text-gray-500 text-xs">No image</div>
              <div class="flex-1 min-w-0">
                <h4 class="text-white font-semibold truncate">{{ movie.name }}</h4>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span v-if="movie.year">{{ movie.year }}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/60 text-blue-300 rounded-full">
                    <svg v-if="movie.type === 'movie'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/></svg>
                    Película
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1 items-end">
                <button 
                  @click.stop="addToFavorites(movie)"
                  :class="[
                    'p-1 rounded-full text-xs',
                    isFavorite(movie) ? 'text-red-500 bg-gray-900' : 'text-gray-400 hover:text-red-500 bg-gray-800 hover:bg-gray-700'
                  ]"
                  :title="isFavorite(movie) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                >
                  ❤️
                </button>
                <button 
                  @click.stop="addToWatchlist(movie)"
                  :class="[
                    'p-1 rounded-full text-xs',
                    isInWatchlist(movie) ? 'text-blue-500 bg-gray-900' : 'text-gray-400 hover:text-blue-500 bg-gray-800 hover:bg-gray-700'
                  ]"
                  :title="isInWatchlist(movie) ? 'Quitar de watchlist' : 'Agregar a watchlist'"
                >
                  📺
                </button>
              </div>
            </div>
            <!-- Resultados no válidos -->
            <div v-for="movie in (movies as any[]).filter(m => !m.id)" :key="`movie-invalid-${movie.name}`" class="flex items-center space-x-4 p-3 rounded-lg cursor-not-allowed opacity-60 bg-gray-800 mt-2" :title="'No se puede ver el detalle de este resultado (ID inválido o no disponible)'">
              <div class="w-14 h-20 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 text-gray-500 text-xs">No image</div>
              <div class="flex-1 min-w-0">
                <h4 class="text-white font-medium truncate">{{ movie.name }}</h4>
                <p class="text-xs text-gray-400">{{ movie.year }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Separador -->
        <div v-if="movies.length > 0 && series.length > 0" class="border-t border-gray-700 my-2"></div>
        <!-- Series -->
        <div v-if="series.length > 0">
          <h3 class="text-xs font-bold text-gray-400 mb-2 px-2 tracking-widest uppercase">Series</h3>
          <div class="divide-y divide-gray-700">
            <div 
              v-for="serie in (series as any[]).filter(s => s.id)"
              :key="`series-${serie.id}`"
              class="flex items-center space-x-4 p-3 hover:bg-gray-700/80 rounded-lg transition-colors duration-200 cursor-pointer group"
              @click="selectShow(serie)"
              :title="''"
            >
              <img 
                v-if="serie.image"
                :src="serie.image"
                :alt="serie.name"
                class="w-14 h-20 object-cover rounded-lg border border-gray-600 bg-gray-900 group-hover:scale-105 transition-transform duration-200"
                @error="handleImageError"
              />
              <div v-else class="w-14 h-20 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 text-gray-500 text-xs">No image</div>
              <div class="flex-1 min-w-0">
                <h4 class="text-white font-semibold truncate">{{ serie.name }}</h4>
                <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span v-if="serie.year">{{ serie.year }}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900/60 text-purple-300 rounded-full">
                    <svg v-if="serie.type === 'series'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/></svg>
                    Serie
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-1 items-end">
                <button 
                  @click.stop="addToFavorites(serie)"
                  :class="[
                    'p-1 rounded-full text-xs',
                    isFavorite(serie) ? 'text-red-500 bg-gray-900' : 'text-gray-400 hover:text-red-500 bg-gray-800 hover:bg-gray-700'
                  ]"
                  :title="isFavorite(serie) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                >
                  ❤️
                </button>
                <button 
                  @click.stop="addToWatchlist(serie)"
                  :class="[
                    'p-1 rounded-full text-xs',
                    isInWatchlist(serie) ? 'text-blue-500 bg-gray-900' : 'text-gray-400 hover:text-blue-500 bg-gray-800 hover:bg-gray-700'
                  ]"
                  :title="isInWatchlist(serie) ? 'Quitar de watchlist' : 'Agregar a watchlist'"
                >
                  📺
                </button>
              </div>
            </div>
            <!-- Resultados no válidos -->
            <div v-for="serie in (series as any[]).filter(s => !s.id)" :key="`series-invalid-${serie.name}`" class="flex items-center space-x-4 p-3 rounded-lg cursor-not-allowed opacity-60 bg-gray-800 mt-2" :title="'No se puede ver el detalle de este resultado (ID inválido o no disponible)'">
              <div class="w-14 h-20 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 text-gray-500 text-xs">No image</div>
              <div class="flex-1 min-w-0">
                <h4 class="text-white font-medium truncate">{{ serie.name }}</h4>
                <p class="text-xs text-gray-400">{{ serie.year }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import type { Show } from '../stores/userStore';
import { useTVDB } from '../utils/useTVDB';

interface Props {
  movies: any[];
  series: any[];
  loading: boolean;
  error: string | null;
  query: string;
  showResults: boolean;
}

const props = defineProps<Props>();

const router = useRouter();
const userStore = useUserStore();
const { movieList } = useTVDB();

const hasResults = computed(() => props.movies.length > 0 || props.series.length > 0);

const selectShow = (show: any) => {
  // Extraer solo el número del id si viene como 'movie-63' o 'series-123'
  let cleanId = show.id;
  if (typeof cleanId === 'string') {
    const match = cleanId.match(/(\d+)/);
    if (match) {
      cleanId = match[1];
    }
  }
  if (show.type === 'movie') {
    // Buscar coincidencia exacta en movieList por nombre
    const match = movieList.value.find((m: any) => m.name && show.name && m.name.toLowerCase() === show.name.toLowerCase());
    if (match) {
      router.push(`/movie/${match.id}`);
    } else {
      router.push(`/movie/${cleanId}`);
    }
  } else {
    router.push(`/series/${cleanId}`);
  }
};

const addToFavorites = (show: any) => {
  const showData: Show = {
    id: show.id,
    name: show.name,
    image: show.image,
    type: show.type,
    year: show.year
  };
  userStore.addToFavorites(showData);
};

const addToWatchlist = (show: any) => {
  const showData: Show = {
    id: show.id,
    name: show.name,
    image: show.image,
    type: show.type,
    year: show.year
  };
  userStore.addToWatchlist(showData);
};

const isFavorite = (show: any) => {
  return userStore.isFavorite(show.id, show.type);
};

const isInWatchlist = (show: any) => {
  return userStore.isInWatchlist(show.id, show.type);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/netflixlogo.png';
};
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.animate-dropdown {
  animation: dropdownAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes dropdownAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 