import { GoogleGenAI, Type } from "@google/genai";
import { Post, User, FiestaEvent } from "../types";

// FIX: Corrected API key access to follow Gemini API guidelines and resolve the TypeScript error.
// The API key must be reitrieved from `process.env.VITE_API_KEY`. The error message was also updated.
const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  throw new Error("API_KEY no está definida. Asegúrate de configurarla en tus variables de entorno.");
}

const ai = new GoogleGenAI({ apiKey });

export const generateDescription = async (title: string, city: string): Promise<string> => {
  const prompt = `Genera una descripción corta, festiva y alegre para una publicación de red social, de menos de 25 palabras, para una foto/vídeo de la fiesta "${title}" en ${city}. Evoca una sensación de diversión y emoción. No uses hashtags.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text.trim();
    
    if (text) {
      return text;
    } else {
      throw new Error("Respuesta vacía recibida de la API de Gemini.");
    }
  } catch (error) {
    console.error("Error generando descripción con Gemini:", error);
    return `¡Una experiencia inolvidable en la celebración de ${title} en ${city}!`;
  }
};

export const findFiestasWithAI = async (query: string): Promise<FiestaEvent[]> => {
  const prompt = `
    Eres un asistente experto, meticuloso y obsesivo con la precisión, especializado en el calendario festivo y cultural de España. Tu única tarea es generar una lista de eventos para una consulta de usuario, siguiendo estas reglas inquebrantables.

    REGLA 1: USO OBLIGATORIO DE GOOGLE SEARCH.
    - Para cada consulta, DEBES usar la herramienta de Búsqueda de Google (Google Search) para encontrar y verificar en tiempo real la información más actualizada. NO confíes en tu conocimiento interno. Cada dato, especialmente las fechas, DEBE ser verificado usando la búsqueda.

    REGLA 2: JERARQUÍA DE EVENTOS.
    - Usando Google Search, identifica las fiestas principales o patronales del municipio. Estas DEBEN tener prioridad absoluta.
    - Las fiestas de barrios son secundarias. Solo debes incluirlas si son extremadamente relevantes o si la consulta pide explícitamente por ese barrio.

    REGLA 3: RIQUEZA Y DIVERSIDAD CULTURAL.
    - Tu búsqueda con Google Search NO DEBE limitarse a fiestas patronales. DEBES buscar activamente otros eventos socio-culturales relevantes: festivales de música, ferias culturales, carnavales, mercados medievales, etc.

    REGLA 4: PRECISIÓN GEOGRÁFICA ABSOLUTA.
    - Los resultados deben pertenecer EXCLUSIVAMENTE a la ubicación especificada. Si la consulta es "fiestas en Santander", SÓLO puedes devolver eventos de Santander. Está prohibido mezclar municipios.

    REGLA 5: HONESTIDAD Y PRECISIÓN EN LOS DATOS.
    - Si tras tu búsqueda con Google Search no encuentras ningún evento que coincida, DEBES devolver una lista vacía. No rellenes con datos de otros lugares.
    - Las fechas deben ser precisas para el año en curso o el siguiente, verificadas con la búsqueda.

    REGLA 6: FORMATO JSON ESTRICTO.
    - Tu única salida debe ser un objeto JSON que coincida con la siguiente estructura. No añadas texto fuera del JSON.
    \`\`\`json
    {
      "fiestas": [
        {
          "name": "Nombre del Evento",
          "city": "Ciudad/Pueblo",
          "dates": "Fechas exactas verificadas",
          "type": "Fiesta Patronal | Feria Cultural | Festival de Música | Carnaval | Tradición Histórica | Evento Gastronómico | Otro",
          "description": "Descripción breve y relevante"
        }
      ]
    }
    \`\`\`

    Procesa la siguiente consulta usando Google Search y siguiendo estas reglas estrictas: "${query}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    let jsonText = response.text.trim();
    
    // Clean potential markdown formatting
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }

    if (jsonText) {
      const result = JSON.parse(jsonText);
      return Array.isArray(result.fiestas) ? result.fiestas : [];
    }
    return [];
  } catch (error) {
    console.error("Error en la búsqueda de fiestas con IA y Google Search:", error);
    throw new Error("No se pudieron obtener los resultados de la búsqueda de fiestas.");
  }
};


export const searchPostsWithAI = async (query: string, posts: Post[], users: User[]): Promise<string[]> => {
  if (posts.length === 0) {
    return [];
  }
  
  const postsWithUsernames = posts.map(post => {
    const user = users.find(u => u.id === post.userId);
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      city: post.city,
      username: user ? user.username : 'Desconocido',
      timestamp: post.timestamp
    };
  });
  
  const prompt = `
    Eres un filtro de datos geográfico y contextual. Tu única función es devolver una lista de IDs de un JSON proporcionado que coincidan con una consulta, siguiendo reglas inquebrantables.

    REGLA 1: PRECISIÓN GEOGRÁFICA INQUEBRANTABLE. Esta es tu máxima prioridad.
    - Si la consulta menciona una ubicación (ciudad, pueblo, región), SÓLO puedes devolver publicaciones de esa ubicación EXACTA.
    - EJEMPLO DE ERROR GRAVE: Si la consulta es 'fiestas en Huelva', y devuelves un post de 'Sevilla', has fallado catastróficamente. NO MEZCLES CIUDADES bajo ninguna circunstancia.

    REGLA 2: HONESTIDAD ABSOLUTA.
    - Si NINGUNA publicación cumple ESTRICTAMENTE con la ubicación y el tema, tu ÚNICA respuesta válida es \`relevantPostIds: []\`. No improvises. No rellenes. Una respuesta vacía es una respuesta correcta.

    REGLA 3: FILTRADO DE FECHA PRECISO.
    - Si la consulta incluye un mes, año o fecha (ej: 'agosto', '2023'), debes usar el campo 'timestamp' para filtrar. Las publicaciones fuera de esa fecha quedan EXCLUIDAS.

    REGLA 4: BÚSQUEDA CONTEXTUAL (siempre subordinada a las reglas anteriores).
    - Después de aplicar los filtros geográficos y de fecha, usa el contexto del título y la descripción.
    - 'Toros en Pamplona' debe coincidir con un post de 'Sanfermines'. 'Evento de caballos en Andalucía' debe coincidir con 'Feria del Caballo de Jerez'.

    Tu única salida debe ser el objeto JSON. No incluyas explicaciones.

    Consulta del usuario: "${query}"

    Lista de publicaciones (JSON):
    ${JSON.stringify(postsWithUsernames)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevantPostIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["relevantPostIds"]
        }
      }
    });

    const jsonText = response.text.trim();
    if (jsonText) {
      const result = JSON.parse(jsonText);
      return Array.isArray(result.relevantPostIds) ? result.relevantPostIds : [];
    }
    return [];
  } catch (error) {
    console.error("Error en la búsqueda con IA de Gemini:", error);
    return []; 
  }
};