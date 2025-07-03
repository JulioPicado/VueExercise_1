<script setup lang="ts">
import { computed } from 'vue';
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
    if (!props.type) return true;
    return props.type === 'movies' ? show.type === 'movie' : show.type === 'series';
  });
});

const listTitle = computed(() => {
  if (props.listType === 'watchlist') return 'Watchlist';
  if (props.listType === 'watched') return 'Watched';
  if (props.listType === 'favorites') return 'Favorites';
  return '';
});
</script>

<template>
  <div class="min-h-screen bg-[#353542] text-white max-w-xs mx-auto md:max-w-lg flex flex-col pb-20">
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
    <div v-else class="grid grid-cols-3 gap-3 p-4">
      <div v-for="show in filteredList" :key="`${show.type}-${show.id}`" class="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer flex flex-col" @click="router.push(show.type === 'movie' ? `/movie/${show.id}` : `/series/${show.id}`)">
        <div class="relative w-full aspect-[2/3] bg-gray-700">
          <img :src="show.image" :alt="show.name" class="w-full h-full object-cover" />
        </div>
        <div class="px-1 py-1">
          <p class="text-xs font-medium text-white truncate">{{ show.name }}</p>
          <p class="text-[10px] text-gray-400">{{ show.year }}</p>
        </div>
      </div>
    </div>
  </div>
</template> 