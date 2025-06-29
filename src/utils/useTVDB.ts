// src/utils/useTVDB.ts
import { ref } from "vue";

export function useTVDB() {
  const apiKey = import.meta.env.VITE_THE_TVDB_API_KEY;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const movieList = ref([]);
  const seriesList = ref([]);
  const loading = ref(true); // Indica si las listas principales están cargando
  const error = ref<string | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false); // Nuevo estado para indicar si ya se autenticó

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const base = "https://artworks.thetvdb.com/";
    const finalPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return base + finalPath;
  };

  const fetchMovies = async () => {
    if (!token.value) throw new Error("Token no disponible para fetchMovies.");
    const res = await fetch(`${apiBaseUrl}/movies?page=1`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Películas: ${err.message}`);
    }

    const json = await res.json();
    const raw = json.data.slice(0, 10);

    return raw.map((movie: any) => ({
      ...movie,
      image: movie.image ? getFullImageUrl(movie.image) : null,
      type: "movie", // <-- ¡Añade el tipo a los datos!
    }));
  };

  const fetchSeries = async () => {
    if (!token.value) throw new Error("Token no disponible para fetchSeries."); // Protección extra
    const res = await fetch(`${apiBaseUrl}/series?page=1`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Series: ${err.message}`);
    }

    const json = await res.json();
    const raw = json.data.slice(0, 10);

    return raw.map((serie: any) => ({
      ...serie,
      image: serie.image ? getFullImageUrl(serie.image) : null,
      type: "series", // <-- ¡Añade el tipo a los datos!
    }));
  };

  const fetchMovieDetails = async (movieId: number | string) => {
    if (!token.value) {
      console.warn("fetchMovieDetails llamado sin token. Esperando token...");
      return null;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/movies/${movieId}/extended`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          `Detalles de película: ${err.message} (Status: ${res.status})`
        );
      }

      const json = await res.json();
      const movieDetail = json.data;

      if (movieDetail.image) {
        movieDetail.image = getFullImageUrl(movieDetail.image);
      }

      if (movieDetail.artworks && movieDetail.artworks.length > 0) {
        movieDetail.artworks = movieDetail.artworks.map((artwork: any) => ({
          ...artwork,
          image: getFullImageUrl(artwork.image),
          thumbnail: getFullImageUrl(artwork.thumbnail),
        }));
      }

      return movieDetail;
    } catch (err) {
      console.error("Error al obtener detalles de la película:", err);
      throw err;
    }
  };

  const loginAndFetchContent = async () => {
    try {
      const loginRes = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: apiKey }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(`Login: ${err.message}`);
      }

      const loginData = await loginRes.json();
      token.value = loginData.data.token;
      isAuthenticated.value = true; // Login exitoso, se establece en true

      // Estas llamadas se ejecutarán después de que el token esté disponible
      [movieList.value, seriesList.value] = await Promise.all([
        fetchMovies(),
        fetchSeries(),
      ]);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Error desconocido";
      isAuthenticated.value = false; // Error en el login, se establece en false
    } finally {
      loading.value = false;
    }
  };

 // Agrega esta función en tu archivo useTVDB.ts
const fetchSeriesDetails = async (seriesId: number | string) => {
  if (!token.value) {
    console.warn("fetchSeriesDetails llamado sin token. Esperando token...");
    return null;
  }

  try {
    const res = await fetch(
      `${apiBaseUrl}/series/${seriesId}/extended?meta=translations&short=true`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        `Detalles de serie: ${err.message} (Status: ${res.status})`
      );
    }

    const json = await res.json();
    const serieDetail = json.data;

    if (serieDetail.image) {
      serieDetail.image = getFullImageUrl(serieDetail.image);
    }

    if (serieDetail.artworks && serieDetail.artworks.length > 0) {
      serieDetail.artworks = serieDetail.artworks.map((artwork: any) => ({
        ...artwork,
        image: getFullImageUrl(artwork.image),
        thumbnail: getFullImageUrl(artwork.thumbnail),
      }));
    }

    return serieDetail;
  } catch (err) {
    console.error("Error al obtener detalles de la serie:", err);
    throw err;
  }
};

// No olvides retornarlo al final de useTVDB
return {
  movieList,
  seriesList,
  loading,
  error,
  token,
  isAuthenticated,
  loginAndFetchContent,
  fetchMovieDetails,
  fetchSeriesDetails,
};

}
