<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const { title, items, type } = defineProps<{
  title: string;
  items: any[];
  type: "movie" | "series";
}>();

const router = useRouter(); 
const scrollContainer = ref<HTMLElement | null>(null);

// Funciones para controlar el desplazamiento
const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -320, behavior: "smooth" });
  }
};

const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 320, behavior: "smooth" });
  }
};

// Función para navegar, ahora con lógica condicional
const goToDetails = (id: number, contentType: "movie" | "series") => {
  const routeName = contentType === "movie" ? "MovieDetails" : "SeriesDetails";
  router.push({ name: routeName, params: { id: id } }); 
};
</script>

<template>
  <section class="mb-8">
    <div class="flex justify-between items-center mb-4 relative">
      <button
        @click="scrollLeft"
        class="text-gray-400 p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <svg
          class="h-6 w-6"
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
      </button>

      <h2 class="text-xl font-bold text-white">{{ title }}</h2>

      <button
        @click="scrollRight"
        class="text-gray-400 p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
    <div
      ref="scrollContainer"
      class="flex space-x-4 overflow-x-auto pb-4 scrollbar-hidden"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="flex-shrink-0 w-32 md:w-40 cursor-pointer"
        @click="goToDetails(item.id, type)"
      >
        <div
          class="relative w-32 h-48 md:w-40 md:h-60 rounded-lg overflow-hidden bg-gray-700 mb-2"
        >
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name || 'Image'"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400"
          >
            No image
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-white truncate">
            {{ item.name }}
          </p>
          <p class="text-xs text-gray-400">{{ item.year }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Oculta scroll en todos los navegadores modernos */
.scrollbar-hidden::-webkit-scrollbar {
  display: none; /* Safari y Chrome */
}
.scrollbar-hidden {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}
</style>