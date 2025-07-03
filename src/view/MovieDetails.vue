<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, watch, computed } from "vue";
import { useTVDB } from "../utils/useTVDB";
import { useUserStore } from "../stores/userStore";
import type { Show } from "../stores/userStore";

// Ruta y datos de la película
const route = useRoute();
const { fetchMovieDetails, isAuthenticated, loginAndFetchContent } = useTVDB();
const userStore = useUserStore();

const movieId = ref<string | string[]>(route.params.id);
const movieDetails = ref<any | null>(null);
const loadingDetails = ref(true);
const errorDetails = ref<string | null>(null);

/**
 * Función para cargar los detalles de la película
 */
const loadMovieDetails = async (id: string | string[]) => {
  loadingDetails.value = true;
  errorDetails.value = null;
  try {
    const details = await fetchMovieDetails(id as string);
    movieDetails.value = details;
  } catch (err) {
    errorDetails.value =
      err instanceof Error
        ? err.message
        : "Error desconocido al cargar detalles.";
    console.error("Error al cargar detalles de la película:", err);
  } finally {
    loadingDetails.value = false;
  }
};

// Computed properties para el estado de las listas
const isFavorite = computed(() => {
  if (!movieDetails.value) return false;
  return userStore.isFavorite(movieDetails.value.id, 'movie');
});

const isInWatchlist = computed(() => {
  if (!movieDetails.value) return false;
  return userStore.isInWatchlist(movieDetails.value.id, 'movie');
});

const isWatched = computed(() => {
  if (!movieDetails.value) return false;
  return userStore.isWatched(movieDetails.value.id, 'movie');
});

// Funciones para manejar las listas
const toggleFavorite = () => {
  if (!movieDetails.value) return;
  
  const show: Show = {
    id: movieDetails.value.id,
    name: movieDetails.value.name,
    image: movieDetails.value.image,
    type: 'movie',
    year: movieDetails.value.year
  };
  
  if (isFavorite.value) {
    userStore.removeFromFavorites(movieDetails.value.id, 'movie');
  } else {
    userStore.addToFavorites(show);
  }
};

const toggleWatchlist = () => {
  if (!movieDetails.value) return;
  
  const show: Show = {
    id: movieDetails.value.id,
    name: movieDetails.value.name,
    image: movieDetails.value.image,
    type: 'movie',
    year: movieDetails.value.year
  };
  
  if (isInWatchlist.value) {
    userStore.removeFromWatchlist(movieDetails.value.id, 'movie');
  } else {
    userStore.addToWatchlist(show);
  }
};

const toggleWatched = () => {
  if (!movieDetails.value) return;
  
  const show: Show = {
    id: movieDetails.value.id,
    name: movieDetails.value.name,
    image: movieDetails.value.image,
    type: 'movie',
    year: movieDetails.value.year
  };
  
  if (isWatched.value) {
    userStore.removeFromWatched(movieDetails.value.id, 'movie');
  } else {
    userStore.addToWatched(show);
  }
};

// Observar autenticación
watch(
  isAuthenticated,
  (isAuth) => {
    if (isAuth && movieId.value) {
      loadMovieDetails(movieId.value);
    } else if (!isAuth) {
      movieDetails.value = null;
      errorDetails.value =
        "No se pudo autenticar para cargar los detalles de la película.";
      loadingDetails.value = false;
    }
  },
  { immediate: true }
);

// Observar cambios de ID en la ruta
watch(
  () => route.params.id,
  (newId) => {
    if (newId && isAuthenticated.value) {
      // Solo si ya estamos autenticados
      movieId.value = newId;
      loadMovieDetails(newId);
    }
  }
);

// Cargar token si no se ha hecho aún (ejecuta loginAndFetchContent si no hay token)
onMounted(() => {
  if (!isAuthenticated.value) {
    loginAndFetchContent();
  }
});

watch(movieDetails, (val) => {
  // Eliminar el console.log que muestra los detalles de la película
  // console.log('Detalles de la película:', val);
}, { immediate: true });

function handleTrailerClick(url: string) {
  window.open(url, '_blank');
}
</script>

