<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const activeTab = ref('tv-series');
</script>

<template>
  <section>
    <div class="flex mb-6">
      <button
        @click="activeTab = 'tv-series'"
        :class="{ 'bg-purple-600 text-white': activeTab === 'tv-series', 'bg-gray-800 text-gray-400': activeTab !== 'tv-series' }"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200 mr-2"
      >
        TV series
      </button>
      <button
        @click="activeTab = 'movies'"
        :class="{ 'bg-purple-600 text-white': activeTab === 'movies', 'bg-gray-800 text-gray-400': activeTab !== 'movies' }"
        class="px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
      >
        Movies
      </button>
    </div>

    <div class="flex justify-between items-center mb-6">
      <span class="text-gray-400 text-sm">45K shows</span>
      <button class="flex items-center text-gray-400 text-sm">
        <span class="mr-1">Selection mode</span>
        <div class="w-4 h-4 rounded-full bg-gray-700"></div>
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-for="item in items" :key="item.id" class="w-full">
        <div class="w-full h-auto aspect-[3/4] rounded-lg overflow-hidden bg-gray-700 mb-2">
          <div class="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
            <div class="w-full h-full"></div>
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-white truncate">{{ item.title }}</p>
          <p class="text-xs text-gray-400">{{ item.year }}</p>
        </div>
      </div>
    </div>
  </section>
</template>