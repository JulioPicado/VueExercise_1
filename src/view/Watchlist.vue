<template>
  <!-- Móvil -->
  <div class="min-h-screen bg-[#353542] text-white max-w-xs mx-auto md:hidden flex flex-col pb-20">
    <!-- Tabs -->
    <div class="flex items-center border-b border-gray-700 mb-2 px-4 py-2">
      <button 
        :class="[
          'flex-1 py-3 px-4 text-center font-semibold transition-all duration-200 rounded-lg mx-1', 
          activeTab === 'tv-series' 
            ? 'text-white bg-blue-500/20 border-b-2 border-blue-500' 
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        ]" 
        @click.stop="setActiveTab('tv-series')"
      >
        TV series
      </button>
      <button 
        :class="[
          'flex-1 py-3 px-4 text-center font-semibold transition-all duration-200 rounded-lg mx-1', 
          activeTab === 'movies' 
            ? 'text-white bg-blue-500/20 border-b-2 border-blue-500' 
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        ]" 
        @click.stop="setActiveTab('movies')"
      >
        Movies
      </button>
    </div>
    <!-- Carrusel de listas con pósters reales -->
    <div class="flex items-center overflow-x-auto gap-4 pb-2 mb-4 custom-scrollbar-horizontal">
      <div v-for="(list, idx) in [
        { key: 'watchlist' as const, label: 'Watchlist', color: 'bg-purple-700', icon: '🟣', items: userStore.watchlist.filter(show => show.type === (activeTab === 'tv-series' ? 'series' : 'movie')) },
        { key: 'watched' as const, label: 'Watched', color: 'bg-green-700', icon: '🟢', items: userStore.watched.filter(show => show.type === (activeTab === 'tv-series' ? 'series' : 'movie')) },
        { key: 'favorites' as const, label: 'Favorites', color: 'bg-yellow-500', icon: '⭐', items: userStore.favorites.filter(show => show.type === (activeTab === 'tv-series' ? 'series' : 'movie')) }
      ]" :key="list.key" class="flex flex-col items-center min-w-[70px]">
        <div
          class="relative w-24 h-24 rounded-xl overflow-hidden mb-1 border-2 border-gray-700 bg-gray-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          @click="goToList(list.key)"
        >
          <!-- Collage de 4 imágenes si hay varias, una sola si solo hay una -->
          <template v-if="list.items.length > 1">
            <div class="absolute inset-0 grid grid-cols-2 grid-rows-2 w-full h-full">
              <img v-for="(item, i) in list.items.slice(0,4)" :key="i" :src="item.image" :alt="item.name" class="object-cover w-full h-full" :style="{ gridArea: `${Math.floor(i/2)+1} / ${(i%2)+1}` }" />
            </div>
          </template>
          <template v-else>
            <img v-if="list.items[0] && list.items[0].image" :src="list.items[0].image" :alt="list.label" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl text-white/60">?</div>
          </template>
          <span class="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-gray-700">{{ list.items.length }}</span>
        </div>
        <span class="text-xs text-gray-300 flex items-center gap-1">
          <span v-if="list.key === 'watchlist'" class="text-purple-400"><svg xmlns='http://www.w3.org/2000/svg' class='inline w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 17V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2z' /></svg></span>
          <span v-if="list.key === 'watched'" class="text-green-400"><svg xmlns='http://www.w3.org/2000/svg' class='inline w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7' /></svg></span>
          <span v-if="list.key === 'favorites'" class="text-yellow-400"><svg xmlns='http://www.w3.org/2000/svg' class='inline w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' /></svg></span>
          {{ list.label }} <span class="ml-1">{{ list.items.length }}</span>
        </span>
      </div>
    </div>
    <!-- Sección Watching -->
    <div class="mb-4">
      <h3 class="text-sm font-semibold mb-2">Watching</h3>
      <div class="flex flex-wrap gap-4 justify-center">
        <div v-for="show in watchingShows" :key="show.id" class="flex flex-col items-center bg-gray-800 rounded-2xl shadow-md overflow-hidden w-28 h-48">
          <img :src="show.image" :alt="show.name" class="w-full h-32 object-cover rounded-t-2xl" />
          <div class="px-2 py-2 w-full flex flex-col items-center">
            <span class="text-xs font-bold text-white text-center truncate w-full">{{ show.name }}</span>
            <span class="text-[10px] text-gray-400">{{ show.year }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Grid de pósters -->
    <div class="grid grid-cols-3 gap-3 flex-1">
      <div v-for="show in filteredShows" :key="`${show.type}-${show.id}`" class="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer flex flex-col" @click="navigateToDetails(show)">
        <div class="relative w-full aspect-[2/3] bg-gray-700">
          <img :src="show.image" :alt="show.name" class="w-full h-full object-cover" />
          <!-- Badge de favorito o visto -->
          <span v-if="show.isFavorite" class="absolute top-1 right-1 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full">★</span>
        </div>
        <div class="px-1 py-1">
          <p class="text-xs font-medium text-white truncate">{{ show.name }}</p>
          <p class="text-[10px] text-gray-400">{{ show.year }}</p>
        </div>
      </div>
    </div>

    <!-- Footer navegación -->
    <nav class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center py-2 md:hidden z-50">
      <router-link to="/" class="flex flex-col items-center text-xs text-gray-300 flex-1">
        <span class="text-xl">🏠</span>
        <span>Explore</span>
      </router-link>
      <router-link to="/watchlist" class="flex flex-col items-center text-xs flex-1" :class="$route.path === '/watchlist' ? 'text-blue-400' : 'text-gray-300'">
        <span class="text-xl">📺</span>
        <span>My shows</span>
      </router-link>
      <button class="flex flex-col items-center text-xs text-gray-300 flex-1" disabled>
        <span class="text-xl">🗓️</span>
        <span>Calendar</span>
      </button>
      <button class="flex flex-col items-center text-xs text-gray-300 flex-1" disabled>
        <span class="text-xl">🔔</span>
        <span>Notifications</span>
      </button>
    </nav>
  </div>

  <!-- Escritorio -->
  <div class="min-h-screen bg-[#353542] text-white max-w-6xl mx-auto hidden md:flex flex-col pb-20 p-8">
    <div class="flex items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold">My Shows</h1>
      <span class="text-lg text-gray-400">({{ activeTab === 'movies' ? 'Movies' : 'TV Series' }})</span>
    </div>
    <!-- Botones de pestaña -->
    <div class="flex gap-2 mb-6">
      <button
        @click="setActiveTab('tv-series')"
        :class="{'bg-blue-500 text-white': activeTab === 'tv-series', 'bg-gray-800 text-gray-400': activeTab !== 'tv-series'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        TV series
      </button>
      <button
        @click="setActiveTab('movies')"
        :class="{'bg-blue-500 text-white': activeTab === 'movies', 'bg-gray-800 text-gray-400': activeTab !== 'movies'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        Movies
      </button>
    </div>
    <!-- Botones de lista -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeList = 'watchlist'"
        :class="{'bg-purple-500 text-white': activeList === 'watchlist', 'bg-gray-800 text-gray-400': activeList !== 'watchlist'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        Watchlist
      </button>
      <button
        @click="activeList = 'watched'"
        :class="{'bg-green-500 text-white': activeList === 'watched', 'bg-gray-800 text-gray-400': activeList !== 'watched'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        Watched
      </button>
      <button
        @click="activeList = 'favorites'"
        :class="{'bg-yellow-500 text-white': activeList === 'favorites', 'bg-gray-800 text-gray-400': activeList !== 'favorites'}"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        Favorites
      </button>
    </div>
    <div v-if="filteredShows.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">
      <span>No items in this list.</span>
    </div>
    <div v-else class="grid grid-cols-4 gap-6 items-start">
      <div v-for="show in filteredShows" :key="`${show.type}-${show.id}`" class="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer flex flex-col flex-none max-w-full" @click="navigateToDetails(show)">
        <div class="relative w-full h-56 bg-gray-700">
          <img :src="show.image" :alt="show.name" class="w-full h-full object-cover" />
          <span v-if="show.isFavorite" class="absolute top-1 right-1 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full">★</span>
        </div>
        <div class="px-3 py-2 flex-1 flex flex-col justify-between">
          <p class="text-base font-semibold text-white truncate">{{ show.name }}</p>
          <p class="text-xs text-gray-400">{{ show.year }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import type { Show } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const searchQuery = ref('');
const activeTab = ref<'tv-series' | 'movies'>('tv-series');
const activeList = ref<'watchlist' | 'watched' | 'favorites'>('watchlist');

const allLists = {
  watchlist: computed(() => userStore.watchlist),
  watched: computed(() => userStore.watched),
  favorites: computed(() => userStore.favorites),
};

// Los contadores deben mostrar SIEMPRE el total de cada lista, sin filtrar por tab
const watchlistCount = computed(() => userStore.watchlist.length);
const watchedCount = computed(() => userStore.watched.length);
const favoritesCount = computed(() => userStore.favorites.length);

const filteredShows = computed(() => {
  return allLists[activeList.value].value.filter(show => {
    const matchesType = activeTab.value === 'tv-series' ? show.type === 'series' : show.type === 'movie';
    const matchesQuery = show.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesType && matchesQuery;
  });
});

const watchingShows = computed(() => userStore.watchlist.filter(show => !userStore.isWatched(show.id, show.type)));

const setActiveTab = (tab: 'tv-series' | 'movies') => {
  activeTab.value = tab;
  console.log('🔄 Tab cambiado a:', tab);
};

const goToList = (list: 'watchlist' | 'watched' | 'favorites') => {
  const type = activeTab.value === 'movies' ? 'movies' : 'tv-series';
  router.push(`/myshows/${list}/${type}`);
};

const navigateToDetails = (show: Show) => {
  if (show.type === 'movie') {
    router.push(`/movie/${show.id}`);
  } else {
    router.push(`/series/${show.id}`);
  }
};

onMounted(() => {
  // Cargar datos del usuario al montar el componente
  console.log('📺 Watchlist montado, datos del usuario:', {
    watchlist: userStore.watchlist.length,
    favorites: userStore.favorites.length,
    watched: userStore.watched.length
  });
});
</script>

<style scoped>
.aspect-2\/3 {
  aspect-ratio: 2/3;
}
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
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

/* Ajustes para tamaño fijo */
.watching-show {
  width: 120px;
  margin: 0 auto;
}
.watching-show img {
  width: 120px;
  height: 180px;
  border-radius: 8px;
}
</style> 