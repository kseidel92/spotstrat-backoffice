import {
  useCancellationsQuery,
  useProductionOrdersQuery,
  usePurchasesQuery,
  useStripeCheckoutsQuery,
  useStripeEventsQuery,
} from '../store';
import { Err, Loading, StatusBadge, Table, money, when } from '../components';

function cents(amount, currency) {
  if (amount == null) return '—';
  const cur = String(currency || 'brl').toUpperCase();
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(Number(amount) / 100);
  } catch {
    return `${(Number(amount) / 100).toFixed(2)} ${cur}`;
  }
}

export default function Payments() {
  const purchases = usePurchasesQuery();
  const production = useProductionOrdersQuery();
  const cancels = useCancellationsQuery();
  const checkouts = useStripeCheckoutsQuery();
  const events = useStripeEventsQuery();
  const loading = purchases.isLoading || production.isLoading || cancels.isLoading
    || checkouts.isLoading || events.isLoading;
  const error = purchases.error || production.error || cancels.error
    || checkouts.error || events.error;

  const purchaseCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'email', label: 'Usuário', render: (r) => <span className="mono">{r.email}</span> },
    { key: 'tier', label: 'Tier', render: (r) => `${r.tier} · ${r.months}m` },
    { key: 'provider', label: 'Provider', render: (r) => r.provider || '—' },
    { key: 'amount_brl', label: 'Valor', render: (r) => `${money(r.amount_brl)} ${r.currency || 'BRL'}` },
    { key: 'stripe_session_id', label: 'Session', render: (r) => <span className="mono">{r.stripe_session_id || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const checkoutCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'email', label: 'Usuário', render: (r) => <span className="mono">{r.email || '—'}</span> },
    { key: 'kind', label: 'Tipo', render: (r) => r.kind },
    { key: 'amount_total', label: 'Valor', render: (r) => cents(r.amount_total, r.currency) },
    { key: 'payment_status', label: 'Pagamento', render: (r) => <StatusBadge status={r.payment_status || r.status || '—'} /> },
    { key: 'fulfilled_at', label: 'Fulfill', render: (r) => (r.fulfilled_at ? <span className="mono">{when(r.fulfilled_at)}</span> : '—') },
    { key: 'id', label: 'Session', render: (r) => <span className="mono">{r.id}</span> },
  ];
  const eventCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'type', label: 'Evento', render: (r) => <span className="mono">{r.type}</span> },
    { key: 'object_id', label: 'Objeto', render: (r) => <span className="mono">{r.object_id || '—'}</span> },
    { key: 'processed_at', label: 'Processado', render: (r) => (r.processed_at ? <span className="mono">{when(r.processed_at)}</span> : '—') },
    { key: 'process_error', label: 'Erro', render: (r) => (r.process_error ? <span className="err">{r.process_error}</span> : 'ok') },
  ];
  const prodCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'user_email', label: 'Usuário', render: (r) => <span className="mono">{r.user_email}</span> },
    { key: 'strategy_name', label: 'Estratégia', render: (r) => r.strategy_name },
    { key: 'amount_brl', label: 'Valor', render: (r) => money(r.amount_brl) },
    { key: 'stripe_session_id', label: 'Session', render: (r) => <span className="mono">{r.stripe_session_id || '—'}</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const cancelCols = [
    { key: 'requested_at', label: 'Quando', render: (r) => <span className="mono">{when(r.requested_at)}</span> },
    { key: 'email', label: 'Usuário', render: (r) => <span className="mono">{r.email}</span> },
    { key: 'plan_tier', label: 'Plano', render: (r) => r.plan_tier || '—' },
    { key: 'refund_brl', label: 'Reembolso', render: (r) => money(r.refund_brl) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <section>
      <h1 className="page-title">Pagamentos</h1>
      <p className="page-lead">Stripe checkouts, webhooks, compras e produção.</p>
      {loading ? <Loading /> : null}
      {error ? <Err error={error} /> : null}
      {!loading && !error ? (
        <>
          <h2>Checkouts Stripe</h2>
          <Table columns={checkoutCols} rows={checkouts.data?.checkouts || []} />
          <h2 style={{ marginTop: 28 }}>Eventos webhook</h2>
          <Table columns={eventCols} rows={events.data?.events || []} />
          <h2 style={{ marginTop: 28 }}>Compras creditadas</h2>
          <Table columns={purchaseCols} rows={purchases.data?.purchases || []} />
          <h2 style={{ marginTop: 28 }}>Pedidos de produção</h2>
          <Table columns={prodCols} rows={production.data?.orders || []} />
          <h2 style={{ marginTop: 28 }}>Cancelamentos</h2>
          <Table columns={cancelCols} rows={cancels.data?.cancellations || []} />
        </>
      ) : null}
    </section>
  );
}
