// src/composables/useTVDB.ts
import { ref } from "vue";

export function useTVDB() {
  const apiKey = import.meta.env.VITE_THE_TVDB_API_KEY;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const movieList = ref([]);
  const seriesList = ref([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const token = ref<string | null>(null);

  /*
   * This function constructs the full URL for an image based on its path.
   */
  const getFullImageUrl = (imagePath: string) => {
    const base = "https://artworks.thetvdb.com/";
    const finalPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return base + finalPath;
  };

  /**
   * This function fetches the list of movies from the TVDB API.
   * It uses the token for authorization and returns a list of movies with their images.
   */

  const fetchMovies = async () => {
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
    }));
  };

  const fetchSeries = async () => {
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
    }));
  };

  /**
   * This function handles the login process and fetches both movies and series.
   * It first logs in using the provided API key, retrieves a token,
   */

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

      [movieList.value, seriesList.value] = await Promise.all([
        fetchMovies(),
        fetchSeries(),
      ]);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Error desconocido";
    } finally {
      loading.value = false;
    }
  };

  return {
    movieList,
    seriesList,
    loading,
    error,
    loginAndFetchContent,
  };
}
