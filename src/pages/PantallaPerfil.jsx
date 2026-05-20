import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Save, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useProfile } from '../features/auth/hooks/useProfile';

const PasswordField = ({ label, value, onChange, placeholder, focused, onFocus, onBlur, fieldKey }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--muted-foreground)" }}>
        {label}
      </label>
      <div className="relative">
        <KeyRound size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: focused === fieldKey ? "var(--primary)" : "var(--muted-foreground)", transition: "color 0.2s" }} />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="input pr-10 transition-all duration-200"
          style={{
            paddingLeft: "40px", /* Forzamos el padding para evitar superposición con el ícono */
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

export const PantallaPerfil = () => {
  const {
    userData,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading, error, success,
    handleUpdatePassword
  } = useProfile();

  const [focusedField, setFocusedField] = useState(null);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Hero de perfil ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Barra de color */}
          <div className="h-16"/>
          {/* Contenido */}
          <div className="px-7 pb-6" style={{ background: "var(--card)" }}>
            {/* Avatar superpuesto */}
            <div className="-mt-8 mb-4 flex items-end justify-between">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--primary)",
                  border: "3px solid var(--card)",
                  boxShadow: "0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)",
                }}>
                <User size={28} style={{ color: "var(--primary-foreground)" }} />
              </div>
              {/* Badge de rol */}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                  border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
                }}>
                {userData.rol}
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
              {userData.nombre}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {userData.email}
            </p>

            {/* Info rápida */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <Mail size={14} style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "var(--muted-foreground)" }}>Correo</p>
                  <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <Shield size={14} style={{ color: "var(--primary)" }} />
                <div>
                  <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "var(--muted-foreground)" }}>Estado</p>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Cuenta activa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Seguridad ── */}
        <div className="rounded-2xl p-7" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
              <Lock size={14} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Seguridad</h2>
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Actualiza tu contraseña de acceso</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <PasswordField
              label="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Tu clave actual"
              focused={focusedField}
              onFocus={() => setFocusedField("current")}
              onBlur={() => setFocusedField(null)}
              fieldKey="current"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <PasswordField
                label="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                focused={focusedField}
                onFocus={() => setFocusedField("new")}
                onBlur={() => setFocusedField(null)}
                fieldKey="new"
              />
              <PasswordField
                label="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva clave"
                focused={focusedField}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
                fieldKey="confirm"
              />
            </div>

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

            {success && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in"
                style={{
                  background: "color-mix(in srgb, #3a7d44 10%, transparent)",
                  border: "1px solid color-mix(in srgb, #3a7d44 30%, transparent)",
                  color: "#3a7d44",
                }}>
                <CheckCircle2 size={14} />
                {success}
              </div>
            )}

            <div className="pt-1">
              <button type="submit" disabled={loading}
                className="button button-default button-md group flex items-center gap-2"
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                <Save size={14} />
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};