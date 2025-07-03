<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { useTVDB } from "../utils/useTVDB";
import { useUserStore } from "../stores/userStore";
import type { Show } from "../stores/userStore";
import EpisodesSection from "../components/EpisodesSection.vue";

const route = useRoute();
const { fetchSeriesDetails, fetchSeriesEpisodes, isAuthenticated, loginAndFetchContent } = useTVDB();
const userStore = useUserStore();

const seriesId = ref<string | string[]>(route.params.id);
const seriesDetails = ref<any | null>(null);
const loadingDetails = ref(true);
const errorDetails = ref<string | null>(null);

// Estado para episodios
const episodesData = ref<any | null>(null);
const loadingEpisodes = ref(false);
const errorEpisodes = ref<string | null>(null);

const loadSeriesEpisodes = async (id: string | string[]) => {
  loadingEpisodes.value = true;
  errorEpisodes.value = null;
  try {
    const episodes = await fetchSeriesEpisodes(id as string);
    episodesData.value = episodes;
  } catch (err) {
    errorEpisodes.value =
      err instanceof Error
        ? err.message
        : "Error desconocido al cargar episodios.";
    console.error("Error al cargar episodios de la serie:", err);
  } finally {
    loadingEpisodes.value = false;
  }
};

const loadSeriesDetails = async (id: string | string[]) => {
  loadingDetails.value = true;
  errorDetails.value = null;
  try {
    const details = await fetchSeriesDetails(id as string);
    seriesDetails.value = details;
    // Cargar episodios después de cargar detalles
    await loadSeriesEpisodes(id);
  } catch (err) {
    errorDetails.value =
      err instanceof Error
        ? err.message
        : "Error desconocido al cargar detalles.";
    console.error("Error al cargar detalles de la serie:", err);
  } finally {
    loadingDetails.value = false;
  }
};

