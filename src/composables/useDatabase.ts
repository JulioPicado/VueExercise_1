import { ref, onMounted } from 'vue';
import { initDatabase, checkDatabaseExists } from '../utils/database';

export const useDatabase = () => {
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const initialize = async () => {
    if (isInitialized.value) return;

    try {
      isLoading.value = true;
      error.value = null;
      
      // Verificar si la base de datos ya existe
      const exists = await checkDatabaseExists();
      if (exists) {
        isInitialized.value = true;
        console.log('✅ Base de datos ya existe, listo para usar');
        isLoading.value = false;
        return;
      }
      
      // Solo inicializar si no existe
      const result = await initDatabase();
      
      if (result.success) {
        isInitialized.value = true;
        console.log('✅ Base de datos inicializada correctamente');
      } else {
        error.value = 'Error al inicializar la base de datos';
        console.error('❌ Error al inicializar la base de datos:', result.error);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error al inicializar la base de datos:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Inicializar automáticamente
  onMounted(initialize);

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
  };
}; 