<template>
  <div
    class="p-4 flex items-center justify-between bg-gray-900 border-b border-gray-800"
  >
    <div class="flex w-[80%] mx-4 items-center justify-between bg-gray-800 rounded-full">
      <button
        class="mr-5 ml-5 p-2"
      >
        <svg
          class="h-8 w-8 inline-block hover:text-gray-400 transition-colors duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      <input
        type="text"
        placeholder="Search shows..."
        class="w-full p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <img
      src="/avatar.png"
      alt="Logo"
      class="w-12 h-12 rounded-full hover:scale-125 transition-transform duration-200"
    />
  </div>
</template>

<script setup lang="ts">
// No se necesita lógica en el script para este componente simple.
</script>
