import { useState } from 'react';
import { Service, PricingType, builtInPricingTypes, CustomPricingType } from '@/types/service';

interface ServiceFormProps {
  service?: Service;
  customPricingTypes: CustomPricingType[];
  onSave: (service: Service) => void;
  onCancel: () => void;
}

export function ServiceForm({ service, customPricingTypes, onSave, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [pricingType, setPricingType] = useState<PricingType>(service?.pricingType ?? 'fixed');
  const [price, setPrice] = useState(service?.price?.toString() ?? '');
  const [note, setNote] = useState(service?.note ?? '');

  const allPricingTypes: { key: string; label: string }[] = [
    ...Object.entries(builtInPricingTypes).map(([key, label]) => ({ key, label })),
    ...customPricingTypes.map((c) => ({ key: c.id, label: c.label })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: service?.id ?? crypto.randomUUID(),
      name,
      description,
      pricingType,
      price: pricingType === 'on_request' ? 0 : parseFloat(price) || 0,
      note,
      active: service?.active ?? true,
    });
  };

  const getCustomUnit = () => {
    const custom = customPricingTypes.find((c) => c.id === pricingType);
    return custom?.unitLabel ?? '';
  };

  const priceLabel =
    pricingType === 'per_quantity'
      ? 'Valor por unidade (R$)'
      : pricingType === 'per_hour'
      ? 'Valor por hora (R$)'
      : !builtInPricingTypes[pricingType] && getCustomUnit()
      ? `Valor por ${getCustomUnit()} (R$)`
      : 'Valor (R$)';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Nome do serviço</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ex: Aluguel do Salão" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Descrição curta</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ex: Uso exclusivo do espaço" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Tipo de preço</label>
        <div className="grid grid-cols-2 gap-2">
          {allPricingTypes.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setPricingType(key)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                pricingType === key ? 'border-primary bg-primary/10 text-foreground' : 'border-input bg-background text-muted-foreground'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {pricingType !== 'on_request' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{priceLabel}</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" required
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0.00" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Observação (opcional)</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ex: Mínimo de 4 horas" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
          {service ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}
