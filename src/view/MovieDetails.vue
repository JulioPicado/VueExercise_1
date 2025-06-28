<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";

const route = useRoute();
const movieId = ref(route.params.id);

// Aquí iría la lógica para cargar los detalles de la película usando movieId
// Por ahora, solo mostraremos el ID.

onMounted(() => {
  console.log("Cargando detalles para la película con ID:", movieId.value);
  // Aquí puedes llamar a tu useTVDB hook o a una función específica
  // para obtener los detalles extendidos de la película.
});
</script>

<template>
  <div class="p-8 text-white">
    <h1 class="text-3xl font-bold mb-4">Detalles de la Película</h1>
    <p class="text-lg">
      ID de la película:
      <span class="font-semibold text-purple-400">{{ movieId }}</span>
    </p>
    <p class="mt-4">
      Aquí se mostrarán los detalles completos de la película o serie.
    </p>
    <router-link
      to="/"
      class="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Volver a Home
    </router-link>
  </div>
</template>
