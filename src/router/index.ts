import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../view/Home.vue"; // <--- Importa HomeView como la vista principal
import MovieDetails from "../view/MovieDetails.vue"; // Asegúrate que la ruta sea correcta

const routes = [
  {
    path: "/", // La ruta raíz
    name: "Home",
    component: HomeView, // <--- Ahora apunta a HomeView
  },
  {
    path: "/details/:id",
    name: "MovieDetails",
    component: MovieDetails,
    props: true, // Esto permite pasar el parámetro de la ruta como prop al componente
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
