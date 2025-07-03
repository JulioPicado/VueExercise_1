import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuth } from '../composables/useAuth';

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isAuthenticated } = useAuth();

  // Rutas que requieren autenticación
  const protectedRoutes = ['/favorites', '/watchlist', '/watched', '/myshows'];
  
  // Verificar si la ruta actual requiere autenticación
  const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route));

  if (requiresAuth && !isAuthenticated.value) {
    // Redirigir al login si no está autenticado
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated.value) {
    // Redirigir al home si ya está autenticado y trata de acceder a login/register
    next('/');
  } else {
    next();
  }
}; 