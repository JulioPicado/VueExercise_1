import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./style.css"; // Tu archivo CSS, donde importas Tailwind CSS
import router from "./router/index"; // Importa la instancia del enrutador que crearemos

const app = createApp(App);
const pinia = createPinia();

app
  .use(pinia) // Usa Pinia para el manejo de estado
  .use(router) // Usa el plugin del enrutador
  .mount("#app");
