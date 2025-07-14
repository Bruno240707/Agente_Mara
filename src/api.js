export async function enviarMensajeAlBackend(mensaje) {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mensaje }),
  });

  if (!res.ok) {
    throw new Error("Error al conectar con el backend: " + res.statusText);
  }

  return res.json();
}
