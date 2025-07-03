<template>
  <div class="show-actions">
    <!-- Indicadores de estado -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Botones de acción -->
    <div class="action-buttons">
      <!-- Botón de favoritos -->
      <button
        @click="handleToggleFavorite"
        :disabled="isLoading"
        :class="['action-btn', 'favorite-btn', { active: isFavorite(show.id, show.type) }]"
        title="Agregar a favoritos"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span v-if="!isLoading">{{ isFavorite(show.id, show.type) ? 'Favorito' : 'Favoritos' }}</span>
        <span v-else>...</span>
      </button>

      <!-- Botón de watchlist -->
      <button
        @click="handleToggleWatchlist"
        :disabled="isLoading"
        :class="['action-btn', 'watchlist-btn', { active: isInWatchlist(show.id, show.type) }]"
        title="Agregar a la lista de pendientes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14l-5-5 1.41-1.41L14 14.17l7.59-7.59L23 8l-9 9z"/>
        </svg>
        <span v-if="!isLoading">{{ isInWatchlist(show.id, show.type) ? 'En lista' : 'Lista' }}</span>
        <span v-else>...</span>
      </button>

      <!-- Botón de watched (solo para películas por ahora) -->
      <button
        v-if="show.type === 'movie'"
        @click="handleToggleWatched"
        :disabled="isLoading"
        :class="['action-btn', 'watched-btn', { active: isWatched(show.id, show.type) }]"
        title="Marcar como vista"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        <span v-if="!isLoading">{{ isWatched(show.id, show.type) ? 'Vista' : 'Marcar' }}</span>
        <span v-else>...</span>
      </button>
    </div>

    <!-- Contadores -->
    <div class="counters">
      <span class="counter">❤️ {{ favoritesCount }}</span>
      <span class="counter">📋 {{ watchlistCount }}</span>
      <span class="counter">👁️ {{ watchedCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserLists } from '../composables/useUserLists';
import { useAuth } from '../composables/useAuth';
import type { Show } from '../stores/userStore';

interface Props {
  show: Show;
}

const props = defineProps<Props>();
const { isAuthenticated } = useAuth();
const {
  isLoading,
  error,
  favoritesCount,
  watchlistCount,
  watchedCount,
  toggleFavorite,
  toggleWatchlist,
  toggleWatched,
  isFavorite,
  isInWatchlist,
  isWatched,
} = useUserLists();

const handleToggleFavorite = async () => {
  if (!isAuthenticated.value) {
    alert('Debes estar logueado para agregar favoritos');
    return;
  }
  await toggleFavorite(props.show);
};

const handleToggleWatchlist = async () => {
  if (!isAuthenticated.value) {
    alert('Debes estar logueado para usar la watchlist');
    return;
  }
  await toggleWatchlist(props.show);
};

const handleToggleWatched = async () => {
  if (!isAuthenticated.value) {
    alert('Debes estar logueado para marcar como visto');
    return;
  }
  // Podrías abrir un modal para pedir rating y notas
  await toggleWatched(props.show);
};
</script>

<style scoped>
.show-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #1a1a1a;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c66;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn:hover:not(:disabled) {
  border-color: #666;
  background: #333;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.active {
  border-color: #e50914;
  color: #e50914;
  background: rgba(229, 9, 20, 0.1);
}

.favorite-btn.active {
  border-color: #ff6b6b;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.watchlist-btn.active {
  border-color: #4ecdc4;
  color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
}

.watched-btn.active {
  border-color: #ffe66d;
  color: #ffe66d;
  background: rgba(255, 230, 109, 0.1);
}

.counters {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #aaa;
}

.counter {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style> 