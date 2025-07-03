<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTVDB } from "../utils/useTVDB";
import CardSection from "../components/CardSection.vue";

const { movieList, seriesList, loading, error, loginAndFetchContent } = useTVDB();
const router = useRouter();

function goToDetails(item, type) {
  if (type === 'movie') {
    router.push(`/movie/${item.id}`);
  } else {
    router.push(`/series/${item.id}`);
  }
}

onMounted(() => {
  loginAndFetchContent();
});
</script>

<template>
  <!-- Vista móvil patacion -->
  <div class="min-h-screen bg-[#353542] text-white p-4 max-w-xs mx-auto md:hidden">
    <!-- Elimino el header de búsqueda local, solo queda el global -->
    <!-- Sección de películas recomendadas -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-base font-semibold">Recommended movies</span>
        <span class="text-gray-400 text-xl">→</span>
      </div>
      <div class="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar-horizontal">
        <div v-for="movie in (movieList as any[])" :key="movie.id" class="flex-shrink-0 w-28 cursor-pointer" @click="goToDetails(movie, 'movie')">
          <div class="relative w-28 h-40 rounded-lg overflow-hidden bg-gray-700">
            <img v-if="movie.image" :src="movie.image" :alt="movie.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">No image</div>
            <span v-if="movie.score" class="absolute top-1 right-1 bg-gray-900 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded-full">{{ movie.score }}</span>
          </div>
          <p class="mt-1 text-xs text-white truncate">{{ movie.name }}</p>
        </div>
      </div>
    </div>
    <!-- Sección de series populares -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-base font-semibold">Popular TV series</span>
        <span class="text-gray-400 text-xl">→</span>
      </div>
      <div class="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar-horizontal">
        <div v-for="serie in (seriesList as any[])" :key="serie.id" class="flex-shrink-0 w-28 cursor-pointer" @click="goToDetails(serie, 'series')">
          <div class="relative w-28 h-40 rounded-lg overflow-hidden bg-gray-700">
            <img v-if="serie.image" :src="serie.image" :alt="serie.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">No image</div>
            <span v-if="serie.score" class="absolute top-1 right-1 bg-gray-900 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded-full">{{ serie.score }}</span>
          </div>
          <p class="mt-1 text-xs text-white truncate">{{ serie.name }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Vista escritorio (original) -->
  <div class="hidden md:block p-2 md:p-8">
    <div v-if="loading" class="text-center p-8 text-purple-400 text-2xl">
      Cargando contenido...
    </div>
    <div v-else-if="error" class="text-center p-8 bg-red-900 text-red-200 rounded-lg">
      {{ error }}
    </div>
    <div v-else>
      <CardSection
        title="Películas recomendadas"
        :items="movieList"
        show-rating
        type="movie"
      />
      <CardSection
        title="Series destacadas"
        :items="seriesList"
        show-rating
        type="series"
      />
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar-horizontal::-webkit-scrollbar {
  height: 8px;
  background: transparent;
}
.custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
  background: rgba(120,120,120,0.35);
  border-radius: 8px;
}
.custom-scrollbar-horizontal {
  scrollbar-color: rgba(120,120,120,0.35) transparent;
  scrollbar-width: thin;
}
</style>