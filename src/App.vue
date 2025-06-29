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

    <footer class="bg-gray-800 p-4">
      <nav class="flex justify-between w-full items-center">
        <!-- Enlaces de navegación con router-link -->
        <router-link
          to="/"
          class="flex gap-2 justify-between items-center text-sm"
          active-class="text-purple-400"
          exact-active-class="text-purple-400"
        >
          <div
            :class="{
              'w-6 h-6 rounded-full mb-1': true,
              'bg-purple-400': $route.path === '/',
              'bg-gray-600': $route.path !== '/',
            }"
          ></div>
          Home
        </router-link>

        <router-link
          to="/"
          class="flex gap-2 justify-between items-center text-sm"
          active-class="text-purple-400"
          exact-active-class="text-purple-400"
        >
          <div
            :class="{
              'w-6 h-6 rounded-full mb-1': true,
              'bg-purple-400': $route.path === '/',
              'bg-gray-600': $route.path !== '/',
            }"
          ></div>
          Pendientes
        </router-link>

        <router-link
          to="/"
          class="flex gap-2 justify-between items-center text-sm"
          active-class="text-purple-400"
          exact-active-class="text-purple-400"
        >
          <div
            :class="{
              'w-6 h-6 rounded-full mb-1': true,
              'bg-purple-400': $route.path === '/',
              'bg-gray-600': $route.path !== '/',
            }"
          ></div>
          Favoritas
        </router-link>

        <router-link
          to="/"
          class="flex gap-2 justify-center  items-center text-sm"
          active-class="text-purple-400"
          exact-active-class="text-purple-400"
        >
          <div
            :class="{
              'w-6 h-6 rounded-full mb-1': true,
              'bg-purple-400': $route.path === '/',
              'bg-gray-600': $route.path !== '/',
            }"
          ></div>
          Vistas
        </router-link>
      </nav>
    </footer>
  </div>
</template>
