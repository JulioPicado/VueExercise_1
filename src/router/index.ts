import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import Home from "../view/Home.vue";
import MovieDetails from "../view/MovieDetails.vue";
import SeriesDetails from "../view/SeriesDetails.vue";
import Favorites from "../view/Favorites.vue";
import Watchlist from "../view/Watchlist.vue";
import Watched from "../view/Watched.vue";
import Login from "../view/Login.vue";
import Register from "../view/Register.vue";
import { authGuard } from "../middleware/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/movie/:id",
    name: "MovieDetails",
    component: MovieDetails,
    props: true,
  },
  {
    path: "/series/:id",
    name: "SeriesDetails",
    component: SeriesDetails,
    props: true,
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: Favorites,
  },
  {
    path: "/watchlist",
    name: "Watchlist",
    component: Watchlist,
  },
  {
    path: "/watched",
    name: "Watched",
    component: Watched,
  },
  {
    path: '/myshows/watchlist/:type?',
    name: 'MyShowsWatchlist',
    component: () => import('../view/MyShowsList.vue'),
    props: (route: RouteLocationNormalized) => ({ listType: 'watchlist', type: route.params.type })
  },
  {
    path: '/myshows/watched/:type?',
    name: 'MyShowsWatched',
    component: () => import('../view/MyShowsList.vue'),
    props: (route: RouteLocationNormalized) => ({ listType: 'watched', type: route.params.type })
  },
  {
    path: '/myshows/favorites/:type?',
    name: 'MyShowsFavorites',
    component: () => import('../view/MyShowsList.vue'),
    props: (route: RouteLocationNormalized) => ({ listType: 'favorites', type: route.params.type })
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Agregar el middleware de autenticación
router.beforeEach(authGuard);

export default router;
