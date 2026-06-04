"use client";

import { useEffect, useState } from "react";
import { guardarSuscripcion } from "@/app/actions/push";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Estado = "cargando" | "no-soportado" | "activo" | "inactivo" | "denegado";

export function PushToggle() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID) {
      setEstado("no-soportado");
      return;
    }
    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? "activo" : "inactivo"))
      .catch(() => setEstado("inactivo"));
  }, []);

  async function activar() {
    try {
      // requestPermission debe llamarse desde el gesto del usuario (iOS).
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setEstado(perm === "denied" ? "denegado" : "inactivo");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      });
      const res = await guardarSuscripcion(JSON.parse(JSON.stringify(sub)));
      if (res.ok) {
        setEstado("activo");
        setMsg("¡Listo! Recibirás avisos en este dispositivo.");
      } else {
        setMsg(res.error ?? "No se pudo activar.");
      }
    } catch {
      setMsg("No se pudo activar. Instala la app (Agregar a inicio) e inténtalo de nuevo.");
    }
  }

  if (estado === "cargando") return null;
  if (estado === "no-soportado") return null;

  if (estado === "activo") {
    return (
      <p className="text-sm text-emerald-600">🔔 Notificaciones activadas en este dispositivo.</p>
    );
  }
  if (estado === "denegado") {
    return (
      <p className="text-sm text-slate-500">
        Las notificaciones están bloqueadas en tu navegador. Actívalas desde la configuración del
        sitio.
      </p>
    );
  }
  return (
    <div>
      <button className="btn-ghost" onClick={activar}>
        🔔 Activar notificaciones
      </button>
      {msg && <p className="mt-2 text-sm text-slate-500">{msg}</p>}
    </div>
  );
}
