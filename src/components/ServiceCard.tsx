import { BudgetItem, CustomPricingType, pricingTypeHasQuantity, getPricingTypeUnitLabel } from '@/types/service';
import { Minus, Plus, Info, Check } from 'lucide-react';

interface ServiceCardProps {
  item: BudgetItem;
  customPricingTypes: CustomPricingType[];
  onToggle: () => void;
  onQuantityChange: (qty: number) => void;
}

export function ServiceCard({ item, customPricingTypes, onToggle, onQuantityChange }: ServiceCardProps) {
  const { service, quantity, selected } = item;
  const isOnRequest = service.pricingType === 'on_request';
  const hasQty = pricingTypeHasQuantity(service.pricingType, customPricingTypes);
  const unitLabel = getPricingTypeUnitLabel(service.pricingType, customPricingTypes);

  const getSubtotal = () => {
    if (isOnRequest || !selected) return 0;
    if (hasQty) return service.price * quantity;
    return service.price;
  };

  const getPriceLabel = () => {
    if (isOnRequest) return 'Sob consulta';
    if (unitLabel) return `${formatCurrency(service.price)} / ${unitLabel}`;
    return formatCurrency(service.price);
  };

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all duration-200 ${
        selected ? 'border-primary bg-card shadow-sm' : 'border-border bg-card/60'
      } ${isOnRequest ? 'opacity-90' : ''}`}
    >
      <div className="flex items-start gap-3">
        {!isOnRequest && (
          <button
            onClick={onToggle}
            className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
              selected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/40 bg-background'
            }`}
            aria-label={selected ? 'Remover serviço' : 'Adicionar serviço'}
          >
            {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight">{service.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
          <p className="text-sm font-medium text-foreground mt-1.5">{getPriceLabel()}</p>
          {service.note && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              {service.note}
            </p>
          )}
        </div>
      </div>

      {isOnRequest && (
        <div className="mt-3 rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning-foreground flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-warning" />
          Valor definido após consulta
        </div>
      )}

      {selected && hasQty && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
          <span className="text-sm text-secondary-foreground capitalize">{unitLabel || 'Quantidade'}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-semibold text-foreground w-8 text-center">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selected && !isOnRequest && (
        <div className="mt-2 text-right">
          <span className="text-sm text-muted-foreground">Subtotal: </span>
          <span className="font-semibold text-foreground">{formatCurrency(getSubtotal())}</span>
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
