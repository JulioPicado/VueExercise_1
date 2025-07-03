<template>
  <!-- Solo móvil -->
  <div class="min-h-screen bg-[#353542] text-white max-w-xs mx-auto md:hidden flex flex-col pb-20">
    <!-- Tabs -->
    <div class="flex items-center border-b border-gray-700 mb-2">
      <button :class="['flex-1 py-2 text-center font-semibold', activeTab === 'tv-series' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400']" @click="activeTab = 'tv-series'">TV series</button>
      <button :class="['flex-1 py-2 text-center font-semibold', activeTab === 'movies' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400']" @click="activeTab = 'movies'">Movies</button>
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
  userStore.loadFromLocalStorage();
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
</style> 