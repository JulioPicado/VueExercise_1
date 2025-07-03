# 🗄️ Sistema de Watchlist con Base de Datos

## 🚀 **Migración Completada: localStorage → Turso DB**

### ✅ **Antes vs Ahora**

| **Antes (localStorage)** | **Ahora (Turso DB)** |
|---|---|
| 📱 Solo local, se pierde al cambiar device | 🌐 Sincronizado en la nube |
| 👤 No requiere login | 🔐 Requiere autenticación |
| 💾 Limitado por storage del navegador | 🗄️ Base de datos ilimitada |
| 🔄 Sin sincronización | ⚡ Sync en tiempo real |

---

## 🏗️ **Arquitectura del Sistema**

### **1. Almacenamiento en Turso**
```sql
-- Favoritos (películas y series)
user_favorites (id, user_id, movie_id, series_id, created_at)

-- Lista de pendientes
user_watchlist (id, user_id, movie_id, series_id, added_at)

-- Películas vistas
user_watched_movies (id, user_id, movie_id, watched_at, rating, notes)

-- Episodios vistos (para series)
user_watched_episodes (id, user_id, series_id, episode_id, season_number, episode_number, watched_at, rating, notes)
```

### **2. Composables Vue**
- **`useUserLists.ts`**: Composable principal para manejar listas
- **`useAuth.ts`**: Sistema de autenticación
- **`useDatabase.ts`**: Inicialización de BD

### **3. Store Actualizado**
- **`userStore.ts`**: Store de Pinia integrado con Turso
- **Caché local** para performance + **sincronización** con BD

---

## 💻 **Cómo Usar el Nuevo Sistema**

### **1. Composable Principal**
```typescript
// En cualquier componente
import { useUserLists } from '@/composables/useUserLists';

const {
  // Estados
  favorites, watchlist, watched,
  isLoading, error,
  
  // Funciones toggle (agregar/quitar automáticamente)
  toggleFavorite,
  toggleWatchlist, 
  toggleWatched,
  
  // Funciones de verificación
  isFavorite,
  isInWatchlist,
  isWatched,
  
  // Contadores
  favoritesCount,
  watchlistCount,
  watchedCount
} = useUserLists();
```

### **2. Ejemplo de Uso en Componente**
```vue
<template>
  <div class="movie-card">
    <img :src="movie.poster" :alt="movie.name" />
    
    <!-- Botones de acción -->
    <div class="actions">
      <button 
        @click="toggleFavorite(movie)" 
        :disabled="isLoading"
        :class="{ active: isFavorite(movie.id, 'movie') }"
      >
        ❤️ {{ isFavorite(movie.id, 'movie') ? 'Favorito' : 'Favoritos' }}
      </button>
      
      <button 
        @click="toggleWatchlist(movie)"
        :disabled="isLoading" 
        :class="{ active: isInWatchlist(movie.id, 'movie') }"
      >
        📋 {{ isInWatchlist(movie.id, 'movie') ? 'En lista' : 'Lista' }}
      </button>
      
      <button 
        @click="toggleWatched(movie, 8, 'Me gustó!')" 
        :disabled="isLoading"
        :class="{ active: isWatched(movie.id, 'movie') }"
      >
        👁️ {{ isWatched(movie.id, 'movie') ? 'Vista' : 'Marcar' }}
      </button>
    </div>
    
    <!-- Indicadores de estado -->
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="isLoading" class="loading">Guardando...</div>
  </div>
</template>

<script setup>
import { useUserLists } from '@/composables/useUserLists';

const props = defineProps(['movie']);
const { toggleFavorite, toggleWatchlist, toggleWatched, isFavorite, isInWatchlist, isWatched, isLoading, error } = useUserLists();
</script>
```

### **3. Funciones Disponibles**

#### **Favoritos**
```typescript
// Agregar/quitar favorito automáticamente
await toggleFavorite(show);

// Agregar específicamente
await addToFavorites(show);

// Quitar específicamente  
await removeFromFavorites(showId, 'movie');

// Verificar estado
const isFav = isFavorite(showId, 'movie');
```

#### **Watchlist**
```typescript
// Toggle automático
await toggleWatchlist(show);

// Verificar estado
const inList = isInWatchlist(showId, 'series');
```

