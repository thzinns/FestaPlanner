export type PricingType = 'fixed' | 'per_quantity' | 'per_hour' | 'on_request' | string;

export interface CustomPricingType {
  id: string;
  label: string;
  unitLabel: string; // e.g. "metro", "pessoa", "km"
  hasQuantity: boolean; // if true, price * quantity; if false, fixed price
}

export interface Service {
  id: string;
  name: string;
  description: string;
  pricingType: PricingType;
  price: number; // 0 for on_request
  note: string; // e.g. "mínimo de 4 horas"
  active: boolean;
}

export interface BudgetItem {
  service: Service;
  quantity: number; // used for per_quantity and per_hour
  selected: boolean;
}

export const builtInPricingTypes: Record<string, string> = {
  fixed: 'Preço fixo',
  per_quantity: 'Por quantidade',
  per_hour: 'Por hora',
  on_request: 'Sob consulta',
};

export function getPricingTypeLabel(type: PricingType, customTypes: CustomPricingType[]): string {
  if (builtInPricingTypes[type]) return builtInPricingTypes[type];
  const custom = customTypes.find((c) => c.id === type);
  return custom?.label ?? type;
}

export function pricingTypeHasQuantity(type: PricingType, customTypes: CustomPricingType[]): boolean {
  if (type === 'per_quantity' || type === 'per_hour') return true;
  if (type === 'fixed' || type === 'on_request') return false;
  const custom = customTypes.find((c) => c.id === type);
  return custom?.hasQuantity ?? false;
}

export function getPricingTypeUnitLabel(type: PricingType, customTypes: CustomPricingType[]): string {
  if (type === 'per_quantity') return 'unid.';
  if (type === 'per_hour') return 'hora';
  const custom = customTypes.find((c) => c.id === type);
  return custom?.unitLabel ?? '';
}
