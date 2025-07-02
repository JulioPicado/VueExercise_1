import { createRouter, createWebHistory } from "vue-router";
import Home from "../view/Home.vue";
import MovieDetails from "../view/MovieDetails.vue";
import SeriesDetails from "../view/SeriesDetails.vue";
import Favorites from "../view/Favorites.vue";
import Watchlist from "../view/Watchlist.vue";
import Watched from "../view/Watched.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
