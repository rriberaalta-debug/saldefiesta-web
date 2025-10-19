import { Post, User } from '../types';

/**
 * Simula la generación de una descripción para un post.
 * @returns una descripción de prueba.
 */
export async function generateDescription(title: string, city: string): Promise<string> {
    console.log(`[GEMINI MOCK] Generando descripción para: ${title} en ${city}`);
    
    // Devolvemos una descripción de prueba fija
    return "Una descripción generada automáticamente para este maravilloso recuerdo de fiesta.";
}

/**
 * Simula una búsqueda por IA, siempre devolviendo todos los posts.
 * @returns una lista de todos los IDs de posts.
 */
export async function searchPostsWithAI(query: string, posts: Post[], users: User[]): Promise<string[]> {
    console.log(`[GEMINI MOCK] Buscando posts con query: "${query}". Devolviendo todos los posts.`);

    // Devolvemos todos los IDs de post para simular una búsqueda exitosa y no bloquear el feed.
    return posts.map(post => post.id);
}

/**
 * Simula la búsqueda de fiestas, siempre devolviendo una lista de ciudades de prueba.
 * @returns una lista de ciudades de prueba.
 */
export async function findFiestasWithAI(query: string, location: { lat: number, lon: number }): Promise<string[]> {
    console.log(`[GEMINI MOCK] Buscando fiestas con query: "${query}". Devolviendo ciudades de prueba.`);
    
    // Devolvemos una lista de ciudades de prueba para simular el resultado.
    return ["Madrid", "Barcelona", "Sevilla", "Valencia"];
}