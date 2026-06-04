export const runtime = "edge";

/** Verificación de red real para el detector offline. Responde 204 sin cuerpo. */
export async function HEAD() {
  return new Response(null, { status: 204 });
}

export async function GET() {
  return new Response(null, { status: 204 });
}
