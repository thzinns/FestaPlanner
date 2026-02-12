import { supabase } from '@/integrations/supabase/client';
import { Service, CustomPricingType } from '@/types/service';

export interface StoreSettings {
  businessName: string;
  businessDescription: string;
  whatsappNumber: string;
  slug?: string;
}

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ============================================================================
// PUBLIC STORE FUNCTIONS (para a página pública - qualquer pessoa pode ler)
// ============================================================================

/**
 * Fetch services by user slug (for public store page)
 * Anyone can call this - no auth required
 */
export async function fetchServicesBySlug(slug: string): Promise<Service[]> {
  // First, get the user_id from the slug
  const settingsResult = await supabase
    .from('store_settings')
    .select('user_id')
    .eq('slug', slug)
    .single();
  
  if (settingsResult.error || !settingsResult.data) {
    return [];
  }
  
  const userId = settingsResult.data.user_id;
  
  // Now fetch services for that user
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    pricingType: row.pricing_type,
    price: Number(row.price),
    note: row.note,
    active: row.active,
  }));
}

/**
 * Fetch settings by slug (for public store page)
 * Anyone can call this - no auth required
 */
export async function fetchSettingsBySlug(slug: string): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    // Return defaults if not found
    return {
      businessName: 'Salão de Festas',
      businessDescription: 'Monte seu orçamento personalizado',
      whatsappNumber: '5511999999999',
      slug: slug,
    };
  }
  
  return {
    businessName: data.business_name,
    businessDescription: data.business_description,
    whatsappNumber: data.whatsapp_number,
    slug: data.slug,
  };
}

/**
 * Fetch custom pricing types by slug (for public store page)
 * Anyone can call this - no auth required
 */
export async function fetchCustomPricingTypesBySlug(slug: string): Promise<CustomPricingType[]> {
  // First, get the user_id from the slug
  const settingsResult = await supabase
    .from('store_settings')
    .select('user_id')
    .eq('slug', slug)
    .single();
  
  if (settingsResult.error || !settingsResult.data) {
    return [];
  }
  
  const userId = settingsResult.data.user_id;
  
  const { data, error } = await supabase
    .from('custom_pricing_types')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return (data || []).map((row) => ({
    id: row.id,
    label: row.label,
    unitLabel: row.unit_label,
    hasQuantity: row.has_quantity,
  }));
}

// ============================================================================
// ADMIN FUNCTIONS (apenas para o dono - requer autenticação)
// ============================================================================

/**
 * Fetch logged-in user's services (for admin panel)
 * Requires authentication
 */
export async function fetchServices(): Promise<Service[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    pricingType: row.pricing_type,
    price: Number(row.price),
    note: row.note,
    active: row.active,
  }));
}

/**
 * Create or update a service (admin only)
 * Requires authentication
 */
export async function upsertService(service: Service): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  
  const payload = {
    id: service.id,
    user_id: userId,
    name: service.name,
    description: service.description,
    pricing_type: service.pricingType,
    price: service.price,
    note: service.note,
    active: service.active,
  };
  
  const { error } = await supabase.from('services').upsert(payload);
  if (error) throw error;
}

/**
 * Delete a service (admin only)
 * Requires authentication
 */
export async function deleteService(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
}

/**
 * Fetch logged-in user's settings (for admin panel)
 * Requires authentication
 */
export async function fetchSettings(): Promise<StoreSettings> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return {
      businessName: 'Salão de Festas',
      businessDescription: 'Monte seu orçamento personalizado',
      whatsappNumber: '5511999999999',
    };
  }
  
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    // If settings don't exist, create default ones
    if (error.code === 'PGRST116') {
      const defaultSettings = {
        user_id: userId,
        slug: userId,
        business_name: 'Salão de Festas',
        business_description: 'Monte seu orçamento personalizado',
        whatsapp_number: '5511999999999',
      };
      
      const { error: insertError } = await supabase
        .from('store_settings')
        .insert(defaultSettings);
      
      if (insertError) throw insertError;
      
      return {
        businessName: defaultSettings.business_name,
        businessDescription: defaultSettings.business_description,
        whatsappNumber: defaultSettings.whatsapp_number,
        slug: defaultSettings.slug,
      };
    }
    throw error;
  }
  
  return {
    businessName: data.business_name,
    businessDescription: data.business_description,
    whatsappNumber: data.whatsapp_number,
    slug: data.slug,
  };
}

/**
 * Update logged-in user's settings (admin only)
 * Requires authentication
 */
export async function updateSettings(settings: StoreSettings): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('store_settings')
    .update({
      business_name: settings.businessName,
      business_description: settings.businessDescription,
      whatsapp_number: settings.whatsappNumber,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  if (error) throw error;
}

/**
 * Fetch logged-in user's custom pricing types (for admin panel)
 * Requires authentication
 */
export async function fetchCustomPricingTypes(): Promise<CustomPricingType[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('custom_pricing_types')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return (data || []).map((row) => ({
    id: row.id,
    label: row.label,
    unitLabel: row.unit_label,
    hasQuantity: row.has_quantity,
  }));
}

/**
 * Create a custom pricing type (admin only)
 * Requires authentication
 */
export async function insertCustomPricingType(type: Omit<CustomPricingType, 'id'>): Promise<CustomPricingType> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('custom_pricing_types')
    .insert({
      user_id: userId,
      label: type.label,
      unit_label: type.unitLabel,
      has_quantity: type.hasQuantity,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    label: data.label,
    unitLabel: data.unit_label,
    hasQuantity: data.has_quantity,
  };
}

/**
 * Delete a custom pricing type (admin only)
 * Requires authentication
 */
export async function deleteCustomPricingType(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('custom_pricing_types')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
}