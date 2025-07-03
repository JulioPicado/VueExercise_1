<template>
  <div class="register-form">
    <div class="form-container">
      <h2>Crear Cuenta</h2>
      
      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label for="name">Nombre completo</label>
          <input
            id="name"
            v-model="credentials.name"
            type="text"
            placeholder="Tu nombre completo"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            placeholder="tu@email.com"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
          <small class="form-hint">Mínimo 6 caracteres</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="credentials.confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="isLoading" class="btn-primary">
          <span v-if="isLoading">Creando cuenta...</span>
          <span v-else>Crear Cuenta</span>
        </button>
      </form>
      
      <div class="form-footer">
        <p>¿Ya tienes una cuenta? 
          <router-link to="/login" class="link">Inicia sesión aquí</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { register, isLoading, error, clearError } = useAuth();

const credentials = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const handleRegister = async () => {
  clearError();
  
  const success = await register(credentials.value);
  
  if (success) {
    router.push('/');
  }
};
</script>

<style scoped>
.register-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-container h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #e50914;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  opacity: 0.7;
  cursor: not-allowed;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c66;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #e50914, #f40612);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #cc0812, #e50914);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-footer p {
  color: #666;
  font-size: 14px;
}

.link {
  color: #e50914;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style> 