#### **Watched (Vistas)**
```typescript
// Marcar como vista con rating y notas
await toggleWatched(show, 9, 'Excelente película!');

// Solo marcar como vista
await toggleWatched(show);

// Verificar estado
const watched = isWatched(showId, 'movie');
```

---

## 🔐 **Autenticación Requerida**

### **Flujo de Autenticación**
1. **Usuario no logueado**: Los botones muestran alerta para hacer login
2. **Usuario logueado**: Las acciones se guardan en Turso automáticamente
3. **Logout**: Los datos locales se limpian, pero persisten en la BD

### **Verificación en Componentes**
```typescript
import { useAuth } from '@/composables/useAuth';

const { isAuthenticated } = useAuth();

const handleAction = async () => {
  if (!isAuthenticated.value) {
    alert('Debes estar logueado');
    return;
  }
  
  await toggleFavorite(show);
};
```

---

## 📊 **Estados y Performance**

### **Caché Local + BD**
- **Caché local**: Arrays reactivos para UI instantánea
- **Base de datos**: Persistencia permanente en Turso
- **Sincronización**: Automática al hacer login/logout

### **Estados de Carga**
```typescript
// Verificar si hay operaciones en curso
const { isLoading, error } = useUserLists();

// En el template
<button :disabled="isLoading">
  {{ isLoading ? 'Guardando...' : 'Agregar a favoritos' }}
</button>
```

### **Manejo de Errores**
```typescript
// Los errores se muestran automáticamente
if (error.value) {
  console.log('Error:', error.value);
}
```

---

## 🎯 **Migración desde localStorage**

### **Compatibilidad**
- ✅ **Funciones síncronas** mantenidas para compatibilidad
- ✅ **Nombres de funciones** iguales (isFavorite, isInWatchlist, etc.)
- ✅ **APIs existentes** siguen funcionando

### **Lo que Cambió**
```typescript
// ANTES: Solo localStorage
userStore.addToFavorites(show); // Síncrono

// AHORA: localStorage + Base de datos  
await userStore.addToFavorites(show); // Asíncrono
```

---

## 🚀 **Funcionalidades Nuevas**

### **1. Verificación desde BD**
```typescript
// Verificar estado actual desde la BD (no caché)
const state = await checkCurrentState(movieId, 'movie');
console.log(state); 
// { isFavorite: true, isInWatchlist: false, isWatched: true }
```

### **2. Ratings y Notas**
```typescript
// Para películas vistas
await addToWatched(movie, 8, 'Muy buena actuación!');
```

### **3. Sincronización Automática**
- Al hacer **login**: Carga datos del usuario
- Al hacer **logout**: Limpia caché local
- **Cambios**: Se guardan inmediatamente en BD

---

## 🧪 **Testing del Sistema**

### **1. Probar con Usuario Demo**
```typescript
// Login: demo@example.com / demo123
// 1. Agregar película a favoritos
// 2. Verificar que se guarda en BD
// 3. Logout y login nuevamente
// 4. Verificar que persiste
```

### **2. Componente de Ejemplo**
```vue
<!-- Usar el componente ShowActions.vue -->
<ShowActions :show="movieData" />
```

---

## 🔧 **Configuración Técnica**

### **Variables de Entorno**
```env
VITE_TURSO_DATABASE_URL=libsql://tu-database-url.turso.io
VITE_TURSO_AUTH_TOKEN=tu-auth-token
```

### **Inicialización**
```typescript
// Automática en App.vue
const { isInitialized } = useDatabase();
```

---

## 🎉 **Sistema Completo**

### ✅ **Implementado**
- 🗄️ **Base de datos Turso** completamente integrada
- 🔐 **Autenticación** requerida para listas
- ⚡ **Performance** con caché local + BD
- 🔄 **Sincronización** automática
- 🎯 **API simplificada** con composables
- 📱 **Componente de ejemplo** listo para usar

### 🚀 **Próximos Pasos**
1. **Usar `useUserLists()`** en tus componentes
2. **Reemplazar llamadas directas** al userStore
3. **Agregar componente `ShowActions`** donde necesites
4. **Testear con usuario demo**

¡El sistema de watchlist ahora usa Turso y está listo para producción! 🎊 