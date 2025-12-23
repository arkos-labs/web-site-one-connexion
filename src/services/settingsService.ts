import { supabase } from "@/lib/supabase";

export interface TariffMetadata {
  key: string;
  value: string;
  description?: string;
}

export const getTariffMetadata = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from('tariff_metadata')
    .select('*');

  if (error) throw error;

  // Convert array to object for easier access
  const settings: Record<string, string> = {};
  (data || []).forEach((item: TariffMetadata) => {
    settings[item.key] = item.value;
  });

  return settings;
};

export const updateTariffMetadata = async (key: string, value: string): Promise<void> => {
  const { error } = await supabase
    .from('tariff_metadata')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
};

export const updateMultipleTariffMetadata = async (settings: Record<string, string>): Promise<void> => {
  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value: String(value)
  }));

  const { error } = await supabase
    .from('tariff_metadata')
    .upsert(updates, { onConflict: 'key' });

  if (error) throw error;
};
