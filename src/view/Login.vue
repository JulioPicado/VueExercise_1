<template>
  <div class="login-page">
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import LoginForm from '../components/LoginForm.vue';

const router = useRouter();
const { isAuthenticated } = useAuth();

// Redirigir si ya está autenticado
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/');
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c, #1a1a1a);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 