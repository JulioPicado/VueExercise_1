<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8 text-center">Mi Watchlist</h1>
      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="watchlist.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📺</div>
        <h2 class="text-2xl font-semibold mb-4">Tu watchlist está vacía</h2>
        <p class="text-gray-400 mb-8">Agrega películas y series que quieras ver más tarde</p>
        <router-link 
          to="/" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Explorar Contenido
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div 
          v-for="show in watchlist" 
          :key="`${show.type}-${show.id}`"
          class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          @click="navigateToDetails(show)"
        >
          <div class="relative">
            <img 
              :src="show.image || '/public/netflixlogo.png'" 
              :alt="show.name"
              class="w-full h-48 object-cover"
              @error="handleImageError"
            />
            <div class="absolute top-2 right-2">
              <button 
                @click.stop="removeFromWatchlist(show.id, show.type)"
                class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                title="Quitar de watchlist"
              >
                📺
              </button>
            </div>
            <div class="absolute bottom-2 left-2">
              <span class="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                {{ show.type === 'movie' ? 'Película' : 'Serie' }}
              </span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-2 line-clamp-2">{{ show.name }}</h3>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-400">{{ show.type === 'movie' ? 'Película' : 'Serie' }}</span>
              <div class="flex space-x-2">
                <button 
                  @click.stop="addToFavorites(show)"
                  class="text-red-400 hover:text-red-300 text-sm"
                  title="Agregar a favoritos"
                >
                  ❤️
                </button>
                <button 
                  @click.stop="addToWatched(show)"
                  class="text-green-400 hover:text-green-300 text-sm"
                  title="Marcar como vista"
                >
                  ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import type { Show } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const watchlist = computed(() => userStore.watchlist);
const loading = computed(() => false);

const navigateToDetails = (show: Show) => {
  if (show.type === 'movie') {
    router.push(`/movie/${show.id}`);
  } else {
    router.push(`/series/${show.id}`);
  }
};

const removeFromWatchlist = (showId: number, type: string) => {
  userStore.removeFromWatchlist(showId, type);
};

const addToFavorites = (show: Show) => {
  userStore.addToFavorites(show);
};

const addToWatched = (show: Show) => {
  userStore.addToWatched(show);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/public/netflixlogo.png';
};

onMounted(() => {
  userStore.loadFromLocalStorage();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 