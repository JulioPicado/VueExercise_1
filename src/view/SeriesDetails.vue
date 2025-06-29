<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { useTVDB } from "../utils/useTVDB";

const route = useRoute();
const { fetchSeriesDetails, isAuthenticated, loginAndFetchContent } = useTVDB();

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
</script>

<template>
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