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
  password: string;
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



// 🚀 Función para verificar si la base de datos existe
export const checkDatabaseExists = async (): Promise<boolean> => {
  try {
    const result = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`);
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
};

// 🚀 Función para inicializar la base de datos completa
export const initDatabase = async () => {
  try {
    // Verificar si la base de datos ya existe
    const exists = await checkDatabaseExists();
    if (exists) {
      console.log('✅ Base de datos ya existe, omitiendo inicialización');
      return { success: true, message: 'Base de datos ya existe' };
    }

    console.log('🔧 Inicializando base de datos por primera vez...');

    // 1. Tabla de usuarios
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
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
    
    // Crear usuario demo para pruebas (opcional)
    await createDemoUser();
    
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
    sql: 'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, user.name, user.email, user.password, now]
  });
  
  return {
    id,
    name: user.name,
    email: user.email,
    password: user.password,
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
  // Verificar si ya existe
  const exists = await isFavorite(userId, movieId, seriesId);
  if (exists) {
    console.log('⚠️ Favorito ya existe, no se agrega duplicado');
    return;
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT INTO user_favorites (id, user_id, movie_id, series_id, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, userId, movieId || null, seriesId || null, now]
  });
  console.log('✅ Favorito agregado a BD');
};

export const removeFavorite = async (userId: string, movieId?: number, seriesId?: number): Promise<void> => {
  if (movieId) {
    await client.execute({
      sql: 'DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?',
      args: [userId, movieId]
    });
  } else if (seriesId) {
    await client.execute({
      sql: 'DELETE FROM user_favorites WHERE user_id = ? AND series_id = ?',
      args: [userId, seriesId]
    });
  }
};

export const isFavorite = async (userId: string, movieId?: number, seriesId?: number): Promise<boolean> => {
  let result;
  if (movieId) {
    result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ? AND movie_id = ?',
      args: [userId, movieId]
    });
  } else if (seriesId) {
    result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ? AND series_id = ?',
      args: [userId, seriesId]
    });
  } else {
    return false;
  }
  
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

export const removeWatchedMovie = async (userId: string, movieId: number): Promise<void> => {
  await client.execute({
    sql: 'DELETE FROM user_watched_movies WHERE user_id = ? AND movie_id = ?',
    args: [userId, movieId]
  });
};

// Funciones para series completas como "watched"
export const addWatchedSeries = async (userId: string, seriesId: number): Promise<void> => {
  // Usamos la tabla user_watched_episodes con un episodio especial (id = 0) para marcar serie completa
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT OR REPLACE INTO user_watched_episodes (id, user_id, series_id, episode_id, season_number, episode_number, watched_at, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, userId, seriesId, 0, 0, 0, now, null, 'SERIES_COMPLETE']
  });
};

export const removeWatchedSeries = async (userId: string, seriesId: number): Promise<void> => {
  await client.execute({
    sql: 'DELETE FROM user_watched_episodes WHERE user_id = ? AND series_id = ? AND episode_id = 0',
    args: [userId, seriesId]
  });
};

export const isSeriesWatched = async (userId: string, seriesId: number): Promise<boolean> => {
  const result = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM user_watched_episodes WHERE user_id = ? AND series_id = ? AND episode_id = 0',
    args: [userId, seriesId]
  });
  
  return (result.rows[0] as any).count > 0;
};

// Funciones para watchlist
export const addToWatchlist = async (userId: string, movieId?: number, seriesId?: number): Promise<void> => {
  // Verificar si ya existe
  const exists = await isInWatchlist(userId, movieId, seriesId);
  if (exists) {
    console.log('⚠️ Item ya está en watchlist, no se agrega duplicado');
    return;
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: 'INSERT INTO user_watchlist (id, user_id, movie_id, series_id, added_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, userId, movieId || null, seriesId || null, now]
  });
  console.log('✅ Item agregado a watchlist en BD');
};

export const removeFromWatchlist = async (userId: string, movieId?: number, seriesId?: number): Promise<void> => {
  if (movieId) {
    await client.execute({
      sql: 'DELETE FROM user_watchlist WHERE user_id = ? AND movie_id = ?',
      args: [userId, movieId]
    });
  } else if (seriesId) {
    await client.execute({
      sql: 'DELETE FROM user_watchlist WHERE user_id = ? AND series_id = ?',
      args: [userId, seriesId]
    });
  }
};

export const isInWatchlist = async (userId: string, movieId?: number, seriesId?: number): Promise<boolean> => {
  let result;
  if (movieId) {
    result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM user_watchlist WHERE user_id = ? AND movie_id = ?',
      args: [userId, movieId]
    });
  } else if (seriesId) {
    result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM user_watchlist WHERE user_id = ? AND series_id = ?',
      args: [userId, seriesId]
    });
  } else {
    return false;
  }
  
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

export const removeWatchedEpisode = async (userId: string, episodeId: number): Promise<void> => {
  await client.execute({
    sql: 'DELETE FROM user_watched_episodes WHERE user_id = ? AND episode_id = ?',
    args: [userId, episodeId]
  });
};

export const getSeriesWatchedEpisodes = async (userId: string, seriesId: number): Promise<{ episode_id: number, watched_at: string }[]> => {
  const result = await client.execute({
    sql: 'SELECT episode_id, watched_at FROM user_watched_episodes WHERE user_id = ? AND series_id = ? ORDER BY watched_at DESC',
    args: [userId, seriesId]
  });
  
  return result.rows as unknown as { episode_id: number, watched_at: string }[];
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

// Funciones para cargar listas completas del usuario
export const getUserFavorites = async (userId: string) => {
  const result = await client.execute({
    sql: 'SELECT movie_id, series_id, created_at FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId]
  });
  
  return result.rows as unknown as { movie_id: number | null, series_id: number | null, created_at: string }[];
};

export const getUserWatchlist = async (userId: string) => {
  const result = await client.execute({
    sql: 'SELECT movie_id, series_id, added_at FROM user_watchlist WHERE user_id = ? ORDER BY added_at DESC',
    args: [userId]
  });
  
  return result.rows as unknown as { movie_id: number | null, series_id: number | null, added_at: string }[];
};

export const getUserWatchedMovies = async (userId: string) => {
  const result = await client.execute({
    sql: 'SELECT movie_id, watched_at, rating, notes FROM user_watched_movies WHERE user_id = ? ORDER BY watched_at DESC',
    args: [userId]
  });
  
  return result.rows as unknown as { movie_id: number, watched_at: string, rating: number | null, notes: string | null }[];
};

export const getUserWatchedSeries = async (userId: string) => {
  const result = await client.execute({
    sql: 'SELECT series_id, watched_at FROM user_watched_episodes WHERE user_id = ? AND episode_id = 0 ORDER BY watched_at DESC',
    args: [userId]
  });
  
  return result.rows as unknown as { series_id: number, watched_at: string }[];
};

// Función para crear usuario demo para pruebas
export const createDemoUser = async (): Promise<void> => {
  try {
    // Hashear la contraseña demo
    const encoder = new TextEncoder();
    const data = encoder.encode('demo123');
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashedPassword = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Verificar si ya existe el usuario demo
    const existingUser = await getUserByEmail('demo@example.com');
    if (existingUser) {
      // Si existe, verificar si tiene la contraseña correcta (hasheada)
      if (existingUser.password !== hashedPassword) {
        console.log('🔄 Actualizando contraseña del usuario demo...');
        await client.execute({
          sql: 'UPDATE users SET password = ? WHERE email = ?',
          args: [hashedPassword, 'demo@example.com']
        });
        console.log('✅ Contraseña del usuario demo actualizada');
      } else {
        console.log('👤 Usuario demo ya existe con contraseña correcta');
      }
      return;
    }
    
    // Crear usuario demo nuevo
    await createUser({
      name: 'Usuario Demo',
      email: 'demo@example.com',
      password: hashedPassword
    });
    
    console.log('👤 Usuario demo creado: demo@example.com / demo123');
  } catch (error) {
    console.error('❌ Error creando/actualizando usuario demo:', error);
  }
};

// Función para hashear contraseñas (misma que en useAuth.ts)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Función para actualizar contraseña de cualquier usuario
export const updateUserPassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    const result = await client.execute({
      sql: 'UPDATE users SET password = ? WHERE email = ?',
      args: [hashedPassword, email]
    });
    
    return result.rowsAffected > 0;
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    return false;
  }
};

export { client }; 