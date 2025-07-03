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
  <!-- Solo móvil -->
  <div class="min-h-screen bg-[#23243a] text-white max-w-xs mx-auto md:hidden flex flex-col pb-6">
    <!-- Imagen y header -->
    <div class="relative w-full h-80 overflow-hidden rounded-b-3xl">
      <img v-if="movieDetails && movieDetails.image" :src="movieDetails.image" :alt="movieDetails.name" class="w-full h-full object-cover object-center" />
      <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">No image</div>
      <!-- Gradiente oscuro -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
      <!-- Flecha y menú -->
      <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button @click="$router.back()" class="bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition-opacity">
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition-opacity">
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="12" r="2" />
          </svg>
        </button>
      </div>
    </div>
    <!-- Tarjeta principal -->
    <div class="-mt-8 px-4 w-full">
      <div class="bg-[#292945] rounded-2xl shadow-lg px-4 py-6 flex flex-col items-center text-center border border-[#35355a]">
        <div class="flex items-center gap-2 mb-2">
          <span v-if="movieDetails && movieDetails.studios && movieDetails.studios.length > 0" class="text-red-400 font-bold">{{ movieDetails.studios[0].name }}</span>
          <span class="text-xs text-gray-400">Movie</span>
        </div>
        <div class="flex items-center justify-center gap-2 mb-2">
          <span v-if="movieDetails && movieDetails.score" class="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">IMDb {{ movieDetails.score }}</span>
          <span v-if="movieDetails && movieDetails.year" class="text-gray-300 text-xs">{{ movieDetails.year }}</span>
          <span v-if="movieDetails && movieDetails.runtime" class="text-gray-300 text-xs">· {{ movieDetails.runtime }}m</span>
        </div>
        <h2 class="text-2xl font-bold mb-2 leading-tight">{{ movieDetails?.name }}</h2>
        <!-- Géneros -->
        <div v-if="movieDetails && movieDetails.genres && movieDetails.genres.length > 0" class="mb-3 flex flex-wrap gap-2 justify-center">
          <span v-for="genre in movieDetails.genres" :key="genre.id" class="bg-gray-700 text-gray-200 text-xs px-3 py-1 rounded-full">{{ genre.name }}</span>
        </div>
        <!-- Descripción -->
        <p v-if="movieDetails && movieDetails.overview" class="text-gray-300 text-sm mb-3">{{ movieDetails.overview }}</p>
        <!-- Información extra -->
        <div v-if="movieDetails" class="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div><span class="font-semibold">Studio:</span> {{ movieDetails.studios?.[0]?.name || movieDetails.companies?.studio?.[0]?.name }}</div>
          <div><span class="font-semibold">Country:</span> {{ movieDetails.production_countries?.[0]?.name || movieDetails.originalCountry }}</div>
          <div><span class="font-semibold">Language:</span> {{ movieDetails.originalLanguage?.toUpperCase() }}</div>
          <div v-if="movieDetails.budget"><span class="font-semibold">Budget:</span> ${{ Number(movieDetails.budget).toLocaleString() }}</div>
          <div v-if="movieDetails.boxOffice"><span class="font-semibold">Box Office:</span> ${{ Number(movieDetails.boxOffice).toLocaleString() }}</div>
        </div>
      </div>
      <!-- Cast -->
      <div v-if="movieDetails && movieDetails.characters && movieDetails.characters.length" class="mb-6 mt-6 bg-[#23233a] rounded-xl px-3 py-4 shadow border border-[#35355a]">
        <h3 class="text-base font-semibold mb-3 text-left">Cast</h3>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <div v-for="actor in (movieDetails.characters.filter((c: any) => c.peopleType === 'Actor' && c.personImgURL))" :key="actor.id" class="flex flex-col items-center w-24">
            <img :src="actor.personImgURL" class="w-16 h-16 rounded-full object-cover mb-1 border-2 border-gray-700 shadow" />
            <span class="text-xs text-center truncate w-20">{{ actor.personName }}</span>
          </div>
        </div>
      </div>
      <!-- Trailers -->
      <div v-if="movieDetails && movieDetails.trailers && movieDetails.trailers.length" class="mb-6 bg-[#23233a] rounded-xl px-3 py-4 shadow border border-[#35355a]">
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
      <div v-if="movieDetails && movieDetails.artworks && movieDetails.artworks.length" class="mb-6 bg-[#23233a] rounded-xl px-3 py-4 shadow border border-[#35355a]">
        <h3 class="text-base font-semibold mb-3 text-left">Images</h3>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <img v-for="art in movieDetails.artworks" :key="art.id" :src="art.thumbnail || art.image" class="w-32 h-20 rounded-lg object-cover shadow" />
        </div>
      </div>
      <!-- Botón principal -->
      <button class="w-full bg-blue-400 text-blue-900 font-bold py-3 rounded-2xl text-lg mb-6 shadow hover:bg-blue-500 transition-colors">Start watching</button>
      <!-- Botones inferiores -->
      <div class="flex justify-between w-full mt-2 gap-2 pb-2">
        <button
          class="flex flex-col items-center flex-1 group py-2"
          @click="toggleWatchlist"
          :aria-pressed="isInWatchlist"
          :title="isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'"
        >
          <span class="mb-1 transition-colors flex items-center justify-center w-12 h-12 rounded-full border-2" :class="isInWatchlist ? 'border-[#a259e6]' : 'border-gray-600'">
            <!-- Ojo con + -->
            <svg :class="isInWatchlist ? 'stroke-[#a259e6]' : 'stroke-gray-400 group-hover:stroke-[#a259e6]'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" class="w-7 h-7">
              <ellipse cx="12" cy="12" rx="8" ry="5" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M17 7l2-2" stroke-width="2" stroke-linecap="round" />
              <path d="M19 7v2" stroke-width="2" stroke-linecap="round" />
              <path d="M19 7h-2" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <span class="text-xs mt-1">{{ isInWatchlist ? 'In watchlist' : 'Add to watchlist' }}</span>
        </button>
        <button
          class="flex flex-col items-center flex-1 group py-2"
          @click="toggleWatched"
          :aria-pressed="isWatched"
          :title="isWatched ? 'Unmark as watched' : 'Mark as watched'"
        >
          <span class="mb-1 transition-colors flex items-center justify-center w-12 h-12 rounded-full border-2" :class="isWatched ? 'border-[#4ade80]' : 'border-gray-600'">
            <!-- Ojo abierto -->
            <svg :class="isWatched ? 'stroke-[#4ade80]' : 'stroke-gray-400 group-hover:stroke-[#4ade80]'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" class="w-7 h-7">
              <ellipse cx="12" cy="12" rx="8" ry="5" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </span>
          <span class="text-xs mt-1">{{ isWatched ? 'Watched' : 'Mark as watched' }}</span>
        </button>
        <button
          class="flex flex-col items-center flex-1 group py-2"
          @click="toggleFavorite"
          :aria-pressed="isFavorite"
          :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        >
          <span class="mb-1 transition-colors flex items-center justify-center w-12 h-12 rounded-full border-2" :class="isFavorite ? 'border-[#fde047]' : 'border-gray-600'">
            <!-- Estrella outline -->
            <svg :class="isFavorite ? 'stroke-[#fde047]' : 'stroke-gray-400 group-hover:stroke-[#fde047]'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" class="w-7 h-7">
              <polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 4.73 5.82 21 12 17.27" />
            </svg>
          </span>
          <span class="text-xs mt-1">{{ isFavorite ? 'Favorited' : 'Add to favorites' }}</span>
        </button>
      </div>
    </div>
  </div>
  <!-- Vista escritorio original -->
  <div class="hidden md:block">
    <div class="min-h-screen bg-gray-900 text-white">
      <div class="container mx-auto px-4 py-8">
        <div v-if="loadingDetails" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <div v-else-if="!loadingDetails && errorDetails" class="bg-red-900 text-red-200 p-8 rounded-lg text-center">
          <h2 class="text-2xl font-bold mb-2">¡Error al cargar los detalles!</h2>
          <p class="mb-2">No se pudo cargar la información de la película seleccionada. Es posible que la API de TheTVDB no tenga detalles para este resultado.</p>
          <p class="text-xs text-red-300">{{ errorDetails }}</p>
          <router-link to="/" class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Volver al inicio</router-link>
        </div>
        <div v-else-if="movieDetails">
          <div
            class="relative w-full h-auto max-h-[500px] md:h-[600px] overflow-hidden"
          >
            <img
              v-if="movieDetails.image"
              :src="movieDetails.image"
              :alt="movieDetails.name || 'Poster'"
              class="w-full h-full object-cover object-center"
            />
            <div
              v-else
              class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl"
            >
              No hay imagen disponible
            </div>

            <!-- Capa de sombra para el texto en la imagen -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"
            ></div>

            <!-- Botones de navegación superior -->
            <div
              class="absolute top-4 left-4 right-4 flex justify-between items-center z-10"
            >
              <router-link
                to="/"
                class="bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition-opacity"
              >
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </router-link>
            </div>

            <!-- Título y año de la película en la imagen -->
            <div class="absolute bottom-4 left-4 right-4 text-white p-4">
              <h2 class="text-3xl md:text-5xl font-bold mb-2 leading-tight">
                {{ movieDetails.name }}
              </h2>
              <div
                class="text-lg md:text-xl text-gray-300 flex flex-wrap items-center gap-x-4"
              >
                <span v-if="movieDetails.score" class="flex items-center">
                  <svg
                    class="h-5 w-5 text-yellow-400 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
                    ></path>
                  </svg>
                  {{ movieDetails.score }}
                </span>
                <span v-if="movieDetails.year">· {{ movieDetails.year }}</span>
                <span v-if="movieDetails.runtime"
                  >· {{ movieDetails.runtime }}m</span
                >
              </div>
            </div>
          </div>

          <!-- Lo que esta debajo de la imagen -->
          <div class="px-6 py-8 md:p-8">
            <!-- Géneros -->
            <div
              v-if="movieDetails.genres && movieDetails.genres.length > 0"
              class="mb-6 flex flex-wrap gap-2"
            >
              <span
                v-for="genre in movieDetails.genres"
                :key="genre.id"
                class="bg-purple-800 text-purple-100 text-sm px-3 py-1 rounded-full"
              >
                {{ genre.name }}
              </span>
            </div>

            <p class="text-gray-400 text-sm mb-8">
              <span class="font-semibold">Estudio:</span>
              {{ movieDetails.studios[0].name || "Desconocido" }}
            </p>

            <!-- Botones de acción principales -->
            <div class="flex flex-col space-y-4 mb-8">
              <button
                @click="toggleFavorite"
                :class="[
                  'w-full font-bold py-3 px-6 rounded-lg text-lg transition-colors flex items-center justify-center shadow-lg',
                  isFavorite 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                ]"
              >
                <span class="mr-2">❤️</span>
                {{ isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos' }}
              </button>

              <div class="grid grid-cols-2 gap-4">
                <button
                  @click="toggleWatchlist"
                  :class="[
                    'font-bold py-3 px-4 rounded-lg transition-colors flex flex-col items-center',
                    isInWatchlist 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  ]"
                >
                  <span class="text-xl mb-1">📺</span>
                  <span class="text-sm">{{ isInWatchlist ? 'Quitar de Watchlist' : 'Ver más tarde' }}</span>
                </button>

                <button
                  @click="toggleWatched"
                  :class="[
                    'font-bold py-3 px-4 rounded-lg transition-colors flex flex-col items-center',
                    isWatched 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  ]"
                >
                  <span class="text-xl mb-1">✅</span>
                  <span class="text-sm">{{ isWatched ? 'Quitar de Vistas' : 'Marcar como vista' }}</span>
                </button>
              </div>
            </div>

            <div
              v-if="movieDetails.artworks && movieDetails.artworks.length > 0"
              class="mt-8"
            >
              <h3 class="text-xl font-semibold mb-4">Galería de Arte:</h3>

              <div
                class="flex items-center overflow-x-auto h-[28vh] space-x-4 snap-x snap-mandatory scrollbar-hide px-1"
              >
                <div
                  v-for="artwork in movieDetails.artworks"
                  :key="artwork.id"
                  class="snap-start shrink-0 w-40 sm:w-48 md:w-56 transition-transform transform hover:scale-105 hover:z-10 duration-300 ease-in-out rounded-lg overflow-hidden bg-gray-800 cursor-pointer"
                  @click="movieDetails.image = artwork.image || artwork.thumbnail"
                >
                  <img
                    v-if="artwork.thumbnail"
                    :src="artwork.thumbnail"
                    class="w-full h-32 sm:h-40 md:h-48 object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-32 sm:h-40 md:h-48 bg-gray-700 flex items-center justify-center text-gray-500 text-xs"
                  >
                    No thumbnail
                  </div>
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