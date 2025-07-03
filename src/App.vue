<script setup lang="ts">
import HeaderMenu from "./components/HeaderMenu.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#353542] text-white font-sans">
    <header v-if="!(['MovieDetails','MyShowsWatchlist','MyShowsWatched','MyShowsFavorites'].includes(($route.name || '') as string))">
      <HeaderMenu />
    </header>

    <main class="flex-1">
      <!-- router-view es donde Vue Router inyecta el componente de la ruta actual (HomeView o MovieDetails) -->
      <router-view></router-view>
    </main>

    <!-- Footer de navegación solo en móvil -->
    <nav class="fixed bottom-0 left-0 right-0 bg-[#353542] border-t border-gray-700 flex justify-around items-center py-2 md:hidden z-50">
      <router-link to="/" class="flex flex-col items-center text-xs flex-1" :class="$route.path === '/' ? 'text-white' : 'text-gray-300'">
        <span class="text-xl">
          <!-- Brújula (explore) -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l-4 8-4-4 8-4z"/></svg>
        </span>
        <span>Explore</span>
      </router-link>
      <router-link to="/watchlist" class="flex flex-col items-center text-xs flex-1" :class="$route.path.startsWith('/watchlist') ? 'text-white bg-[#444456] rounded-xl px-3 py-1' : 'text-gray-300'">
        <span class="text-xl">
          <!-- Pantalla/play (my shows) -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><rect x="3" y="5" width="18" height="12" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9l5 3-5 3V9z"/></svg>
        </span>
        <span>My shows</span>
      </router-link>
      <router-link to="/calendar" class="flex flex-col items-center text-xs flex-1" :class="$route.path.startsWith('/calendar') ? 'text-white bg-[#444456] rounded-xl px-3 py-1' : 'text-gray-300'">
        <span class="text-xl">
          <!-- Calendario -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><rect x="3" y="7" width="18" height="14" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3v4M8 3v4M3 11h18"/></svg>
        </span>
        <span>Calendar</span>
      </router-link>
      <router-link to="/notifications" class="flex flex-col items-center text-xs flex-1" :class="$route.path.startsWith('/notifications') ? 'text-white bg-[#444456] rounded-xl px-3 py-1' : 'text-gray-300'">
        <span class="text-xl">
          <!-- Campana (notificaciones) -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </span>
        <span>Notifications</span>
      </router-link>
    </nav>
  </div>
</template>
