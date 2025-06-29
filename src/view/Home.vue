<script setup lang="ts">
import { onMounted } from "vue";
import { useTVDB } from "../utils/useTVDB";
import CardSection from "../components/CardSection.vue";

const { movieList, seriesList, loading, error, loginAndFetchContent } =
  useTVDB();

onMounted(() => {
  loginAndFetchContent();
});
</script>

<template>
  <div class="p-2 md:p-8">
    <div v-if="loading" class="text-center p-8 text-purple-400 text-2xl">
      Cargando contenido...
    </div>

    <div
      v-else-if="error"
      class="text-center p-8 bg-red-900 text-red-200 rounded-lg"
    >
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