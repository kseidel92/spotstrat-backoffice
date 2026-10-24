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
