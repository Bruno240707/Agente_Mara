import React from 'react';

function formatearMensajeComoLista(texto) {
  const partes = texto.split(/-\s+/).map(s => s.trim()).filter(Boolean);

  if (partes.length > 2 && partes.join(' - ') !== texto.replace(/\n/g, '')) {
    return (
      <ul>
        {partes.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }

  return texto.split('\n').map((line, i) => <span key={i}>{line}<br /></span>);
}

export default function Chat({ mensajes = [], loading }) {
  return (
    <div className="chat-mensajes">
      {mensajes.map((msg, idx) => {
        const rol = msg.rol === 'user' ? 'usuario' : 'asistente';
        let contenido = formatearMensajeComoLista(msg.texto);

        return (
          <div key={idx} className={`mensaje ${rol}`}>
            <div className="burbuja">{contenido}</div>
          </div>
        );
      })}
      {loading && (
        <div className="mensaje asistente">
          <div className="burbuja">
            
          </div>
        </div>
      )}
    </div>
  );
}