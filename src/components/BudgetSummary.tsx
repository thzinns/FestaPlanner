import { BudgetItem, CustomPricingType, pricingTypeHasQuantity, getPricingTypeUnitLabel } from '@/types/service';
import { MessageCircle } from 'lucide-react';

interface BudgetSummaryProps {
  items: BudgetItem[];
  customPricingTypes: CustomPricingType[];
  whatsappNumber?: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function BudgetSummary({ items, customPricingTypes, whatsappNumber = '5511999999999' }: BudgetSummaryProps) {
  const selectedItems = items.filter((i) => i.selected && i.service.pricingType !== 'on_request');
  const onRequestItems = items.filter((i) => i.selected && i.service.pricingType === 'on_request');

  const total = selectedItems.reduce((sum, item) => {
    const hasQty = pricingTypeHasQuantity(item.service.pricingType, customPricingTypes);
    if (hasQty) return sum + item.service.price * item.quantity;
    return sum + item.service.price;
  }, 0);

  const buildMessage = () => {
    let msg = '🎉 *Orçamento - Salão de Festas*\n\n';

    selectedItems.forEach((item) => {
      const hasQty = pricingTypeHasQuantity(item.service.pricingType, customPricingTypes);
      const unitLabel = getPricingTypeUnitLabel(item.service.pricingType, customPricingTypes);
      const sub = hasQty ? item.service.price * item.quantity : item.service.price;
      const detail = hasQty ? ` (${item.quantity} ${unitLabel})` : '';
      msg += `• ${item.service.name}${detail}: ${formatCurrency(sub)}\n`;
    });

    if (onRequestItems.length > 0) {
      msg += '\n📋 *Itens sob consulta:*\n';
      onRequestItems.forEach((item) => {
        msg += `• ${item.service.name}\n`;
      });
    }

    msg += `\n💰 *Total estimado: ${formatCurrency(total)}*`;
    msg += '\n\nGostaria de mais informações!';
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${buildMessage()}`;

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-card border-t-2 border-border p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Total estimado</p>
            <p className="text-2xl font-serif font-bold text-foreground">
              {formatCurrency(total)}
            </p>
          </div>
          {selectedItems.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-success text-success-foreground font-semibold py-3.5 text-base transition-all active:scale-[0.98] hover:opacity-90"
        >
          <MessageCircle className="w-5 h-5" />
          Solicitar orçamento pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
