import { createRouter, createWebHistory } from "vue-router";
import Home from "../view/Home.vue";
import MovieDetails from "../view/MovieDetails.vue";
import SeriesDetails from "../view/SeriesDetails.vue";
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
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
