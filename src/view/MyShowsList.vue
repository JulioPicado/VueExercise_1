<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import type { Show } from '../stores/userStore';

const props = defineProps<{ listType: 'watchlist' | 'watched' | 'favorites', type?: string }>();
const router = useRouter();
const userStore = useUserStore();

const listMap = {
  watchlist: userStore.watchlist,
  watched: userStore.watched,
  favorites: userStore.favorites,
};

const filteredList = computed(() => {
  return listMap[props.listType].filter(show => {
    if (activeTab.value === 'movies') return show.type === 'movie';
    if (activeTab.value === 'tv-series') return show.type === 'series';
    return true;
  });
});

const listTitle = computed(() => {
  if (props.listType === 'watchlist') return 'Watchlist';
  if (props.listType === 'watched') return 'Watched';
  if (props.listType === 'favorites') return 'Favorites';
  return '';
});

// Detectar tamaño de pantalla
const isMobile = ref(window.innerWidth <= 768);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Estado para las pestañas
const activeTab = ref(props.type || 'tv-series');
</script>

<template>
  <!-- Móvil -->
  <div v-if="isMobile" class="min-h-screen bg-[#353542] text-white max-w-xs mx-auto flex flex-col pb-20">
    <div class="flex items-center gap-2 px-4 py-4 border-b border-gray-800 bg-[#353542] sticky top-0 z-10">
      <button @click="router.push('/watchlist')" class="bg-gray-800 rounded-full p-2 hover:bg-gray-700">
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="text-lg font-bold">{{ listTitle }} <span v-if="props.type">({{ props.type === 'movies' ? 'Movies' : 'TV series' }})</span></h2>
    </div>
    <div v-if="filteredList.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">
      <span>No items in this list.</span>
    </div>
    <div v-else class="grid grid-cols-3 gap-3 p-4 items-start">
      <div v-for="show in filteredList" :key="`${show.type}-${show.id}`" class="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer flex flex-col flex-none max-w-[120px]" @click="router.push(show.type === 'movie' ? `/movie/${show.id}` : `/series/${show.id}`)">
        <div class="relative w-full h-36 bg-gray-700">
          <img :src="show.image" :alt="show.name" class="w-full h-full object-cover" />
        </div>
        <div class="px-1 py-1">
          <p class="text-xs font-medium text-white truncate">{{ show.name }}</p>
          <p class="text-[10px] text-gray-400">{{ show.year }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Escritorio -->
  <div v-else class="min-h-screen bg-[#353542] text-white max-w-6xl mx-auto flex flex-col pb-20 p-8">
    <div class="flex items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold">My </h1>
      <span class="text-lg text-gray-400">({{ activeTab === 'movies' ? 'Movies' : 'TV Series' }})</span>
    </div>
    <!-- Botones de pestaña -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'tv-series'"
        :class="{'bg-purple-600 text-white': activeTab === 'tv-series', 'bg-gray-800 text-gray-400': activeTab !== 'tv-series'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        TV series
      </button>
      <button
        @click="activeTab = 'movies'"
        :class="{'bg-purple-600 text-white': activeTab === 'movies', 'bg-gray-800 text-gray-400': activeTab !== 'movies'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        Movies
      </button>
    </div>
    <div v-if="filteredList.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">
      <span>No items in this list.</span>
    </div>
    <div v-else class="grid grid-cols-6 gap-6 items-start">
      <div v-for="show in filteredList" :key="`${show.type}-${show.id}`" class="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer flex flex-col flex-none max-w-[180px]" @click="router.push(show.type === 'movie' ? `/movie/${show.id}` : `/series/${show.id}`)">
        <div class="relative w-full h-56 bg-gray-700">
          <img :src="show.image" :alt="show.name" class="w-full h-full object-cover" />
          <span v-if="show.type === 'movie'" class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Movie</span>
          <span v-else class="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">Series</span>
        </div>
        <div class="px-3 py-2 flex-1 flex flex-col justify-between">
          <p class="text-base font-semibold text-white truncate">{{ show.name }}</p>
          <p class="text-xs text-gray-400">{{ show.year }}</p>
        </div>
        <div class="flex gap-2 px-3 pb-3">
          <span v-if="userStore.isFavorite(show.id, show.type)" class="text-yellow-400" title="Favorite">★</span>
          <span v-if="userStore.isInWatchlist(show.id, show.type)" class="text-purple-400" title="Watchlist">●</span>
          <span v-if="userStore.isWatched(show.id, show.type)" class="text-green-400" title="Watched">✔</span>
        </div>
      </div>
    </div>
  </div>
</template> 