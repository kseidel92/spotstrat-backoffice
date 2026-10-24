import { useState } from 'react';
import { useUsersQuery } from '../store';
import { Err, Loading, StatusBadge, Table, when } from '../components';

export default function Users() {
  const [q, setQ] = useState('');
  const { data, isLoading, error, refetch, isFetching } = useUsersQuery({ q });
  const columns = [
    { key: 'created_at', label: 'Criado', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'email', label: 'E-mail', render: (r) => <span className="mono">{r.email}</span> },
    { key: 'name', label: 'Nome', render: (r) => r.name || '—' },
    { key: 'plan_status', label: 'Plano', render: (r) => <StatusBadge status={r.plan_tier || r.plan_status} /> },
    { key: 'prompt_count', label: 'Prompts', render: (r) => r.prompt_count },
    { key: 'trial_ends_at', label: 'Trial até', render: (r) => <span className="mono">{when(r.trial_ends_at)}</span> },
    { key: 'locale', label: 'Locale', render: (r) => r.locale },
  ];
  return (
    <section>
      <h1 className="page-title">Usuários</h1>
      <p className="page-lead">Contas, plano e uso de prompts.</p>
      <div className="toolbar">
        <input placeholder="Buscar e-mail, nome, telefone…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" onClick={() => refetch()} disabled={isFetching}>Atualizar</button>
      </div>
      {isLoading ? <Loading /> : null}
      {error ? <Err error={error} /> : null}
      {!isLoading && !error ? <Table columns={columns} rows={data?.users || []} /> : null}
    </section>
  );
}
