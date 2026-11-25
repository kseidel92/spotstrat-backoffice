import { useEffect, useState } from 'react';

export function StatusBadge({ status, httpStatus }) {
  const s = String(status || '');
  let tone = 'muted';
  if (['created', 'updated', 'done', 'alarm', 'paid', 'sent', 'active'].includes(s)) tone = 'ok';
  if (['failed', 'rejected', 'expired'].includes(s) || (httpStatus && httpStatus >= 400)) tone = 'bad';
  if (['needs_user', 'queued', 'running', 'open', 'pending'].includes(s)) tone = 'warn';
  return <span className={`badge ${tone}`}>{s || '—'}{httpStatus != null ? ` · ${httpStatus}` : ''}</span>;
}

export function when(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return String(value);
  }
}

export function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Loading({ label = 'Carregando…' }) {
  return <p className="empty">{label}</p>;
}

export function Err({ error }) {
  const msg = error?.data?.message || error?.error || error?.status || 'Falha ao carregar';
  return <p className="error" role="alert">{String(msg)}</p>;
}

export function Table({ columns, rows, empty = 'Nada por aqui.' }) {
  if (!rows?.length) return <p className="empty">{empty}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.key}>
              {columns.map((c) => (
                <td key={c.key} className={c.className || ''}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Paginação server-side: page 1-based + total/pages da API. */
export function Pager({ page, pages, total, limit, onPage, disabled }) {
  const safePages = Math.max(1, Number(pages) || 1);
  const safePage = Math.min(safePages, Math.max(1, Number(page) || 1));
  const safeLimit = Math.max(1, Number(limit) || 50);
  const safeTotal = Math.max(0, Number(total) || 0);
  const from = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const to = Math.min(safePage * safeLimit, safeTotal);

  const jump = (next) => {
    if (disabled) return;
    const p = Math.min(safePages, Math.max(1, next));
    if (p !== safePage) onPage?.(p);
  };

  return (
    <div className="pager" role="navigation" aria-label="Paginação">
      <span className="pager-meta">
        {safeTotal === 0 ? '0 resultados' : `${from}–${to} de ${safeTotal.toLocaleString('pt-BR')}`}
        {' · '}
        pág. {safePage}/{safePages}
      </span>
      <div className="pager-actions">
        <button type="button" disabled={disabled || safePage <= 1} onClick={() => jump(1)} title="Primeira">«</button>
        <button type="button" disabled={disabled || safePage <= 1} onClick={() => jump(safePage - 1)}>Anterior</button>
        <button type="button" disabled={disabled || safePage >= safePages} onClick={() => jump(safePage + 1)}>Próxima</button>
        <button type="button" disabled={disabled || safePage >= safePages} onClick={() => jump(safePages)} title="Última">»</button>
      </div>
    </div>
  );
}

export function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
