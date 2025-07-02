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
    // Solo si no estamos ya autenticados
    loginAndFetchContent();
  }
  userStore.loadFromLocalStorage();
});
</script>

<template>
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
</style>