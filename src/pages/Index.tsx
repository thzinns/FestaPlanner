import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Service, BudgetItem, CustomPricingType } from '@/types/service';
import { 
  fetchServicesBySlug, 
  fetchSettingsBySlug, 
  fetchCustomPricingTypesBySlug,
  StoreSettings 
} from '@/lib/supabase-store';
import { ServiceCard } from '@/components/ServiceCard';
import { BudgetSummary } from '@/components/BudgetSummary';

const Index = () => {
  // Get slug from URL params (e.g., /loja/joao)
  // If no slug, you could use a default or show error
  const { slug } = useParams<{ slug?: string }>();
  const storeSlug = slug || 'default'; // You can change 'default' logic
  
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [customPricingTypes, setCustomPricingTypes] = useState<CustomPricingType[]>([]);
  const [settings, setSettingsState] = useState<StoreSettings>({
    businessName: 'Salão de Festas',
    businessDescription: 'Monte seu orçamento personalizado',
    whatsappNumber: '5511999999999',
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      
      try {
        const [services, s, cpt] = await Promise.all([
          fetchServicesBySlug(storeSlug),
          fetchSettingsBySlug(storeSlug),
          fetchCustomPricingTypesBySlug(storeSlug),
        ]);
        
        // If no services found, might be invalid slug
        if (services.length === 0 && s.slug === storeSlug) {
          // Store exists but has no services - this is OK
          setBudgetItems([]);
        } else if (services.length === 0) {
          // Store doesn't exist
          setNotFound(true);
        } else {
          setBudgetItems(
            services.filter((s) => s.active).map((s) => ({ 
              service: s, 
              quantity: 1, 
              selected: false 
            }))
          );
        }
        
        setSettingsState(s);
        setCustomPricingTypes(cpt);
      } catch (err) {
        console.error('Error loading store data:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [storeSlug]);

  const toggleItem = (id: string) => {
    setBudgetItems((prev) =>
      prev.map((item) => item.service.id === id ? { ...item, selected: !item.selected } : item)
    );
  };

  const updateQuantity = (id: string, qty: number) => {
    setBudgetItems((prev) =>
      prev.map((item) => item.service.id === id ? { ...item, quantity: qty } : item)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground">
            A loja "{storeSlug}" não existe ou ainda não foi configurada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
            {settings.businessName}
          </h1>
          <p className="text-xs text-muted-foreground">{settings.businessDescription}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Serviços disponíveis
        </h2>
        <div className="space-y-3">
          {budgetItems.map((item, i) => (
            <div key={item.service.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <ServiceCard
                item={item}
                customPricingTypes={customPricingTypes}
                onToggle={() => toggleItem(item.service.id)}
                onQuantityChange={(qty) => updateQuantity(item.service.id, qty)}
              />
            </div>
          ))}
        </div>
        {budgetItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum serviço disponível no momento.</p>
          </div>
        )}
      </main>

      <BudgetSummary 
        items={budgetItems} 
        customPricingTypes={customPricingTypes} 
        whatsappNumber={settings.whatsappNumber} 
      />
    </div>
  );
};

export default Index;