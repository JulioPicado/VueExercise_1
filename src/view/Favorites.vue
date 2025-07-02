<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8 text-center">Mis Favoritos</h1>
      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>

      <div v-else-if="favorites.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">❤️</div>
        <h2 class="text-2xl font-semibold mb-4">No tienes favoritos aún</h2>
        <p class="text-gray-400 mb-8">Explora películas y series para agregar a tus favoritos</p>
        <router-link 
          to="/" 
          class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Explorar Contenido
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div 
          v-for="show in favorites" 
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
                @click.stop="removeFromFavorites(show.id, show.type)"
                class="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                title="Quitar de favoritos"
              >
                ❤️
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
                  @click.stop="addToWatchlist(show)"
                  class="text-blue-400 hover:text-blue-300 text-sm"
                  title="Agregar a watchlist"
                >
                  📺
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

const favorites = computed(() => userStore.favorites);
const loading = computed(() => false); // Por ahora no hay loading específico

const navigateToDetails = (show: Show) => {
  if (show.type === 'movie') {
    router.push(`/movie/${show.id}`);
  } else {
    router.push(`/series/${show.id}`);
  }
};

const removeFromFavorites = (showId: number, type: string) => {
  userStore.removeFromFavorites(showId, type);
};

const addToWatchlist = (show: Show) => {
  userStore.addToWatchlist(show);
};

const addToWatched = (show: Show) => {
  userStore.addToWatched(show);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/public/netflixlogo.png';
};

onMounted(() => {
  // Cargar datos si es necesario
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