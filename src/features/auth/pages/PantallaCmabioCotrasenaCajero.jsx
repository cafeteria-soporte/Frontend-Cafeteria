/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import { ArrowRight, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useChangePassword } from '../hooks/useCambioContraseña'; 

const PasswordField = ({ label, value, onChange, placeholder, focused, onFocus, onBlur, fieldKey,icon: Icon }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--muted-foreground)" }}>
        {label}
      </label>
      <div className="relative">
        <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: focused === fieldKey ? "var(--primary)" : "var(--muted-foreground)", transition: "color 0.2s" }} />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required
          className="input pr-10 transition-all duration-200"
          style={{
            paddingLeft: "40px", 
            borderColor: focused === fieldKey ? "var(--primary)" : "var(--border)",
            boxShadow: focused === fieldKey ? "0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)" : "none",
          }}
        />
        <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted-foreground)" }}>
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  );
};

export const PantallaCambioContraseñaCajero = () => {
  const {
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, loading,
    handleUpdate
  } = useChangePassword();

  const [focusedField, setFocusedField] = useState(null);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.05]"
          style={{ background: "var(--primary)" }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: "var(--navbar)" }} />
      </div>

      <div className="relative w-full max-w-[400px] animate-slide-up">

        {/* ── Header ── */}
        <div className="rounded-t-2xl overflow-hidden" style={{ background: "var(--navbar)" }}>
          <div className="h-[3px] w-full" style={{
            background: "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 50%, transparent))",
          }} />
          <div className="px-7 py-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in srgb, var(--primary) 22%, transparent)" }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="14" width="20" height="14" rx="3" fill="var(--primary-foreground)" opacity="0.15"/>
                <path d="M6 18h20v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-6z" fill="var(--primary-foreground)" opacity="0.9"/>
                <path d="M11 14v-3a5 5 0 0 1 10 0v3" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                <circle cx="16" cy="22" r="2" fill="var(--navbar)" opacity="0.6"/>
                <rect x="15.25" y="22" width="1.5" height="3" rx="0.75" fill="var(--navbar)" opacity="0.5"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold tracking-tight leading-none"
                style={{ color: "var(--navbar-foreground)" }}>
                Cambiar contraseña
              </p>
              <p className="text-[11px] mt-0.5"
                style={{ color: "var(--navbar-foreground)", opacity: 0.45 }}>
                Café UCB · Seguridad de cuenta
              </p>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="rounded-b-2xl px-7 py-8 border border-t-0"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>

          <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
            Ingresa tu clave actual y define una nueva por seguridad.
          </p>

          <form onSubmit={handleUpdate} className="space-y-4">
            <PasswordField
              label="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Tu clave actual"
              focused={focusedField}
              onFocus={() => setFocusedField("current")}
              onBlur={() => setFocusedField(null)}
              fieldKey="current"
              icon={KeyRound}
            />
            <PasswordField
              label="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              focused={focusedField}
              onFocus={() => setFocusedField("new")}
              onBlur={() => setFocusedField(null)}
              fieldKey="new"
              icon={Lock}
            />
            <PasswordField
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva clave"
              focused={focusedField}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              fieldKey="confirm"
              icon={Lock}
            />

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in"
                style={{
                  background: "color-mix(in srgb, var(--destructive) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)",
                  color: "var(--destructive)",
                }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="button button-default button-lg w-full mt-2 group"
              style={{ height: "44px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Actualizando..." : "Actualizar y entrar"}
              <ArrowRight size={15} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] mt-4 opacity-40" style={{ color: "var(--muted-foreground)" }}>
          Universidad Católica Boliviana · 2026
        </p>
      </div>
    </div>
  );
};