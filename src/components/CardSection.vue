<script setup lang="ts">
import { ref, watch } from "vue";

// Define las props que este componente espera recibir
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  showRating: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <section class="mb-8">
    <div class="flex justify-between items-center mb-4 relative">
      <h2 class="text-xl font-bold text-white">{{ title }}</h2>
    </div>
    <div
      ref="scrollContainer"
      class="flex space-x-4 overflow-x-auto pb-4 scrollbar-hidden"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="flex-shrink-0 w-32 md:w-40"
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
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-white truncate">{{ item.name }}</p>
          <p class="text-xs text-gray-400">{{ item.year }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Oculta la barra de desplazamiento horizontal */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
