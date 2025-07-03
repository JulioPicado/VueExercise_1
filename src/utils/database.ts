import { createClient } from '@libsql/client';

// Configuración de base de datos con Turso
const client = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL || '',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN || '',
});

// Interfaces para la base de datos
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  movie_id: number | null;
  series_id: number | null;
  created_at: string;
}

export interface UserWatchedMovie {
  id: string;
  user_id: string;
  movie_id: number;
  watched_at: string;
  rating: number | null;
  notes: string | null;
}

export interface UserWatchlist {
  id: string;
  user_id: string;
  movie_id: number | null;
  series_id: number | null;
  added_at: string;
}

export interface UserWatchedEpisode {
  id: string;
  user_id: string;
  series_id: number;
  episode_id: number;
  season_number: number;
  episode_number: number;
  watched_at: string;
  rating: number | null;
  notes: string | null;
}



// 🚀 Función para inicializar la base de datos completa
export const initDatabase = async () => {
  try {
    console.log('🔧 Inicializando base de datos...');

    // 1. Tabla de usuarios
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    console.log('✅ Tabla users creada');

    // 2. Tabla de favoritos (Movies + Series)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        movie_id INTEGER,
        series_id INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CHECK ((movie_id IS NULL) != (series_id IS NULL)),
        UNIQUE(user_id, movie_id, series_id)
      )
    `);
    console.log('✅ Tabla user_favorites creada');

    // 3. Tabla de películas vistas
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_watched_movies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        movie_id INTEGER NOT NULL,
        watched_at TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, movie_id)
      )
    `);
    console.log('✅ Tabla user_watched_movies creada');

    // 4. Tabla de watchlist (Movies + Series)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_watchlist (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        movie_id INTEGER,
        series_id INTEGER,
        added_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CHECK ((movie_id IS NULL) != (series_id IS NULL)),
        UNIQUE(user_id, movie_id, series_id)
      )
    `);
    console.log('✅ Tabla user_watchlist creada');

    // 5. Tabla de episodios vistos
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_watched_episodes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        series_id INTEGER NOT NULL,
        episode_id INTEGER NOT NULL,
        season_number INTEGER NOT NULL,
        episode_number INTEGER NOT NULL,
        watched_at TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, episode_id)
      )
    `);
    console.log('✅ Tabla user_watched_episodes creada');

    // 🔧 Crear índices para optimización
    console.log('🔧 Creando índices...');
    
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_user_watched_movies_user_id ON user_watched_movies(user_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_user_watched_episodes_user_id ON user_watched_episodes(user_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_user_watched_episodes_series ON user_watched_episodes(user_id, series_id)`);
    
    console.log('✅ Índices creados');

    console.log('🎉 ¡Base de datos inicializada correctamente!');
    
    return { success: true, message: 'Base de datos creada exitosamente' };
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    return { success: false, error };
  }
};

// Funciones básicas para usuarios
export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)',
    args: [id, user.name, user.email, now]
  });
  
  return {
    id,
    name: user.name,
    email: user.email,
    created_at: now
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });
  
  return result.rows[0] as unknown as User || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  
  return result.rows[0] as unknown as User || null;
};

// Funciones para favoritos
export const addFavorite = async (userId: string, movieId?: number, seriesId?: number): Promise<void> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT OR REPLACE INTO user_favorites (id, user_id, movie_id, series_id, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, userId, movieId || null, seriesId || null, now]
  });
};

export const removeFavorite = async (userId: string, movieId?: number, seriesId?: number): Promise<void> => {
  await client.execute({
    sql: 'DELETE FROM user_favorites WHERE user_id = ? AND (movie_id = ? OR series_id = ?)',
    args: [userId, movieId || null, seriesId || null]
  });
};

export const isFavorite = async (userId: string, movieId?: number, seriesId?: number): Promise<boolean> => {
  const result = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ? AND (movie_id = ? OR series_id = ?)',
    args: [userId, movieId || null, seriesId || null]
  });
  
  return (result.rows[0] as any).count > 0;
};

// Funciones para películas vistas
export const addWatchedMovie = async (userId: string, movieId: number, rating?: number, notes?: string): Promise<void> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT OR REPLACE INTO user_watched_movies (id, user_id, movie_id, watched_at, rating, notes) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, userId, movieId, now, rating || null, notes || null]
  });
};

export const isMovieWatched = async (userId: string, movieId: number): Promise<boolean> => {
  const result = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM user_watched_movies WHERE user_id = ? AND movie_id = ?',
    args: [userId, movieId]
  });
  
  return (result.rows[0] as any).count > 0;
};

// Funciones para episodios vistos
export const addWatchedEpisode = async (
  userId: string, 
  seriesId: number, 
  episodeId: number, 
  seasonNumber: number, 
  episodeNumber: number,
  rating?: number,
  notes?: string
): Promise<void> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT OR REPLACE INTO user_watched_episodes (id, user_id, series_id, episode_id, season_number, episode_number, watched_at, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, userId, seriesId, episodeId, seasonNumber, episodeNumber, now, rating || null, notes || null]
  });
};

export const isEpisodeWatched = async (userId: string, episodeId: number): Promise<boolean> => {
  const result = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM user_watched_episodes WHERE user_id = ? AND episode_id = ?',
    args: [userId, episodeId]
  });
  
  return (result.rows[0] as any).count > 0;
};

export const getSeriesProgress = async (userId: string, seriesId: number): Promise<{ seasonNumber: number, watchedCount: number }[]> => {
  const result = await client.execute({
    sql: `SELECT season_number, COUNT(*) as watched_count 
          FROM user_watched_episodes 
          WHERE user_id = ? AND series_id = ? 
          GROUP BY season_number 
          ORDER BY season_number`,
    args: [userId, seriesId]
  });
  
  return result.rows as unknown as { seasonNumber: number, watchedCount: number }[];
};

export { client }; 