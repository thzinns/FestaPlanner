import { useState, useEffect } from 'react';
import { Service, CustomPricingType, getPricingTypeLabel } from '@/types/service';
import {
  fetchServices, upsertService, deleteService as deleteServiceApi,
  fetchSettings, updateSettings,
  fetchCustomPricingTypes, insertCustomPricingType, deleteCustomPricingType,
  StoreSettings,
} from '@/lib/supabase-store';
import { supabase } from '@/integrations/supabase/client';
import { ServiceForm } from '@/components/ServiceForm';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Plus, Pencil, Trash2, LogOut, Settings, Store, Tag, Link2, Check, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const Admin = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [settings, setSettingsState] = useState<StoreSettings>({ businessName: '', businessDescription: '', whatsappNumber: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [customPricingTypes, setCustomPricingTypes] = useState<CustomPricingType[]>([]);
  const [showPricingTypes, setShowPricingTypes] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeUnit, setNewTypeUnit] = useState('');
  const [newTypeHasQty, setNewTypeHasQty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin-login', { replace: true });
        return;
      }
      loadData();
    });
  }, [navigate]);

  const loadData = async () => {
    try {
      const [s, st, cpt] = await Promise.all([fetchServices(), fetchSettings(), fetchCustomPricingTypes()]);
      setServices(s);
      setSettingsState(st);
      setCustomPricingTypes(cpt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (service: Service) => {
    await upsertService(service);
    await loadData();
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await deleteServiceApi(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSettingsSave = async () => {
    await updateSettings(settings);
    setShowSettings(false);
  };

  const handleAddPricingType = async () => {
    if (!newTypeLabel.trim()) return;
    const created = await insertCustomPricingType({
      label: newTypeLabel.trim(),
      unitLabel: newTypeUnit.trim() || newTypeLabel.trim().toLowerCase(),
      hasQuantity: newTypeHasQty,
    });
    setCustomPricingTypes((prev) => [...prev, created]);
    setNewTypeLabel('');
    setNewTypeUnit('');
    setNewTypeHasQty(true);
  };

  const handleDeletePricingType = async (id: string) => {
    await deleteCustomPricingType(id);
    setCustomPricingTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login', { replace: true });
  };

  const handleCopyLink = () => {
    const storeLink = `${window.location.origin}/loja/${settings.slug || ''}`;
    navigator.clipboard.writeText(storeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showForm = editing || creating;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h1 className="text-lg font-serif font-bold text-foreground">Painel Admin</h1>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Alterar senha"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowPricingTypes(!showPricingTypes); setShowSettings(false); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                showPricingTypes ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
              title="Tipos de preço"
            >
              <Tag className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowSettings(!showSettings); setShowPricingTypes(false); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                showSettings ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
              title="Configurações"
            >
              <Store className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Card com link da loja pública */}
        {settings.slug && (
          <div className="mb-6 animate-fade-in">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    📱 Link da sua loja pública
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Compartilhe este link com seus clientes para que eles montem orçamentos
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/loja/${settings.slug}`}
                      className="flex-1 rounded-lg bg-background border border-input px-3 py-2 text-sm text-foreground font-mono"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        'Copiar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="animate-fade-in mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Configurações do negócio
            </h2>
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome do negócio</label>
                <input type="text" value={settings.businessName} onChange={(e) => setSettingsState({ ...settings, businessName: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ex: Salão de Festas Premium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                <input type="text" value={settings.businessDescription} onChange={(e) => setSettingsState({ ...settings, businessDescription: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ex: Monte seu orçamento personalizado" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Número do WhatsApp</label>
                <input type="text" value={settings.whatsappNumber} onChange={(e) => setSettingsState({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ex: 5511999999999" />
                <p className="text-xs text-muted-foreground mt-1">Formato: código do país + DDD + número</p>
              </div>
              <button onClick={handleSettingsSave}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
                Salvar configurações
              </button>
            </div>
          </div>
        )}

        {showPricingTypes && (
          <div className="animate-fade-in mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Tipos de preço personalizados
            </h2>
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              {customPricingTypes.length > 0 && (
                <div className="space-y-2">
                  {customPricingTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-foreground">{type.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {type.hasQuantity ? `por ${type.unitLabel}` : 'valor fixo'}
                        </span>
                      </div>
                      <button onClick={() => handleDeletePricingType(type.id)}
                        className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Novo tipo</p>
                <input type="text" value={newTypeLabel} onChange={(e) => setNewTypeLabel(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nome do tipo (ex: Por metro)" />
                <input type="text" value={newTypeUnit} onChange={(e) => setNewTypeUnit(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Unidade (ex: metro, pessoa, km)" />
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={newTypeHasQty} onChange={(e) => setNewTypeHasQty(e.target.checked)}
                    className="w-4 h-4 rounded border-input accent-primary" />
                  Cobrar por quantidade (preço × quantidade)
                </label>
                <button onClick={handleAddPricingType} disabled={!newTypeLabel.trim()}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
                  Criar tipo de preço
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm ? (
          <div className="animate-fade-in">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {editing ? 'Editar serviço' : 'Novo serviço'}
            </h2>
            <div className="rounded-2xl border border-border bg-card p-4">
              <ServiceForm
                service={editing ?? undefined}
                customPricingTypes={customPricingTypes}
                onSave={handleSave}
                onCancel={() => { setEditing(null); setCreating(false); }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Serviços ({services.length})
              </h2>
              <button onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {services.map((service, i) => (
                <div key={service.id} className="rounded-2xl border border-border bg-card p-4 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{service.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                          {getPricingTypeLabel(service.pricingType, customPricingTypes)}
                        </span>
                        {service.pricingType !== 'on_request' && (
                          <span className="text-sm font-medium text-foreground">{formatCurrency(service.price)}</span>
                        )}
                      </div>
                      {service.note && <p className="text-xs text-muted-foreground mt-1">{service.note}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditing(service)}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(service.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum serviço cadastrado.</p>
                <button onClick={() => setCreating(true)} className="mt-3 text-foreground font-medium text-sm underline">
                  Adicionar primeiro serviço
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de alterar senha */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </div>
  );
};

export default Admin;