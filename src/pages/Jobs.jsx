import { useState } from 'react';
import { useJobsQuery } from '../store';
import { Err, Loading, StatusBadge, Table, when } from '../components';

export default function Jobs() {
  const [status, setStatus] = useState('failed');
  const { data, isLoading, error, refetch, isFetching } = useJobsQuery({ status });
  const columns = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'user_email', label: 'Usuário', render: (r) => <span className="mono">{r.user_email}</span> },
    { key: 'kind', label: 'Kind', render: (r) => <span className="mono">{r.kind}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'prompt_preview', label: 'Prompt', className: 'clip', render: (r) => <span className="clip">{r.prompt_preview || '—'}</span> },
    { key: 'error', label: 'Erro', className: 'wrap-text', render: (r) => <div className="wrap-text">{r.error || '—'}</div> },
  ];
  return (
    <section>
      <h1 className="page-title">Jobs</h1>
      <p className="page-lead">Fila interna — falhas do worker e LLM.</p>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="failed">failed</option>
          <option value="queued">queued</option>
          <option value="running">running</option>
          <option value="done">done</option>
          <option value="needs_user">needs_user</option>
        </select>
        <button type="button" onClick={() => refetch()} disabled={isFetching}>Atualizar</button>
      </div>
      {isLoading ? <Loading /> : null}
      {error ? <Err error={error} /> : null}
      {!isLoading && !error ? <Table columns={columns} rows={data?.jobs || []} /> : null}
    </section>
  );
}
