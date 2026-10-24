import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePromptQuery, usePromptsQuery } from '../store';
import { Err, Loading, StatusBadge, Table, when } from '../components';

export function PromptDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = usePromptQuery(id);
  if (isLoading) return <Loading />;
  if (error) return <Err error={error} />;
  const p = data?.prompt;
  if (!p) return <p className="empty">Prompt não encontrado.</p>;
  return (
    <section>
      <p><Link to="/prompts">← Prompts</Link></p>
      <h1 className="page-title">Prompt</h1>
      <p className="page-lead">{p.user_email} · {when(p.created_at)}</p>
      <div className="toolbar">
        <StatusBadge status={p.status} httpStatus={p.http_status} />
        {p.error_stage ? <span className="badge warn">{p.error_stage}</span> : null}
        {p.provider ? <span className="badge muted">{p.provider}</span> : null}
        {p.duration_ms != null ? <span className="badge muted">{p.duration_ms} ms</span> : null}
      </div>
      <div className="detail">
        <div className="card">
          <div className="label">Pedido do usuário</div>
          <pre>{p.prompt}</pre>
        </div>
        {p.detail ? (
          <div className="card">
            <div className="label">Detalhe / resposta ao usuário</div>
            <pre>{p.detail}</pre>
          </div>
        ) : null}
        {p.error_raw ? (
          <div className="card">
            <div className="label">Erro bruto (stack / causa)</div>
            <pre>{p.error_raw}</pre>
          </div>
        ) : null}
        {p.job_error ? (
          <div className="card">
            <div className="label">Job error</div>
            <pre>{p.job_error}</pre>
          </div>
        ) : null}
        {p.job_output ? (
          <div className="card">
            <div className="label">Job output</div>
            <pre>{JSON.stringify(p.job_output, null, 2)}</pre>
          </div>
        ) : null}
        {p.job_input ? (
          <div className="card">
            <div className="label">Job input</div>
            <pre>{JSON.stringify(p.job_input, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function Prompts() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [bad, setBad] = useState(false);
  const query = useMemo(() => ({ q, status, bad, limit: 80 }), [q, status, bad]);
  const { data, isLoading, error, refetch, isFetching } = usePromptsQuery(query, { pollingInterval: 10000 });

  const columns = [
    {
      key: 'created_at',
      label: 'Quando',
      render: (r) => <span className="mono">{when(r.created_at)}</span>,
    },
    {
      key: 'user_email',
      label: 'Usuário',
      render: (r) => <span className="mono">{r.user_email}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} httpStatus={r.http_status} />,
    },
    {
      key: 'mode',
      label: 'Modo',
      render: (r) => <span className="mono">{r.mode}{r.error_stage ? ` · ${r.error_stage}` : ''}</span>,
    },
    {
      key: 'prompt',
      label: 'Prompt',
      className: 'clip',
      render: (r) => <Link to={`/prompts/${r.id}`} className="clip" title={r.prompt}>{r.prompt}</Link>,
    },
    {
      key: 'detail',
      label: 'Erro / detalhe',
      className: 'clip',
      render: (r) => <span className="clip" title={r.error_raw || r.detail || r.job_error || ''}>{r.error_raw || r.detail || r.job_error || '—'}</span>,
    },
  ];

  return (
    <section>
      <h1 className="page-title">Prompts</h1>
      <p className="page-lead">Todos os pedidos · HTTP de aceite · falhas de LLM/worker/resposta.</p>
      <div className="toolbar">
        <input
          placeholder="Buscar e-mail, texto, erro…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setBad(false); }}>
          <option value="">Todos os status</option>
          <option value="queued">queued</option>
          <option value="running">running</option>
          <option value="created">created</option>
          <option value="updated">updated</option>
          <option value="needs_user">needs_user</option>
          <option value="failed">failed</option>
          <option value="rejected">rejected</option>
          <option value="alarm">alarm</option>
          <option value="done">done</option>
        </select>
        <button type="button" className={bad ? 'on' : ''} onClick={() => { setBad((v) => !v); setStatus(''); }}>
          Só problemas
        </button>
        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? '…' : 'Atualizar'}
        </button>
        <span className="badge muted">{data?.total ?? 0} total</span>
      </div>
      {isLoading ? <Loading /> : null}
      {error ? <Err error={error} /> : null}
      {!isLoading && !error ? <Table columns={columns} rows={data?.prompts || []} /> : null}
    </section>
  );
}
