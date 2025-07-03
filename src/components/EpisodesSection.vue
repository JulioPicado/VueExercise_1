<template>
  <div class="mt-8">
    <h3 class="text-2xl font-bold mb-6 text-white">Episodios</h3>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-400">Cargando episodios...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-8 text-red-400">
      <p>Error al cargar episodios: {{ error }}</p>
    </div>
    
    <div v-else-if="episodesBySeasons && Object.keys(episodesBySeasons).length > 0" class="space-y-6">
      <!-- Temporadas -->
      <div v-for="seasonNum in Object.keys(episodesBySeasons).sort((a, b) => parseInt(a) - parseInt(b))" :key="seasonNum" class="bg-gray-800 rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-gray-700 cursor-pointer" @click="toggleSeason(parseInt(seasonNum))">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold text-white">
              Temporada {{ seasonNum }} ({{ episodesBySeasons[parseInt(seasonNum)].length }} episodios)
            </h4>
            <svg 
              class="h-5 w-5 text-gray-400 transform transition-transform duration-200" 
              :class="{ 'rotate-180': expandedSeasons.includes(parseInt(seasonNum)) }"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <!-- Lista de episodios -->
        <div 
          v-if="expandedSeasons.includes(parseInt(seasonNum))" 
          class="divide-y divide-gray-700"
        >
          <div 
            v-for="episode in episodesBySeasons[parseInt(seasonNum)]" 
            :key="episode.id"
            class="p-4 hover:bg-gray-700 transition-colors duration-200"
          >
            <div class="flex items-start gap-4">
              <!-- Checkbox -->
              <div class="flex-shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  :id="`episode-${episode.id}`"
                  v-model="watchedEpisodes[episode.id]"
                  @change="handleEpisodeToggle(episode)"
                  class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              
              <!-- Imagen del episodio -->
              <div class="flex-shrink-0 w-20 h-12 md:w-24 md:h-16 bg-gray-700 rounded overflow-hidden">
                <img 
                  v-if="episode.image" 
                  :src="episode.image" 
                  :alt="episode.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                  No image
                </div>
              </div>
              
              <!-- Información del episodio -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-blue-400">E{{ episode.number }}</span>
                  <span v-if="episode.aired" class="text-xs text-gray-500">{{ formatDate(episode.aired) }}</span>
                  <span v-if="episode.runtime" class="text-xs text-gray-500">{{ episode.runtime }}m</span>
                </div>
                
                <h5 class="text-white font-medium mb-1 line-clamp-1">{{ episode.name }}</h5>
                
                <p v-if="episode.overview" class="text-gray-400 text-sm line-clamp-2">{{ episode.overview }}</p>
                <p v-else class="text-gray-500 text-sm italic">Sin descripción disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8 text-gray-400">
      <p>No hay episodios disponibles para esta serie</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';

interface Episode {
  id: number;
  seriesId: number;
  name: string;
  number: number;
  seasonNumber: number;
  aired: string | null;
  runtime: number;
  overview: string;
  image: string | null;
}

interface Props {
  episodesBySeasons: { [key: number]: Episode[] };
  loading: boolean;
  error: string | null;
}

const props = defineProps<Props>();

// Estado para controlar temporadas expandidas
const expandedSeasons = ref<number[]>([]);

// Estado para episodios marcados como vistos
const watchedEpisodes = reactive<{ [key: number]: boolean }>({});

// Función para expandir/contraer temporadas
const toggleSeason = (seasonNum: number) => {
  const index = expandedSeasons.value.indexOf(seasonNum);
  if (index === -1) {
    expandedSeasons.value.push(seasonNum);
  } else {
    expandedSeasons.value.splice(index, 1);
  }
};

// Función para manejar el toggle de episodios vistos
const handleEpisodeToggle = (episode: Episode) => {
  const isWatched = watchedEpisodes[episode.id];
  console.log(`Episodio ${episode.name} marcado como ${isWatched ? 'visto' : 'no visto'}`);
  // Aquí se implementaría la lógica para guardar en la base de datos
};

// Función para formatear fechas
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Expandir la primera temporada por defecto
watch(() => props.episodesBySeasons, (newEpisodes) => {
  if (newEpisodes && Object.keys(newEpisodes).length > 0 && expandedSeasons.value.length === 0) {
    const firstSeason = Math.min(...Object.keys(newEpisodes).map(Number));
    expandedSeasons.value.push(firstSeason);
  }
}, { immediate: true });

onMounted(() => {
  // Inicializar episodios expandidos si hay datos
  if (props.episodesBySeasons && Object.keys(props.episodesBySeasons).length > 0) {
    const firstSeason = Math.min(...Object.keys(props.episodesBySeasons).map(Number));
    expandedSeasons.value.push(firstSeason);
  }
});
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Estilos para el checkbox */
input[type="checkbox"] {
  appearance: none;
  background-color: #374151;
  border: 1px solid #4B5563;
  border-radius: 0.25rem;
  width: 1rem;
  height: 1rem;
  position: relative;
  cursor: pointer;
}

input[type="checkbox"]:checked {
  background-color: #2563EB;
  border-color: #2563EB;
}

input[type="checkbox"]:checked::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
}
</style> 