watch(
  isAuthenticated,
  (isAuth) => {
    if (isAuth && seriesId.value) {
      loadSeriesDetails(seriesId.value);
    } else if (!isAuth) {
      seriesDetails.value = null;
      errorDetails.value =
        "No se pudo autenticar para cargar los detalles de la serie.";
      loadingDetails.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => route.params.id,
  (newId) => {
    if (newId && isAuthenticated.value) {
      seriesId.value = newId;
      loadSeriesDetails(newId);
    }
  }
);

onMounted(() => {
  if (!isAuthenticated.value) {
    loginAndFetchContent();
  }
});

const getYearFromDate = (dateString: string | null) => {
  return dateString ? new Date(dateString).getFullYear() : 'N/A';
};

// Funciones para los botones - usando la misma lógica que CardSection.vue
const toggleWatchlist = async () => {
  if (!seriesDetails.value) return;
  
  try {
    const showData: Show = {
      id: seriesDetails.value.id,
      name: seriesDetails.value.name,
      image: seriesDetails.value.image,
      type: 'series',
      year: seriesDetails.value.year
    };
    
    console.log(`🔄 Toggle watchlist: ${seriesDetails.value.name} (series)`);
    
    // Verificar estado actual desde la BD (asíncrono)
    const isCurrentlyInWatchlist = await userStore.checkIsInWatchlist(seriesDetails.value.id, 'series');
    
    if (isCurrentlyInWatchlist) {
      // Si ya está, quitarlo
      await userStore.removeFromWatchlist(seriesDetails.value.id, 'series');
      console.log(`❌ ${seriesDetails.value.name} removido de watchlist`);
    } else {
      // Si no está, agregarlo
      await userStore.addToWatchlist(showData);
      console.log(`✅ ${seriesDetails.value.name} agregado a watchlist`);
    }
    
    // Forzar actualización del caché local
    await userStore.loadUserData();
  } catch (error) {
    console.error('Error en toggleWatchlist:', error);
  }
};

const toggleWatched = async () => {
  if (!seriesDetails.value) return;
  
  try {
    const showData: Show = {
      id: seriesDetails.value.id,
      name: seriesDetails.value.name,
      image: seriesDetails.value.image,
      type: 'series',
      year: seriesDetails.value.year
    };
    
    console.log(`🔄 Toggle watched: ${seriesDetails.value.name} (series)`);
    
    // Verificar estado actual desde la BD (asíncrono)
    const isCurrentlyWatched = await userStore.checkIsWatched(seriesDetails.value.id, 'series');
    
    if (isCurrentlyWatched) {
      // Si ya está, quitarlo
      await userStore.removeFromWatched(seriesDetails.value.id, 'series');
      console.log(`❌ ${seriesDetails.value.name} removido de watched`);
    } else {
      // Si no está, agregarlo
      await userStore.addToWatched(showData);
      console.log(`✅ ${seriesDetails.value.name} agregado a watched`);
    }
    
    // Forzar actualización del caché local
    await userStore.loadUserData();
  } catch (error) {
    console.error('Error en toggleWatched:', error);
  }
};

const toggleFavorite = async () => {
  if (!seriesDetails.value) return;
  
  try {
    const showData: Show = {
      id: seriesDetails.value.id,
      name: seriesDetails.value.name,
      image: seriesDetails.value.image,
      type: 'series',
      year: seriesDetails.value.year
    };
    
    console.log(`🔄 Toggle favoritos: ${seriesDetails.value.name} (series)`);
    
    // Verificar estado actual desde la BD (asíncrono)
    const isCurrentlyFavorite = await userStore.checkIsFavorite(seriesDetails.value.id, 'series');
    
    if (isCurrentlyFavorite) {
      // Si ya está, quitarlo
      await userStore.removeFromFavorites(seriesDetails.value.id, 'series');
      console.log(`❌ ${seriesDetails.value.name} removido de favoritos`);
    } else {
      // Si no está, agregarlo
      await userStore.addToFavorites(showData);
      console.log(`✅ ${seriesDetails.value.name} agregado a favoritos`);
    }
    
    // Forzar actualización del caché local
    await userStore.loadUserData();
  } catch (error) {
    console.error('Error en toggleFavorite:', error);
  }
};

// Funciones para verificar el estado actual
const isFavorite = () => {
  if (!seriesDetails.value) return false;
  return userStore.isFavorite(seriesDetails.value.id, 'series');
};

const isInWatchlist = () => {
  if (!seriesDetails.value) return false;
  return userStore.isInWatchlist(seriesDetails.value.id, 'series');
};

const isWatched = () => {
  if (!seriesDetails.value) return false;
  return userStore.isWatched(seriesDetails.value.id, 'series');
};
</script>

<template>
  <!-- Vista móvil mejorada -->
  <div class="min-h-screen bg-gray-900 text-white md:hidden flex flex-col">
    <!-- Hero section con imagen de fondo -->
    <div class="relative w-full h-screen overflow-hidden">
      <img 
        v-if="seriesDetails && seriesDetails.image" 
        :src="seriesDetails.image" 
        :alt="seriesDetails.name" 
        class="w-full h-full object-cover object-center" 
      />
      <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">
        No image
      </div>
      
      <!-- Gradiente overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
      
      <!-- Header con botones de navegación -->
      <div class="absolute top-6 left-4 right-4 flex justify-between items-center z-20">
        <button @click="$router.back()" class="bg-black/40 backdrop-blur-sm rounded-full p-3 hover:bg-black/60 transition-all">
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="bg-black/40 backdrop-blur-sm rounded-full p-3 hover:bg-black/60 transition-all">
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="12" r="2" />
          </svg>
        </button>
      </div>
      
      <!-- Información de la serie -->
      <div class="absolute bottom-0 left-0 right-0 p-6 z-10">
        <!-- Badge de red -->
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">TV-series</span>
        </div>
        
        <!-- Título -->
        <h1 class="text-4xl font-bold mb-3 leading-tight">{{ seriesDetails?.name }}</h1>
        
        <!-- Metadata -->
        <div class="flex items-center gap-2 mb-4 flex-wrap">
          <span v-if="seriesDetails && seriesDetails.score" class="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span>IMDb</span>
            <span>{{ (seriesDetails.score / 1000).toFixed(1) }}</span>
          </span>
          <span v-if="seriesDetails && seriesDetails.year" class="text-white text-sm">{{ seriesDetails.year }}</span>
          <span v-if="episodesData && episodesData.totalSeasons" class="text-white text-sm">• {{ episodesData.totalSeasons }} season{{ episodesData.totalSeasons > 1 ? 's' : '' }}</span>
          <span v-if="seriesDetails && seriesDetails.status && seriesDetails.status.name" class="text-white text-sm">• {{ seriesDetails.status.name }}</span>
          <span v-if="seriesDetails && seriesDetails.averageRuntime" class="text-white text-sm">• {{ seriesDetails.averageRuntime }}m</span>
        </div>
        
        <!-- Géneros -->
        <div v-if="seriesDetails && seriesDetails.genres && seriesDetails.genres.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span v-for="genre in seriesDetails.genres.slice(0, 3)" :key="genre.id" class="text-white text-sm">
            {{ genre.name }}
          </span>
        </div>
        
        <!-- Descripción -->
        <p v-if="seriesDetails && seriesDetails.overview" class="text-gray-200 text-sm mb-6 line-clamp-3 leading-relaxed">
          {{ seriesDetails.overview }}
        </p>
        
        <!-- Creadores -->
        <div v-if="seriesDetails && seriesDetails.creators && seriesDetails.creators.length > 0" class="text-sm text-gray-300 mb-6">
          <span class="font-semibold">Creators: </span>
          <span>{{ seriesDetails.creators.map((c: any) => c.name).join(', ') }}</span>
        </div>
        
        <!-- Botón principal -->
        <button class="w-full bg-white text-black font-bold py-4 rounded-lg text-lg mb-4 flex items-center justify-center gap-2 shadow-lg hover:bg-gray-100 transition-colors">
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Start watching
        </button>
        
        <!-- Botones de acción -->
        <div class="flex justify-center gap-8 mb-4">
          <button class="flex flex-col items-center gap-1" @click="toggleWatchlist">
            <div :class="[
              'backdrop-blur-sm rounded-full p-3 transition-colors',
              isInWatchlist() ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-300'
            ]">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">{{ isInWatchlist() ? 'Remove from watchlist' : 'Add to watchlist' }}</span>
          </button>
          
          <button class="flex flex-col items-center gap-1" @click="toggleWatched">
            <div :class="[
              'backdrop-blur-sm rounded-full p-3 transition-colors',
              isWatched() ? 'bg-green-600 text-white' : 'bg-gray-800/80 text-gray-300'
            ]">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">{{ isWatched() ? 'Remove from watched' : 'Mark as watched' }}</span>
          </button>
          
          <button class="flex flex-col items-center gap-1" @click="toggleFavorite">
            <div :class="[
              'backdrop-blur-sm rounded-full p-3 transition-colors',
              isFavorite() ? 'bg-red-600 text-white' : 'bg-gray-800/80 text-gray-300'
            ]">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">{{ isFavorite() ? 'Remove from favorites' : 'Add to favorites' }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Contenido desplazable -->
    <div class="bg-gray-900 -mt-6 relative z-20 rounded-t-3xl min-h-screen">
      <!-- Sección de episodios -->
      <div class="pt-8 px-4">
        <EpisodesSection 
          :episodesBySeasons="episodesData?.episodesBySeasons || {}"
          :loading="loadingEpisodes"
          :error="errorEpisodes"
          :seriesId="parseInt(seriesId as string)"
        />
      </div>
    </div>
  </div>
  <!-- Vista escritorio mejorada -->
  <div class="hidden md:block min-h-screen bg-gray-900 text-white">
    <div v-if="loadingDetails" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-xl text-gray-400">Cargando detalles de la serie...</p>
      </div>
    </div>

    <div v-else-if="errorDetails" class="flex items-center justify-center h-screen">
      <div class="bg-red-900/80 backdrop-blur-sm p-8 rounded-xl text-red-200 text-center max-w-md">
        <h2 class="text-2xl font-bold mb-4">¡Error al cargar los detalles!</h2>
        <p class="mb-4">{{ errorDetails }}</p>
        <router-link to="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Volver al inicio
        </router-link>
      </div>
    </div>

    <div v-else-if="seriesDetails" class="relative">
      <!-- Hero section a pantalla completa -->
      <div class="relative w-full h-screen overflow-hidden">
        <img
          v-if="seriesDetails.image"
          :src="seriesDetails.image"
          :alt="seriesDetails.name || 'Poster'"
          class="w-full h-full object-cover object-center"
        />
        <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-2xl">
          No hay imagen disponible
        </div>

        <!-- Gradiente overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/20"></div>

        <!-- Header con navegación -->
        <div class="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
          <router-link to="/" class="bg-black/40 backdrop-blur-sm rounded-full p-3 hover:bg-black/60 transition-all">
            <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </div>

        <!-- Información principal -->
        <div class="absolute bottom-0 left-0 right-0 p-12 z-10">
          <div class="max-w-4xl">
            <!-- Badge de serie -->
            <div class="flex items-center gap-3 mb-4">
              <span class="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">TV Series</span>
              <span v-if="seriesDetails.networks && seriesDetails.networks.length > 0" class="text-gray-300 text-sm">
                {{ seriesDetails.networks[0].name }}
              </span>
            </div>

            <!-- Título -->
            <h1 class="text-6xl font-bold mb-4 leading-tight">{{ seriesDetails.name }}</h1>

            <!-- Metadata -->
            <div class="flex items-center gap-4 mb-6 flex-wrap">
              <span v-if="seriesDetails.score" class="bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded flex items-center gap-2">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                </svg>
                {{ (seriesDetails.score / 1000).toFixed(1) }}
              </span>
              <span v-if="seriesDetails.firstAired" class="text-white text-lg">{{ getYearFromDate(seriesDetails.firstAired) }}</span>
              <span v-if="episodesData && episodesData.totalSeasons" class="text-white text-lg">• {{ episodesData.totalSeasons }} season{{ episodesData.totalSeasons > 1 ? 's' : '' }}</span>
              <span v-if="seriesDetails.status && seriesDetails.status.name" class="text-white text-lg">• {{ seriesDetails.status.name }}</span>
              <span v-if="seriesDetails.averageRuntime" class="text-white text-lg">• {{ seriesDetails.averageRuntime }}m</span>
            </div>

            <!-- Géneros -->
            <div v-if="seriesDetails.genres && seriesDetails.genres.length > 0" class="flex flex-wrap gap-3 mb-6">
              <span v-for="genre in seriesDetails.genres.slice(0, 4)" :key="genre.id" class="text-white text-lg">
                {{ genre.name }}
              </span>
            </div>

            <!-- Descripción -->
            <p v-if="seriesDetails.overview" class="text-gray-200 text-lg mb-8 max-w-3xl leading-relaxed line-clamp-4">
              {{ seriesDetails.overview }}
            </p>

            <!-- Creadores -->
            <div v-if="seriesDetails.creators && seriesDetails.creators.length > 0" class="text-lg text-gray-300 mb-8">
              <span class="font-semibold">Creators: </span>
              <span>{{ seriesDetails.creators.map((c: any) => c.name).join(', ') }}</span>
            </div>

            <!-- Botones de acción -->
            <div class="flex items-center gap-6">
              <!-- Botón principal -->
              <button class="bg-white text-black font-bold py-4 px-8 rounded-lg text-xl flex items-center gap-3 shadow-lg hover:bg-gray-100 transition-colors">
                <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Start watching
              </button>

              <!-- Botones secundarios -->
              <button :class="[
                'flex items-center gap-2 font-semibold py-4 px-6 rounded-lg transition-all',
                isInWatchlist() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700/80'
              ]" @click="toggleWatchlist">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ isInWatchlist() ? 'Remove from watchlist' : 'Add to watchlist' }}
              </button>

              <button :class="[
                'flex items-center gap-2 font-semibold py-4 px-6 rounded-lg transition-all',
                isWatched() ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700/80'
              ]" @click="toggleWatched">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {{ isWatched() ? 'Remove from watched' : 'Mark as watched' }}
              </button>

              <button :class="[
                'flex items-center gap-2 font-semibold py-4 px-6 rounded-lg transition-all',
                isFavorite() ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700/80'
              ]" @click="toggleFavorite">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {{ isFavorite() ? 'Remove from favorites' : 'Add to favorites' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido adicional -->
      <div class="bg-gray-900 -mt-12 relative z-20 rounded-t-3xl">
        <div class="px-12 pt-16 pb-12">
          <!-- Galería de Arte -->
          <div v-if="seriesDetails.artworks && seriesDetails.artworks.length > 0" class="mb-12">
            <h3 class="text-2xl font-semibold mb-6">Gallery</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="artwork in seriesDetails.artworks.slice(0, 12)"
                :key="artwork.id"
                class="aspect-video rounded-lg overflow-hidden bg-gray-800 cursor-pointer hover:scale-105 transition-transform duration-300"
                @click="seriesDetails.image = artwork.image || artwork.thumbnail"
              >
                <img
                  v-if="artwork.thumbnail"
                  :src="artwork.thumbnail"
                  :alt="`Artwork ${artwork.id}`"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500 text-sm"
                >
                  No image
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de episodios -->
          <EpisodesSection 
            :episodesBySeasons="episodesData?.episodesBySeasons || {}"
            :loading="loadingEpisodes"
            :error="errorEpisodes"
            :seriesId="parseInt(seriesId as string)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Oculta scroll en todos los navegadores modernos */
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Safari y Chrome */
}

/* Utilidad para limitar líneas de texto */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mejor aspecto para los gradientes en móvil */
@media (max-width: 768px) {
  .bg-gradient-to-t {
    background: linear-gradient(to top, rgb(17, 24, 39) 0%, rgba(17, 24, 39, 0.9) 30%, rgba(17, 24, 39, 0.7) 60%, transparent 100%);
  }
}
</style>