<template>
  <!-- Vista móvil mejorada -->
  <div class="min-h-screen bg-gray-900 text-white md:hidden flex flex-col">
    <!-- Hero section con imagen de fondo -->
    <div class="relative w-full h-screen overflow-hidden">
      <img 
        v-if="movieDetails && movieDetails.image" 
        :src="movieDetails.image" 
        :alt="movieDetails.name" 
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
      
      <!-- Información de la película -->
      <div class="absolute bottom-0 left-0 right-0 p-6 z-10">
        <!-- Badge de película -->
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Movie</span>
        </div>
        
        <!-- Título -->
        <h1 class="text-4xl font-bold mb-3 leading-tight">{{ movieDetails?.name }}</h1>
        
        <!-- Metadata -->
        <div class="flex items-center gap-2 mb-4 flex-wrap">
          <span v-if="movieDetails && movieDetails.score" class="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span>IMDb</span>
            <span>{{ (movieDetails.score / 1000).toFixed(1) }}</span>
          </span>
          <span v-if="movieDetails && movieDetails.year" class="text-white text-sm">{{ movieDetails.year }}</span>
          <span v-if="movieDetails && movieDetails.runtime" class="text-white text-sm">• {{ movieDetails.runtime }}m</span>
        </div>
        
        <!-- Géneros -->
        <div v-if="movieDetails && movieDetails.genres && movieDetails.genres.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span v-for="genre in movieDetails.genres.slice(0, 3)" :key="genre.id" class="text-white text-sm">
            {{ genre.name }}
          </span>
        </div>
        
        <!-- Descripción -->
        <p v-if="movieDetails && movieDetails.overview" class="text-gray-200 text-sm mb-6 line-clamp-3 leading-relaxed">
          {{ movieDetails.overview }}
        </p>
        
        <!-- Estudio -->
        <div v-if="movieDetails && movieDetails.studios && movieDetails.studios.length > 0" class="text-sm text-gray-300 mb-6">
          <span class="font-semibold">Studio: </span>
          <span>{{ movieDetails.studios[0].name }}</span>
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
            <div class="bg-gray-800/80 backdrop-blur-sm rounded-full p-3">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">Add to watchlist</span>
          </button>
          
          <button class="flex flex-col items-center gap-1" @click="toggleWatched">
            <div class="bg-gray-800/80 backdrop-blur-sm rounded-full p-3">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">Mark as watched</span>
          </button>
          
          <button class="flex flex-col items-center gap-1" @click="toggleFavorite">
            <div class="bg-gray-800/80 backdrop-blur-sm rounded-full p-3">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span class="text-xs text-gray-300">Add to favorites</span>
          </button>
        </div>
      </div>
    </div>
    
         <!-- Contenido desplazable -->
     <div class="bg-gray-900 -mt-6 relative z-20 rounded-t-3xl min-h-screen">
      <!-- Cast -->
       <div v-if="movieDetails && movieDetails.characters && movieDetails.characters.length" class="mb-6 mt-6 bg-[#23233a] rounded-xl px-3 py-4 shadow mx-4">
        <h3 class="text-base font-semibold mb-3 text-left">Cast</h3>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <div v-for="actor in (movieDetails.characters.filter((c: any) => c.peopleType === 'Actor' && c.personImgURL))" :key="actor.id" class="flex flex-col items-center w-24">
            <img :src="actor.personImgURL" class="w-16 h-16 rounded-full object-cover mb-1 border-2 border-gray-700 shadow" />
            <span class="text-xs text-center truncate w-20">{{ actor.personName }}</span>
          </div>
        </div>
      </div>
       
      <!-- Trailers -->
       <div v-if="movieDetails && movieDetails.trailers && movieDetails.trailers.length" class="mb-6 bg-[#23233a] rounded-xl px-3 py-4 shadow mx-4">
        <h3 class="text-base font-semibold mb-3 text-left">Trailers</h3>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <div v-for="trailer in movieDetails.trailers" :key="trailer.id" class="relative w-44 h-28 rounded-lg overflow-hidden cursor-pointer shadow" @click="handleTrailerClick(trailer.url)">
            <img :src="`https://img.youtube.com/vi/${trailer.url.split('v=')[1]}/0.jpg`" class="w-full h-full object-cover" />
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><polygon points="9.5,7.5 16.5,12 9.5,16.5"/></svg>
            </div>
          </div>
        </div>
      </div>
       
      <!-- Imágenes -->
       <div v-if="movieDetails && movieDetails.artworks && movieDetails.artworks.length" class="mb-6 bg-[#23233a] rounded-xl px-3 py-4 shadow mx-4">
        <h3 class="text-base font-semibold mb-3 text-left">Images</h3>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <img v-for="art in movieDetails.artworks" :key="art.id" :src="art.thumbnail || art.image" class="w-32 h-20 rounded-lg object-cover shadow" />
        </div>
      </div>
     </div>
   </div>
  <!-- Vista escritorio mejorada -->
  <div class="hidden md:block min-h-screen bg-gray-900 text-white">
    <div v-if="loadingDetails" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-xl text-gray-400">Cargando detalles de la película...</p>
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

    <div v-else-if="movieDetails" class="relative">
      <!-- Hero section a pantalla completa -->
      <div class="relative w-full h-screen overflow-hidden">
            <img
              v-if="movieDetails.image"
              :src="movieDetails.image"
              :alt="movieDetails.name || 'Poster'"
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
            <!-- Badge de película -->
            <div class="flex items-center gap-3 mb-4">
              <span class="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">Movie</span>
              <span v-if="movieDetails.studios && movieDetails.studios.length > 0" class="text-gray-300 text-sm">
                {{ movieDetails.studios[0].name }}
                </span>
            </div>

            <!-- Título -->
            <h1 class="text-6xl font-bold mb-4 leading-tight">{{ movieDetails.name }}</h1>

            <!-- Metadata -->
            <div class="flex items-center gap-4 mb-6 flex-wrap">
              <span v-if="movieDetails.score" class="bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded flex items-center gap-2">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                </svg>
                {{ (movieDetails.score / 1000).toFixed(1) }}
              </span>
              <span v-if="movieDetails.year" class="text-white text-lg">{{ movieDetails.year }}</span>
              <span v-if="movieDetails.runtime" class="text-white text-lg">• {{ movieDetails.runtime }}m</span>
          </div>

            <!-- Géneros -->
            <div v-if="movieDetails.genres && movieDetails.genres.length > 0" class="flex flex-wrap gap-3 mb-6">
              <span v-for="genre in movieDetails.genres.slice(0, 4)" :key="genre.id" class="text-white text-lg">
                {{ genre.name }}
              </span>
            </div>

            <!-- Descripción -->
            <p v-if="movieDetails.overview" class="text-gray-200 text-lg mb-8 max-w-3xl leading-relaxed line-clamp-4">
              {{ movieDetails.overview }}
            </p>

            <!-- Estudio -->
            <div v-if="movieDetails.studios && movieDetails.studios.length > 0" class="text-lg text-gray-300 mb-8">
              <span class="font-semibold">Studio: </span>
              <span>{{ movieDetails.studios[0].name }}</span>
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
              <button class="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-700/80 transition-all" @click="toggleWatchlist">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to watchlist
              </button>

              <button class="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-700/80 transition-all" @click="toggleWatched">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Mark as watched
                </button>

              <button class="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-700/80 transition-all" @click="toggleFavorite">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Add to favorites
                </button>
              </div>
            </div>
        </div>
      </div>

      <!-- Contenido adicional -->
      <div class="bg-gray-900 -mt-12 relative z-20 rounded-t-3xl">
        <div class="px-12 pt-16 pb-12">
          <!-- Cast -->
          <div v-if="movieDetails.characters && movieDetails.characters.length" class="mb-12">
            <h3 class="text-2xl font-semibold mb-6">Cast</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              <div v-for="actor in (movieDetails.characters.filter((c: any) => c.peopleType === 'Actor' && c.personImgURL).slice(0, 16))" :key="actor.id" class="flex flex-col items-center">
                <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-800 mb-3">
                  <img :src="actor.personImgURL" :alt="actor.personName" class="w-full h-full object-cover" />
                </div>
                <span class="text-sm text-center text-gray-300 leading-tight">{{ actor.personName }}</span>
              </div>
            </div>
          </div>

          <!-- Trailers -->
          <div v-if="movieDetails.trailers && movieDetails.trailers.length" class="mb-12">
            <h3 class="text-2xl font-semibold mb-6">Trailers</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="trailer in movieDetails.trailers.slice(0, 6)" :key="trailer.id" class="aspect-video rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300" @click="handleTrailerClick(trailer.url)">
                <div class="relative w-full h-full">
                  <img :src="`https://img.youtube.com/vi/${trailer.url.split('v=')[1]}/0.jpg`" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all">
                    <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="9.5,7.5 16.5,12 9.5,16.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Galería de Arte -->
          <div v-if="movieDetails.artworks && movieDetails.artworks.length > 0" class="mb-12">
            <h3 class="text-2xl font-semibold mb-6">Gallery</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="artwork in movieDetails.artworks.slice(0, 12)"
                  :key="artwork.id"
                class="aspect-video rounded-lg overflow-hidden bg-gray-800 cursor-pointer hover:scale-105 transition-transform duration-300"
                  @click="movieDetails.image = artwork.image || artwork.thumbnail"
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

/* Oculta el scrollbar vertical en móvil */
html, body, .min-h-screen {
  overflow-y: hidden !important;
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

/* Scrollbar horizontal personalizado para carruseles */
.flex.space-x-4.overflow-x-auto.pb-2::-webkit-scrollbar {
  height: 6px;
  background: transparent;
}
.flex.space-x-4.overflow-x-auto.pb-2::-webkit-scrollbar-thumb {
  background: #444456;
  border-radius: 8px;
}
.flex.space-x-4.overflow-x-auto.pb-2 {
  scrollbar-color: #444456 transparent;
  scrollbar-width: thin;
}
</style>