import {
  useCancellationsQuery,
  useProductionOrdersQuery,
  usePurchasesQuery,
} from '../store';
import { Err, Loading, StatusBadge, Table, money, when } from '../components';

export default function Payments() {
  const purchases = usePurchasesQuery();
  const production = useProductionOrdersQuery();
  const cancels = useCancellationsQuery();
  const loading = purchases.isLoading || production.isLoading || cancels.isLoading;
  const error = purchases.error || production.error || cancels.error;

  const purchaseCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'email', label: 'Usuário', render: (r) => <span className="mono">{r.email}</span> },
    { key: 'tier', label: 'Tier', render: (r) => `${r.tier} · ${r.months}m` },
    { key: 'amount_brl', label: 'Valor', render: (r) => money(r.amount_brl) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const prodCols = [
    { key: 'created_at', label: 'Quando', render: (r) => <span className="mono">{when(r.created_at)}</span> },
    { key: 'user_email', label: 'Usuário', render: (r) => <span className="mono">{r.user_email}</span> },
    { key: 'strategy_name', label: 'Estratégia', render: (r) => r.strategy_name },
    { key: 'amount_brl', label: 'Valor', render: (r) => money(r.amount_brl) },
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
      <p className="page-lead">Assinaturas simuladas, produção e cancelamentos.</p>
      {loading ? <Loading /> : null}
      {error ? <Err error={error} /> : null}
      {!loading && !error ? (
        <>
          <h2>Assinaturas</h2>
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
