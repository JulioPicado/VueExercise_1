// src/utils/useTVDB.ts
import { ref } from "vue";
//import { initDatabase } from "./database";

export function useTVDB() {
  const apiKey = import.meta.env.VITE_THE_TVDB_API_KEY;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Log para depuración
  console.log('API BASE URL:', apiBaseUrl);
  console.log('API KEY:', apiKey);

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
      // Intentar primero con extended, como las series
      const res = await fetch(`${apiBaseUrl}/movies/${movieId}/extended?meta=translations&short=true`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      });

      if (!res.ok) {
        // Si falla, intentar sin los parámetros adicionales
        console.warn(`Primera llamada de película falló (${res.status}), intentando endpoint básico...`);
        
        const basicRes = await fetch(`${apiBaseUrl}/movies/${movieId}/extended`, {
          headers: {
            Authorization: `Bearer ${token.value}`,
            accept: "application/json",
          },
        });

        if (!basicRes.ok) {
          const err = await basicRes.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(
            `Detalles de película: ${err.message} (Status: ${basicRes.status})`
          );
        }

        const basicJson = await basicRes.json();
        const movieDetail = basicJson.data;

        // Procesar imágenes
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

        console.log('✅ Detalles de película cargados con endpoint básico');
        return movieDetail;
      }

      const json = await res.json();
      const movieDetail = json.data;

      // Procesar imágenes
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

      console.log('✅ Detalles de película cargados con endpoint extendido');
      return movieDetail;
    } catch (err) {
      console.error("Error al obtener detalles de la película:", err);
      throw err;
    }
  };

  const loginAndFetchContent = async () => {
    try {
      // 🗄️ Inicializar base de datos automáticamente
      //console.log('🔧 PRUEBA: loginAndFetchContent se está ejecutando');
      //console.log('🔧 Inicializando base de datos...');
      //await initDatabase();
      
      // Validar que apiBaseUrl y apiKey existen
      if (!apiBaseUrl || !apiKey) {
        throw new Error('API base URL o API key no definida.');
      }
      const loginRes = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: apiKey }),
      });

      if (!loginRes.ok) {
        // Intenta leer el error como JSON, pero si falla, muestra el texto plano
        let errMsg = '';
        try {
          const err = await loginRes.json();
          errMsg = err.message;
        } catch (e) {
          errMsg = await loginRes.text();
        }
        throw new Error(`Login: ${errMsg}`);
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

  const fetchSeriesEpisodes = async (seriesId: number | string) => {
    if (!token.value) {
      console.warn("fetchSeriesEpisodes llamado sin token. Esperando token...");
      return null;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/series/${seriesId}/episodes/default?page=0`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          `Episodios de serie: ${err.message} (Status: ${res.status})`
        );
      }

      const json = await res.json();
      const episodesData = json.data;

      // Procesar episodios y agrupar por temporada
      const episodesBySeasons: { [key: number]: any[] } = {};
      
      if (episodesData.episodes) {
        episodesData.episodes.forEach((episode: any) => {
          // Solo incluir episodios con seasonNumber > 0 (excluir especiales)
          if (episode.seasonNumber > 0) {
            if (!episodesBySeasons[episode.seasonNumber]) {
              episodesBySeasons[episode.seasonNumber] = [];
            }
            
            episodesBySeasons[episode.seasonNumber].push({
              ...episode,
              image: episode.image ? getFullImageUrl(episode.image) : null,
            });
          }
        });
      }

      // Ordenar episodios dentro de cada temporada por número de episodio
      Object.keys(episodesBySeasons).forEach(seasonNum => {
        episodesBySeasons[parseInt(seasonNum)].sort((a, b) => a.number - b.number);
      });

      return {
        series: episodesData.series,
        episodesBySeasons,
        totalSeasons: Object.keys(episodesBySeasons).length
      };
    } catch (err) {
      console.error("Error al obtener episodios de la serie:", err);
      throw err;
    }
  };

  const searchShows = async (query: string) => {
    if (!token.value) {
      console.warn("searchShows llamado sin token. Esperando token...");
      return { movies: [], series: [] };
    }

    if (!query.trim()) {
      return { movies: [], series: [] };
    }

    try {
      // Buscar películas
      const moviesRes = await fetch(`${apiBaseUrl}/search?query=${encodeURIComponent(query)}&type=movie`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      });

      // Buscar series
      const seriesRes = await fetch(`${apiBaseUrl}/search?query=${encodeURIComponent(query)}&type=series`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      });

      let movies = [];
      let series = [];

      if (moviesRes.ok) {
        const moviesData = await moviesRes.json();
        movies = moviesData.data
          .slice(0, 10)
          .map((movie: any) => ({
            ...movie,
            image: movie.image ? getFullImageUrl(movie.image) : null,
            type: "movie",
          }));
      }

      if (seriesRes.ok) {
        const seriesData = await seriesRes.json();
        series = seriesData.data
          .slice(0, 10)
          .map((serie: any) => ({
            ...serie,
            image: serie.image ? getFullImageUrl(serie.image) : null,
            type: "series",
          }));
      }

      return { movies, series };
    } catch (err) {
      console.error("Error al buscar shows:", err);
      return { movies: [], series: [] };
    }
  };

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
    fetchSeriesEpisodes,
    searchShows,
  };
}
