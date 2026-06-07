import React from 'react';
import logoProforma from '../../../../assets/logoProforma.png';

const formatUSD = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);

export const ProformaPDF = ({ proforma, onClose }) => {
  const subTotal = proforma.items.reduce((s, i) => s + (i.cantidad || 0) * (i.precioUnitario || 0), 0);
  const ivaVal = subTotal * (proforma.iva ?? 0.12);
  const total = subTotal + ivaVal;

  /* ── Número de filas mínimas en la tabla (para que se vea como el template) ── */
  const MIN_ROWS = 6;
  const paddedItems = [
    ...proforma.items,
    ...Array(Math.max(0, MIN_ROWS - proforma.items.length)).fill({ descripcion: '', cantidad: '', precioUnitario: '' }),
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#f1f5f9', overflowY: 'auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .lx-pdf * { font-family: 'Inter', Arial, sans-serif; box-sizing: border-box; }

        /* Barra de acciones (no imprime) */
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 0.8cm; size: A4; }
          .lx-doc { box-shadow: none !important; border-radius: 0 !important; }
        }

        /* ── Olas del encabezado ── */
        .lx-wave-container {
          position: relative;
          height: 90px;
          background: white;
          overflow: hidden;
        }

        /* Ola teal (izquierda) */
        .lx-wave-teal {
          position: absolute;
          top: 0; right: 0;
          width: 65%;
          height: 100%;
          background: linear-gradient(135deg, #2ab5a0 0%, #1d9e8c 40%, #17877a 100%);
          clip-path: ellipse(100% 120% at 100% 50%);
        }

        /* Ola dorada (encima, más pequeña) */
        .lx-wave-gold {
          position: absolute;
          top: 0; right: 0;
          width: 52%;
          height: 100%;
          background: linear-gradient(135deg, #e8b84b 0%, #d4a017 50%, #c49010 100%);
          clip-path: ellipse(90% 110% at 100% 50%);
        }

        /* ── Tabla ── */
        .lx-table { width: 100%; border-collapse: collapse; }
        .lx-table th {
          background: #2ab5a0;
          color: white;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 9px 10px;
          border: 1px solid #1d9e8c;
        }
        .lx-table td {
          font-size: 11.5px;
          color: #1e293b;
          padding: 7px 10px;
          border: 1px solid #d1d5db;
          height: 28px;
        }
        .lx-table tr:nth-child(even) td { background: #f8fafb; }
        .lx-table tr:nth-child(odd) td { background: #ffffff; }

        /* ── Footer dorado ── */
        .lx-footer {
          background: linear-gradient(135deg, #e8b84b 0%, #d4a017 100%);
          padding: 14px 20px;
          margin-top: 0;
        }
        .lx-footer-title {
          font-size: 12px;
          font-weight: 800;
          color: #7c3f00;
          text-decoration: underline;
          margin-bottom: 8px;
        }
        .lx-footer p {
          font-size: 10.5px;
          color: #4a2000;
          margin: 4px 0;
          font-weight: 500;
          line-height: 1.5;
        }
      `}</style>

      {/* ── Barra superior de acciones ── */}
      <div className="no-print" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 28px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.7)',
        position: 'sticky', top: 0, zIndex: 10,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#1e293b',
          }}>Vista previa — Proforma {proforma.id}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0',
            background: 'white', fontSize: 13, fontWeight: 600, color: '#475569',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            Cerrar
          </button>
          <button onClick={() => window.print()} style={{
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            fontSize: 13, fontWeight: 700, color: 'white',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* ── Documento ── */}
      <div style={{ maxWidth: 680, margin: '28px auto 40px', padding: '0 16px' }}>
        <div className="lx-pdf lx-doc" style={{
          background: 'white',
          borderRadius: 6,
          boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}>

          {/* ══════════════════════════
              ENCABEZADO — SOLO LOGO
          ══════════════════════════ */}
          <div style={{ borderBottom: '1px solid #e9ecef' }}>
            <img
              src={logoProforma}
              alt="LUXES Diseño y Publicidad"
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            />
          </div>



          {/* ══════════════════════════
              DATOS DEL CLIENTE
          ══════════════════════════ */}
          <div style={{
            padding: '10px 18px',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '4px 24px',
            borderBottom: '1px solid #e9ecef',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', minWidth: 70 }}>CLIENTE:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{proforma.cliente?.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', minWidth: 48 }}>FECHA:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{proforma.fecha}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', minWidth: 70 }}>TELÉFONO:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{proforma.telefono}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', minWidth: 48 }}>VENCE:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{proforma.vencimiento || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, gridColumn: '1 / -1' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', minWidth: 70 }}>EMAIL:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{proforma.email}</span>
            </div>
          </div>

          {/* ══════════════════════════
              TÍTULO PROFORMA
          ══════════════════════════ */}
          <div style={{
            textAlign: 'center',
            padding: '12px 18px 10px',
            borderBottom: '1px solid #e9ecef',
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 900, color: '#0f172a',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              margin: 0,
            }}>PROFORMA</h2>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>N° {proforma.id}</span>
          </div>

          {/* ══════════════════════════
              TABLA DE ÍTEMS
          ══════════════════════════ */}
          <div style={{ padding: '0 18px 0' }}>
            <table className="lx-table">
              <thead>
                <tr>
                  <th style={{ width: 70, textAlign: 'center' }}>CANTIDAD</th>
                  <th style={{ textAlign: 'left', paddingLeft: 14 }}>DESCRIPCIÓN</th>
                  <th style={{ width: 90, textAlign: 'right' }}>SUBTOTAL</th>
                  <th style={{ width: 90, textAlign: 'right' }}>TOTAL + IVA</th>
                </tr>
              </thead>
              <tbody>
                {paddedItems.map((item, i) => {
                  const sub = (item.cantidad || 0) * (item.precioUnitario || 0);
                  const withIva = sub + sub * (proforma.iva ?? 0.12);
                  return (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', fontWeight: item.descripcion ? 600 : 400 }}>
                        {item.cantidad || ''}
                      </td>
                      <td style={{ paddingLeft: 14 }}>{item.descripcion || ''}</td>
                      <td style={{ textAlign: 'right' }}>
                        {item.descripcion ? formatUSD(sub) : ''}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.descripcion ? formatUSD(withIva) : ''}
                      </td>
                    </tr>
                  );
                })}

                {/* Fila de totales */}
                <tr>
                  <td colSpan={2} style={{ border: 'none', background: 'transparent' }} />
                  <td style={{
                    fontSize: 10, fontWeight: 800, color: '#e8b84b',
                    textAlign: 'right', borderTop: '2px solid #2ab5a0',
                    background: '#f8fafb',
                  }}>
                    TOTAL SIN IVA
                  </td>
                  <td style={{
                    textAlign: 'right', fontWeight: 700,
                    borderTop: '2px solid #2ab5a0',
                    background: '#f8fafb',
                  }}>
                    {formatUSD(subTotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: 'none', background: 'transparent' }} />
                  <td style={{
                    fontSize: 10, fontWeight: 800, color: '#2ab5a0',
                    textAlign: 'right', background: '#f8fafb',
                  }}>
                    IVA ({((proforma.iva ?? 0.12) * 100).toFixed(0)}%)
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, background: '#f8fafb' }}>
                    {formatUSD(ivaVal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: 'none', background: 'transparent' }} />
                  <td style={{
                    fontSize: 11, fontWeight: 900, color: '#0f172a',
                    textAlign: 'right', background: '#eaf7f5',
                    borderTop: '2px solid #2ab5a0',
                  }}>
                    TOTAL
                  </td>
                  <td style={{
                    textAlign: 'right', fontWeight: 900, fontSize: 13,
                    background: '#eaf7f5', color: '#0f172a',
                    borderTop: '2px solid #2ab5a0',
                  }}>
                    {formatUSD(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notas libres si las hay */}
          {proforma.notas && (
            <div style={{ padding: '10px 18px 4px' }}>
              <p style={{ fontSize: 10.5, color: '#475569', fontStyle: 'italic', margin: 0 }}>
                <strong>Nota:</strong> {proforma.notas}
              </p>
            </div>
          )}

          {/* ══════════════════════════
              FOOTER DORADO — CONDICIONES
          ══════════════════════════ */}
          <div className="lx-footer" style={{ marginTop: 16 }}>
            <div className="lx-footer-title">CONDICIONES Y FORMAS DE PAGO</div>
            <p>60% de anticipo y 40% contra entrega, efectivo o transferencias bancarias</p>
            <p>Entrega en 15 días hábiles después de la confirmación de diseño</p>
            <p>Esta cotización es válida por 3 días después de su fecha de emisión</p>
            <p>Nuestros productos cuentan con garantía mínimo de 12 meses, no cubre daños por mal uso o instalación incorrecta</p>
          </div>

          {/* Firma */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 24, padding: '20px 40px 24px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #94a3b8', marginBottom: 6, paddingTop: 36 }} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Firma Autorizada — LUXES
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1.5px solid #94a3b8', marginBottom: 6, paddingTop: 36 }} />
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Firma Cliente — {proforma.cliente}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
