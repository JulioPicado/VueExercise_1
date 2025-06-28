import { createApp } from "vue";
import App from "./App.vue";
import "./style.css"; // Tu archivo CSS, donde importas Tailwind CSS
import router from "./router/index"; // Importa la instancia del enrutador que crearemos

createApp(App)
  .use(router) // Usa el plugin del enrutador
  .mount("#app");
