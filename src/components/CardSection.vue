<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import type { Show } from "../stores/userStore";

const { title, items, type } = defineProps<{
  title: string;
  items: any[];
  type: "movie" | "series";
}>();

const router = useRouter(); 
const userStore = useUserStore();
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

// Funciones para manejar las listas del usuario
const addToFavorites = (item: any) => {
  const show: Show = {
    id: item.id,
    name: item.name,
    image: item.image,
    type: type,
    year: item.year
  };
  userStore.addToFavorites(show);
};

const addToWatchlist = (item: any) => {
  const show: Show = {
    id: item.id,
    name: item.name,
    image: item.image,
    type: type,
    year: item.year
  };
  userStore.addToWatchlist(show);
};

const addToWatched = (item: any) => {
  const show: Show = {
    id: item.id,
    name: item.name,
    image: item.image,
    type: type,
    year: item.year
  };
  userStore.addToWatched(show);
};

const isFavorite = (item: any) => {
  return userStore.isFavorite(item.id, type);
};

const isInWatchlist = (item: any) => {
  return userStore.isInWatchlist(item.id, type);
};

const isWatched = (item: any) => {
  return userStore.isWatched(item.id, type);
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
        class="flex-shrink-0 w-32 md:w-40 cursor-pointer group"
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
          
          <!-- Botones de interacción -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex space-x-2">
              <button
                @click.stop="addToFavorites(item)"
                :class="[
                  'p-2 rounded-full transition-colors',
                  isFavorite(item) 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white'
                ]"
                :title="isFavorite(item) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
              >
                ❤️
              </button>
              <button
                @click.stop="addToWatchlist(item)"
                :class="[
                  'p-2 rounded-full transition-colors',
                  isInWatchlist(item) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white'
                ]"
                :title="isInWatchlist(item) ? 'Quitar de watchlist' : 'Agregar a watchlist'"
              >
                📺
              </button>
              <button
                @click.stop="addToWatched(item)"
                :class="[
                  'p-2 rounded-full transition-colors',
                  isWatched(item) 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-green-600 hover:text-white'
                ]"
                :title="isWatched(item) ? 'Quitar de vistas' : 'Marcar como vista'"
              >
                ✅
              </button>
            </div>
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