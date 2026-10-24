import { useOverviewQuery } from '../store';
import { Err, Loading, money } from '../components';

function Card({ label, value, hint }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

export default function Overview() {
  const { data, isLoading, error, refetch, isFetching } = useOverviewQuery(undefined, {
    pollingInterval: 15000,
  });
  if (isLoading) return <Loading />;
  if (error) return <Err error={error} />;
  const o = data || {};
  return (
    <section>
      <div className="toolbar">
        <h1 className="page-title" style={{ margin: 0, flex: 1 }}>Visão geral</h1>
        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>
      <p className="page-lead">Resumo do sistema — só acessível em localhost.</p>
      <div className="grid">
        <Card label="Usuários" value={o.users?.total ?? '—'} hint={`${o.users?.new_7d ?? 0} novos em 7d`} />
        <Card label="Plano ativo" value={o.users?.active_plan ?? '—'} hint={`${o.users?.on_trial ?? 0} em trial`} />
        <Card label="Prompts 24h" value={o.prompts?.last_24h ?? '—'} hint={`${o.prompts?.ok ?? 0} ok · ${o.prompts?.bad ?? 0} falha`} />
        <Card label="Fila" value={o.jobs?.queued ?? '—'} hint={`${o.jobs?.running ?? 0} running · ${o.jobs?.failed ?? 0} failed`} />
        <Card label="Compras" value={money(o.purchases?.revenue_brl)} hint={`${o.purchases?.last_30d ?? 0} nos 30d`} />
        <Card label="Produção" value={money(o.production?.revenue_brl)} hint={`${o.production?.total ?? 0} pedidos`} />
        <Card label="Ajuda aberta" value={o.help?.open ?? '—'} hint={`${o.help?.total ?? 0} no total`} />
        <Card label="E-mails 7d" value={o.outbound7d?.total ?? '—'} hint={`${o.outbound7d?.sent ?? 0} enviados · ${o.outbound7d?.failed ?? 0} falha`} />
        <Card label="Cancelamentos" value={o.cancellations?.pending ?? '—'} hint={`${o.cancellations?.total ?? 0} no total`} />
      </div>
    </section>
  );
}
