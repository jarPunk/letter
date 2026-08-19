/**
 * Configuración y cliente de Supabase para "Una Carta Especial"
 * 
 * INSTRUCCIONES:
 * 1. Crea un proyecto en https://supabase.com
 * 2. Ejecuta el script SQL en el SQL Editor de tu panel de Supabase.
 * 3. Copia tu "Project URL" y tu "anon public API key" de Project Settings -> API
 * 4. Pega los valores en las variables SUPABASE_URL y SUPABASE_ANON_KEY a continuación.
 */

const SUPABASE_CONFIG = {
  url: 'https://slhxpxasipvexgpovxuh.supabase.co',
  anonKey: 'sb_publishable_gzZpy3edmRcIvoqhHBXedQ_9H5w3g7P'
};

// Generador de códigos cortos únicos y amigables (ej: "k8m2x9")
function generateUniqueCode(length = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Inicializar cliente Supabase si las credenciales fueron provistas
let supabaseClientInstance = null;

function isSupabaseConfigured() {
  return (
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url !== 'https://TU-PROYECTO.supabase.co' &&
    SUPABASE_CONFIG.anonKey &&
    SUPABASE_CONFIG.anonKey !== 'TU-ANON-KEY-AQUI'
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClientInstance && window.supabase) {
    supabaseClientInstance = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
  }
  return supabaseClientInstance;
}

const SupabaseLetterDB = {
  isConfigured: isSupabaseConfigured,
  
  /**
   * Guarda una nueva carta en la base de datos
   */
  async createLetter({ recipient_name, sender_name, sender_email, message, acceptance_message }) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase no está configurado');
    }

    const short_code = generateUniqueCode(8);

    const { data, error } = await client
      .from('letters')
      .insert([
        {
          short_code,
          recipient_name,
          sender_name,
          sender_email,
          message,
          acceptance_message,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Obtiene los datos de una carta por su short_code
   */
  async getLetterByCode(shortCode) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase no está configurado');
    }

    const { data, error } = await client
      .from('letters')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Actualiza el estado de la carta a "viewed" (vista)
   */
  async markLetterViewed(letterId) {
    const client = getSupabaseClient();
    if (!client || !letterId) return null;

    try {
      const { data, error } = await client
        .from('letters')
        .update({
          status: 'viewed',
          viewed_at: new Date().toISOString()
        })
        .eq('id', letterId)
        .eq('status', 'pending') // Solo actualizar si estaba pendiente
        .select();

      if (error) console.warn('No se pudo actualizar estado a viewed:', error);
      return data;
    } catch (err) {
      console.warn('Error al marcar vista:', err);
      return null;
    }
  },

  /**
   * Guarda la respuesta (Sí / No) de quien recibió la carta
   */
  async saveResponse({ letterId, answer, message = null }) {
    const client = getSupabaseClient();
    if (!client || !letterId) return null;

    try {
      // 1. Insertar en tabla responses
      const { data, error } = await client
        .from('responses')
        .insert([
          {
            letter_id: letterId,
            answer,
            message
          }
        ])
        .select()
        .single();

      if (error) {
        console.warn('Error al registrar respuesta en Supabase:', error);
      }

      // 2. Actualizar estado en tabla letters a 'responded'
      await client
        .from('letters')
        .update({ status: 'responded' })
        .eq('id', letterId);

      return data;
    } catch (err) {
      console.warn('Error en saveResponse:', err);
      return null;
    }
  }
};

window.SupabaseLetterDB = SupabaseLetterDB;
