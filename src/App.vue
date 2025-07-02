<script setup lang="ts">
import HeaderMenu from "./components/HeaderMenu.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
    <header>
      <HeaderMenu />
    </header>

    <main class="flex-1">
      <!-- router-view es donde Vue Router inyecta el componente de la ruta actual (HomeView o MovieDetails) -->
      <router-view></router-view>
    </main>
  </div>
</template>
