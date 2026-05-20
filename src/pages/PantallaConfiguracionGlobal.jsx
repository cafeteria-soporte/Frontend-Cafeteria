/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Settings, Clock, Shield, Hash,
  Bell, Save, ChevronRight, CheckCircle2,
  AlertCircle, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import { useConfig } from '@/features/global-settings/useConfig'; 


const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-3 mb-5">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
    >
      <Icon size={15} style={{ color: 'var(--primary)' }} />
    </div>
    <div>
      <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
      <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
    </div>
  </div>
);

const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
      {label}
    </label>
    {children}
    {hint && <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{hint}</p>}
  </div>
);

const NumberInput = ({ value, onChange, min, max, unit, disabled, ...props }) => (
  <div className="relative flex items-center">
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      className="input pr-12 transition-all duration-200 disabled:opacity-50"
      style={{ appearance: 'textfield' }}
      {...props}
    />
    {unit && (
      <span
        className="absolute right-3 text-[11px] font-medium pointer-events-none"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {unit}
      </span>
    )}
  </div>
);

const Toggle = ({ enabled, onChange, label, disabled }) => (
  <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${disabled ? 'opacity-50' : ''}`} style={{ background: 'var(--muted)' }}>
    <span className="text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className="transition-opacity hover:opacity-80 disabled:cursor-not-allowed"
      aria-label={enabled ? 'Desactivar' : 'Activar'}
    >
      {enabled
        ? <ToggleRight size={26} style={{ color: 'var(--primary)' }} />
        : <ToggleLeft size={26} style={{ color: 'var(--muted-foreground)' }} />
      }
    </button>
  </div>
);


export const PantallaConfiguracionGlobal = () => {
  const { settings, loadingSettings, fetchSettings, saveAllSettings, isSavingBulk } = useConfig();

  const [umbralDescuadre, setUmbralDescuadre] = useState(50);
  const [tiempoSesion, setTiempoSesion] = useState(30);
  const [intentosFallidos, setIntentosFallidos] = useState(3);

  const [prefijo, setPrefijo] = useState('UCB-');
  const [siguienteNumero, setSiguienteNumero] = useState(1001);

  const [emailAlertas, setEmailAlertas] = useState('admin@ucb.edu.bo');
  const [notifInventory, setNotifInventory] = useState(true);
  const [notifShifts, setNotifShifts] = useState(true);
  const [notifUsers, setNotifUsers] = useState(false);
  const [notifPos, setNotifPos] = useState(true);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings({ limit: 50 }); 
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && settings.length > 0) {
      settings.forEach((setting) => {
        const val = setting.value;
        const isTrue = val === 'true' || val === true;

        switch (setting.key) {
          case 'cash_discrepancy_threshold': setUmbralDescuadre(Number(val)); break;
          case 'session_timeout_minutes': setTiempoSesion(Number(val)); break;
          case 'max_login_attempts': setIntentosFallidos(Number(val)); break;
          case 'receipt_prefix': setPrefijo(String(val)); break;
          case 'next_receipt_number': setSiguienteNumero(Number(val)); break;
          case 'alerts_email': setEmailAlertas(String(val)); break;
          case 'notify_inventory': setNotifInventory(isTrue); break;
          case 'notify_shifts': setNotifShifts(isTrue); break;
          case 'notify_users': setNotifUsers(isTrue); break;
          case 'notify_pos': setNotifPos(isTrue); break;
          default: break;
        }
      });
    }
  }, [settings]);

 const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!emailAlertas || !prefijo) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    const payloadModificado = {};

    const checkAndAdd = (key, currentValue) => {
      const originalSetting = settings.find(s => s.key === key);
      const stringValue = String(currentValue);

      if (originalSetting && originalSetting.value !== stringValue) {
        payloadModificado[key] = stringValue;
      }
    };

    checkAndAdd('cash_discrepancy_threshold', umbralDescuadre);
    checkAndAdd('session_timeout_minutes', tiempoSesion);
    checkAndAdd('max_login_attempts', intentosFallidos);
    checkAndAdd('receipt_prefix', prefijo);
    checkAndAdd('next_receipt_number', siguienteNumero);
    checkAndAdd('alerts_email', emailAlertas);
    checkAndAdd('notify_inventory', notifInventory);
    checkAndAdd('notify_shifts', notifShifts);
    checkAndAdd('notify_users', notifUsers);
    checkAndAdd('notify_pos', notifPos);

    const keysToUpdate = Object.keys(payloadModificado);
    
    if (keysToUpdate.length === 0) {
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }

    console.log(`Enviando solo ${keysToUpdate.length} peticiones PATCH:`, payloadModificado);

    const success = await saveAllSettings(payloadModificado);

    if (success) {
      setSaved(true);
      fetchSettings({ limit: 50 });
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>
              Root · Sistema
            </p>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              Configuración Global
              {loadingSettings && <Loader2 size={18} className="animate-spin text-muted-foreground" />}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Parámetros operativos del sistema TPS Cafetería UCB
            </p>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            }}
          >
            <Settings size={11} />
            Superusuario
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">

          {/* ── Sección 1: Parámetros Operativos ── */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <SectionHeader
              icon={Shield}
              title="Parámetros Operativos"
              description="Límites y reglas de funcionamiento del sistema"
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Umbral de descuadre" hint="Diferencia máxima permitida en caja">
                <NumberInput
                  value={umbralDescuadre}
                  onChange={e => setUmbralDescuadre(e.target.value)}
                  min={0}
                  unit="Bs"
                  disabled={loadingSettings || isSavingBulk}
                />
              </Field>
              <Field label="Sesión inactiva" hint="Minutos antes del cierre automático">
                <NumberInput
                  value={tiempoSesion}
                  onChange={e => setTiempoSesion(e.target.value)}
                  min={5}
                  max={120}
                  unit="min"
                  disabled={loadingSettings || isSavingBulk}
                />
              </Field>
              <Field label="Intentos de login" hint="Antes de bloquear la cuenta">
                <NumberInput
                  value={intentosFallidos}
                  onChange={e => setIntentosFallidos(e.target.value)}
                  min={1}
                  max={10}
                  unit="int."
                  disabled={loadingSettings || isSavingBulk}
                />
              </Field>
            </div>
          </div>

          {/* ── Sección 2: Numeración ── */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <SectionHeader
              icon={Hash}
              title="Numeración de Comprobantes"
              description="Formato y secuencia de los comprobantes de venta"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Prefijo de comprobante" hint="Texto inicial del número de comprobante">
                <input
                  type="text"
                  className="input transition-all duration-200 disabled:opacity-50"
                  value={prefijo}
                  onChange={e => setPrefijo(e.target.value)}
                  placeholder="Ej: UCB-"
                  maxLength={10}
                  disabled={loadingSettings || isSavingBulk}
                />
              </Field>
              <Field label="Siguiente número" hint="Número con el que continúa la secuencia">
                <NumberInput
                  value={siguienteNumero}
                  onChange={e => setSiguienteNumero(e.target.value)}
                  min={1}
                  disabled={loadingSettings || isSavingBulk}
                />
              </Field>
            </div>

            {/* Preview del comprobante */}
            <div
              className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                Vista previa
              </span>
              <ChevronRight size={12} style={{ color: 'var(--muted-foreground)' }} />
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                {prefijo}{String(siguienteNumero).padStart(4, '0')}
              </span>
            </div>
          </div>

          {/* ── Sección 3: Notificaciones ── */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <SectionHeader
              icon={Bell}
              title="Notificaciones y Alertas"
              description="Configura qué eventos generan alertas por email"
            />

            <Field label="Email para alertas críticas" hint="Recibirá notificaciones de eventos importantes">
              <input
                type="email"
                className="input transition-all duration-200 disabled:opacity-50"
                value={emailAlertas}
                onChange={e => setEmailAlertas(e.target.value)}
                placeholder="admin@ucb.edu.bo"
                disabled={loadingSettings || isSavingBulk}
              />
            </Field>

            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Módulos con notificación activa
              </p>
              <Toggle disabled={loadingSettings || isSavingBulk} enabled={notifInventory} onChange={setNotifInventory} label="Stock bajo en productos" />
              <Toggle disabled={loadingSettings || isSavingBulk} enabled={notifShifts} onChange={setNotifShifts} label="Descuadres de caja" />
              <Toggle disabled={loadingSettings || isSavingBulk} enabled={notifUsers} onChange={setNotifUsers} label="Intentos de login fallidos" />
              <Toggle disabled={loadingSettings || isSavingBulk} enabled={notifPos} onChange={setNotifPos} label="Eventos del punto de venta" />
            </div>
          </div>

          {/* ── Feedback y botón guardar ── */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in"
              style={{
                background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
                color: 'var(--destructive)',
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {saved && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in"
              style={{
                background: 'color-mix(in srgb, #3a7d44 10%, transparent)',
                border: '1px solid color-mix(in srgb, #3a7d44 30%, transparent)',
                color: '#3a7d44',
              }}
            >
              <CheckCircle2 size={14} />
              Configuración guardada correctamente
            </div>
          )}

          {/* Barra inferior de acciones */}
     {/* Barra inferior de acciones */}
          <div
            className="flex items-center justify-between px-5 py-4 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              Los cambios se aplican de inmediato al sistema
            </p>
            <button
              type="submit"
              disabled={loadingSettings || isSavingBulk}
              className="button button-default button-md group flex items-center gap-2"
              style={{ opacity: (loadingSettings || isSavingBulk) ? 0.7 : 1, cursor: (loadingSettings || isSavingBulk) ? 'not-allowed' : 'pointer' }}
            >
              {/* Aislar la lógica del ícono */}
              {(isSavingBulk || loadingSettings) ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              
              {/* LA SOLUCIÓN: Envolver el texto en un span para estabilizar el DOM */}
              <span>
                {isSavingBulk ? 'Guardando...' : 'Guardar cambios'}
              </span>
            </button>
          </div>

        </form>

        <p className="text-center text-[10px] mt-6 opacity-35" style={{ color: 'var(--muted-foreground)' }}>
          Café UCB · Universidad Católica Boliviana · Semestre 1-2026
        </p>
      </div>
    </div>
  );
};