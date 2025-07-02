import { createClient } from '@libsql/client';

// Configuración de Turso
const client = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL || 'file:./local.db',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
});

// Interfaces para la base de datos
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserShow {
  id: string;
  user_id: string;
  show_id: number;
  show_type: 'movie' | 'series';
  list_type: 'favorites' | 'watchlist' | 'watched';
  created_at: string;
}

// Inicializar la base de datos
export const initDatabase = async () => {
  try {
    // Crear tabla de usuarios
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de shows del usuario
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_shows (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        show_id INTEGER NOT NULL,
        show_type TEXT NOT NULL CHECK (show_type IN ('movie', 'series')),
        list_type TEXT NOT NULL CHECK (list_type IN ('favorites', 'watchlist', 'watched')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, show_id, show_type, list_type)
      )
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
  }
};

// Funciones para usuarios
export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  const id = crypto.randomUUID();
  const result = await client.execute({
    sql: 'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
    args: [id, user.name, user.email]
  });
  
  return {
    id,
    name: user.name,
    email: user.email,
    created_at: new Date().toISOString()
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });
  
  return result.rows[0] as User || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  
  return result.rows[0] as User || null;
};

// Funciones para shows del usuario
export const addUserShow = async (userShow: Omit<UserShow, 'id' | 'created_at'>): Promise<void> => {
  const id = crypto.randomUUID();
  await client.execute({
    sql: 'INSERT OR REPLACE INTO user_shows (id, user_id, show_id, show_type, list_type) VALUES (?, ?, ?, ?, ?)',
    args: [id, userShow.user_id, userShow.show_id, userShow.show_type, userShow.list_type]
  });
};

export const removeUserShow = async (userId: string, showId: number, showType: string, listType: string): Promise<void> => {
  await client.execute({
    sql: 'DELETE FROM user_shows WHERE user_id = ? AND show_id = ? AND show_type = ? AND list_type = ?',
    args: [userId, showId, showType, listType]
  });
};

export const getUserShows = async (userId: string, listType: string): Promise<UserShow[]> => {
  const result = await client.execute({
    sql: 'SELECT * FROM user_shows WHERE user_id = ? AND list_type = ? ORDER BY created_at DESC',
    args: [userId, listType]
  });
  
  return result.rows as UserShow[];
};

export const isUserShowInList = async (userId: string, showId: number, showType: string, listType: string): Promise<boolean> => {
  const result = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM user_shows WHERE user_id = ? AND show_id = ? AND show_type = ? AND list_type = ?',
    args: [userId, showId, showType, listType]
  });
  
  return (result.rows[0] as any).count > 0;
};

export { client }; 