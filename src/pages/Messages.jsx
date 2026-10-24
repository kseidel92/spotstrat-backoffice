import { useState } from 'react';
import { useHelpQuery, useMessagesQuery, useOutboundQuery } from '../store';
import { Err, Loading, StatusBadge, Table, when } from '../components';

export default function Messages() {
  const [kind, setKind] = useState('');
  const outbound = useOutboundQuery({ kind });
  const help = useHelpQuery({});
  const chat = useMessagesQuery();
  const loading = outbound.isLoading || help.isLoading || chat.isLoading;
  const error = outbound.error || help.error || chat.error;

  const outCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'kind', label: 'Tipo', render: (r) => <span className="mono">{r.kind}</span> },
    { key: 'to_addr', label: 'Para', render: (r) => <span className="mono">{r.to_addr || '—'}</span> },
    { key: 'subject', label: 'Assunto', className: 'clip', render: (r) => <span className="clip">{r.subject || '—'}</span> },
    {
      key: 'sent',
      label: 'Envio',
      render: (r) => <StatusBadge status={r.sent ? 'sent' : 'failed'} />,
    },
    {
      key: 'error',
      label: 'Erro',
      className: 'clip',
      render: (r) => <span className="clip">{r.error || r.provider_id || '—'}</span>,
    },
  ];
  const helpCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'user_email', label: 'Usuário', render: (r) => <span className="mono">{r.user_email}</span> },
    { key: 'strategy_name', label: 'Estratégia', render: (r) => r.strategy_name || '—' },
    { key: 'message', label: 'Mensagem', className: 'wrap-text', render: (r) => <div className="wrap-text">{r.message}</div> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const chatCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'user_email', label: 'Usuário', render: (r) => <span className="mono">{r.user_email}</span> },
    { key: 'role', label: 'Role', render: (r) => <span className="mono">{r.role}</span> },
    { key: 'content', label: 'Conteúdo', className: 'wrap-text', render: (r) => <div className="wrap-text">{r.content}</div> },
  ];

  return (
    <section>
      <h1 className="page-title">Mensagens</h1>
      <p className="page-lead">E-mails do sistema, pedidos de ajuda e conversas recentes.</p>
      {loading ? <Loading /> : null}
      {error ? <Err error={error} /> : null}
      {!loading && !error ? (
        <>
          <div className="toolbar">
            <h2 style={{ margin: 0, flex: 1 }}>Outbound (e-mail)</h2>
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">Todos</option>
              <option value="verify">verify</option>
              <option value="reset">reset</option>
              <option value="alarm">alarm</option>
              <option value="owner_notify">owner_notify</option>
            </select>
          </div>
          <Table columns={outCols} rows={outbound.data?.messages || []} />
          <h2 style={{ marginTop: 28 }}>Ajuda das estratégias</h2>
          <Table columns={helpCols} rows={help.data?.reports || []} />
          <h2 style={{ marginTop: 28 }}>Chat recente</h2>
          <Table columns={chatCols} rows={chat.data?.messages || []} />
        </>
      ) : null}
    </section>
  );
}
