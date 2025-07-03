<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { useTVDB } from "../utils/useTVDB";
import { useUserStore } from "../stores/userStore";
import type { Show } from "../stores/userStore";

const route = useRoute();
const { fetchSeriesDetails, isAuthenticated, loginAndFetchContent } = useTVDB();
const userStore = useUserStore();

const seriesId = ref<string | string[]>(route.params.id);
const seriesDetails = ref<any | null>(null);
const loadingDetails = ref(true);
const errorDetails = ref<string | null>(null);

const loadSeriesDetails = async (id: string | string[]) => {
  loadingDetails.value = true;
  errorDetails.value = null;
  try {
    const details = await fetchSeriesDetails(id as string);
    seriesDetails.value = details;
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

// Funciones para los botones inferiores
const addToWatchlist = () => {
  if (!seriesDetails.value) return;
  const show: Show = {
    id: seriesDetails.value.id,
    name: seriesDetails.value.name,
    image: seriesDetails.value.image,
    type: 'series',
    year: seriesDetails.value.year
  };
  userStore.addToWatchlist(show);
};

const toggleWatched = () => {
  if (!seriesDetails.value) return;
  const show: Show = {
    id: seriesDetails.value.id,
    name: seriesDetails.value.name,
    image: seriesDetails.value.image,
    type: 'series',
    year: seriesDetails.value.year
  };
  if (userStore.isWatched(show.id, 'series')) {
    userStore.removeFromWatched(show.id, 'series');
  } else {
    userStore.addToWatched(show);
  }
};

const toggleFavorite = () => {
  if (!seriesDetails.value) return;
  const show: Show = {
    id: seriesDetails.value.id,
    name: seriesDetails.value.name,
    image: seriesDetails.value.image,
    type: 'series',
    year: seriesDetails.value.year
  };
  if (userStore.isFavorite(show.id, 'series')) {
    userStore.removeFromFavorites(show.id, 'series');
  } else {
    userStore.addToFavorites(show);
  }
};
</script>

<template>
  <!-- Solo móvil -->
  <div class="min-h-screen bg-gray-900 text-white max-w-xs mx-auto md:hidden flex flex-col pb-6">
    <!-- Imagen y header -->
    <div class="relative w-full h-80 overflow-hidden rounded-b-3xl">
      <img v-if="seriesDetails && seriesDetails.image" :src="seriesDetails.image" :alt="seriesDetails.name" class="w-full h-full object-cover object-center" />
      <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">No image</div>
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
    <!-- Info principal -->
    <div class="px-4 py-4 flex flex-col items-center text-center">
      <div class="flex items-center gap-2 mb-2">
        <span v-if="seriesDetails && seriesDetails.networks && seriesDetails.networks.length > 0" class="text-red-500 font-bold">{{ seriesDetails.networks[0].name }}</span>
        <span class="text-xs text-gray-400">TV-series</span>
      </div>
      <div class="flex items-center justify-center gap-2 mb-2">
        <span v-if="seriesDetails && seriesDetails.score" class="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">IMDb {{ seriesDetails.score }}</span>
        <span v-if="seriesDetails && seriesDetails.year" class="text-gray-300 text-xs">{{ seriesDetails.year }}</span>
        <span v-if="seriesDetails && seriesDetails.seasons" class="text-gray-300 text-xs">· {{ seriesDetails.seasons }} season{{ seriesDetails.seasons > 1 ? 's' : '' }}</span>
        <span v-if="seriesDetails && seriesDetails.status && seriesDetails.status.name" class="text-gray-300 text-xs">· {{ seriesDetails.status.name }}</span>
        <span v-if="seriesDetails && seriesDetails.averageRuntime" class="text-gray-300 text-xs">· {{ seriesDetails.averageRuntime }}m</span>
      </div>
      <h2 class="text-2xl font-bold mb-2 leading-tight">{{ seriesDetails?.name }}</h2>
      <!-- Géneros -->
      <div v-if="seriesDetails && seriesDetails.genres && seriesDetails.genres.length > 0" class="mb-3 flex flex-wrap gap-2 justify-center">
        <span v-for="genre in seriesDetails.genres" :key="genre.id" class="bg-gray-700 text-gray-200 text-xs px-3 py-1 rounded-full">{{ genre.name }}</span>
      </div>
      <!-- Descripción -->
      <p v-if="seriesDetails && seriesDetails.overview" class="text-gray-300 text-sm mb-3">{{ seriesDetails.overview }}</p>
      <!-- Creadores -->
      <div v-if="seriesDetails && seriesDetails.creators && seriesDetails.creators.length > 0" class="text-xs text-gray-400 mb-4">
        <span class="font-semibold text-gray-300">Creators:</span>
        <span class="font-semibold">{{ seriesDetails.creators.map((c: any) => c.name).join(', ') }}</span>
      </div>
      <!-- Botón principal -->
      <button class="w-full bg-blue-200 text-blue-900 font-bold py-3 rounded-2xl text-lg mb-4 shadow hover:bg-blue-300 transition-colors">Start watching</button>
      <!-- Botones inferiores -->
      <div class="flex justify-between w-full mt-2">
        <button class="flex flex-col items-center flex-1" @click="addToWatchlist">
          <span class="text-2xl">📋</span>
          <span class="text-xs mt-1">Add to watchlist</span>
        </button>
        <button class="flex flex-col items-center flex-1" @click="toggleWatched">
          <span class="text-2xl">✅</span>
          <span class="text-xs mt-1">Mark as watched</span>
        </button>
        <button class="flex flex-col items-center flex-1" @click="toggleFavorite">
          <span class="text-2xl">⭐</span>
          <span class="text-xs mt-1">Add to favorites</span>
        </button>
      </div>
    </div>
  </div>
  <!-- Vista escritorio original -->
  <div class="hidden md:block">
  <div class="min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
    <div v-if="loadingDetails" class="flex items-center justify-center h-screen text-purple-400 text-2xl">
      Cargando detalles de la serie...
    </div>

    <div v-else-if="errorDetails" class="flex items-center justify-center h-screen bg-red-900 p-4 rounded-lg text-red-200 text-center mx-auto max-w-md">
      <p class="font-bold">¡Error al cargar los detalles!</p>
      <p>Detalles: {{ errorDetails }}</p>
    </div>

    <div v-else-if="seriesDetails">
      <!-- Contenedor principal del contenido -->
      <div class="relative w-full h-auto max-h-[500px] md:h-[600px] overflow-hidden">
        <img
          v-if="seriesDetails.image"
          :src="seriesDetails.image"
          :alt="seriesDetails.name || 'Poster'"
          class="w-full h-full object-cover object-center"
        />
        <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">
          No hay imagen disponible
        </div>

        <!-- Capa de sombra para el texto en la imagen -->
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

        <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <router-link to="/" class="bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition-opacity">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </div>

        <!-- Título y detalles de la serie en la imagen -->
        <div class="absolute bottom-4 left-4 right-4 text-white p-4">
          <h2 class="text-3xl md:text-5xl font-bold mb-2 leading-tight">{{ seriesDetails.name }}</h2>
          <div class="text-lg md:text-xl text-gray-300 flex flex-wrap items-center gap-x-4">
            <span v-if="seriesDetails.score" class="flex items-center">
              <svg class="h-5 w-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
              </svg>
              {{ seriesDetails.score }}
            </span>
            <!-- Usamos firstAired para el año y averageRuntime para la duración del episodio -->
            <span v-if="seriesDetails.firstAired">· {{ getYearFromDate(seriesDetails.firstAired) }}</span>
            <span v-if="seriesDetails.averageRuntime">· {{ seriesDetails.averageRuntime }}m</span>
          </div>
        </div>
      </div>

      <!-- Lo que esta debajo de la imagen -->
      <div class="px-6 py-8 md:p-8">
        <!-- Géneros -->
        <div v-if="seriesDetails.genres && seriesDetails.genres.length > 0" class="mb-6 flex flex-wrap gap-2">
          <span v-for="genre in seriesDetails.genres" :key="genre.id" class="bg-purple-800 text-purple-100 text-sm px-3 py-1 rounded-full">
            {{ genre.name }}
          </span>
        </div>
        
        <!-- Cadena de transmisión (Network) -->
        <p v-if="seriesDetails.networks && seriesDetails.networks.length > 0" class="text-gray-400 text-sm mb-8">
          <span class="font-semibold">Cadena:</span>
          {{ seriesDetails.networks[0].name || "Desconocida" }}
        </p>

        <!-- Estado de la serie (Ongoing, Ended, etc.) -->
        <p v-if="seriesDetails.status && seriesDetails.status.name" class="text-gray-400 text-sm mb-8">
            <span class="font-semibold">Producida:</span>
            {{ seriesDetails.companies[0].name }}
        </p>
        
        <button
          class="w-full bg-purple-600 hover:bg-purple-900 text-white font-bold py-3 px-6 rounded-lg text-lg mb-6 transition-colors flex items-center justify-center shadow-lg"
        >
          Añadir a Favoritos
        </button>

        <!-- Botones de acción adicionales -->
        <div class="flex justify-around items-center space-x-4 mb-8">
          <button
            class="flex flex-col items-center text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            Añadir a ver luego
          </button>
          <button
            class="flex flex-col items-center text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            Marcar como visto
          </button>
        </div>

        <!-- Galería de Arte (Artworks adicionales) -->
        <div v-if="seriesDetails.artworks && seriesDetails.artworks.length > 0" class="mt-8">
          <h3 class="text-xl font-semibold mb-4">Galería de Arte:</h3>
          <div class="flex items-center overflow-x-auto h-[28vh] space-x-4 snap-x snap-mandatory scrollbar-hide px-1">
            <div
              v-for="artwork in seriesDetails.artworks"
              :key="artwork.id"
              class="snap-start shrink-0 w-40 sm:w-48 md:w-56 transition-transform transform hover:scale-105 hover:z-10 duration-300 ease-in-out rounded-lg overflow-hidden bg-gray-800 cursor-pointer"
              @click="seriesDetails.image = artwork.image || artwork.thumbnail"
            >
              <img
                v-if="artwork.thumbnail"
                :src="artwork.thumbnail"
                :alt="`Artwork ${artwork.id}`"
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