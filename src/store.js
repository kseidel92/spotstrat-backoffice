import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { notice: '' },
  reducers: {
    setNotice(state, action) { state.notice = action.payload || ''; },
  },
});

export const { setNotice } = uiSlice.actions;

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/v1/admin',
    prepareHeaders: (headers) => {
      const token = import.meta.env.VITE_BACKOFFICE_TOKEN || '';
      if (token) headers.set('x-backoffice-token', token);
      return headers;
    },
  }),
  tagTypes: ['Overview', 'Prompts', 'Users', 'Purchases', 'Stripe', 'Outbound', 'Help', 'Jobs', 'Messages'],
  endpoints: (build) => ({
    overview: build.query({ query: () => '/overview', providesTags: ['Overview'] }),
    prompts: build.query({
      query: ({ status = '', q = '', bad = false, offset = 0, limit = 50 } = {}) => {
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
        if (status) params.set('status', status);
        if (q) params.set('q', q);
        if (bad) params.set('bad', '1');
        return `/prompts?${params}`;
      },
      providesTags: ['Prompts'],
    }),
    prompt: build.query({
      query: (id) => `/prompts/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Prompts', id }],
    }),
    users: build.query({
      query: ({ q = '', offset = 0 } = {}) => {
        const params = new URLSearchParams({ limit: '50', offset: String(offset) });
        if (q) params.set('q', q);
        return `/users?${params}`;
      },
      providesTags: ['Users'],
    }),
    purchases: build.query({ query: () => '/purchases?limit=80', providesTags: ['Purchases'] }),
    stripeCheckouts: build.query({ query: () => '/stripe-checkouts?limit=80', providesTags: ['Stripe'] }),
    stripeEvents: build.query({ query: () => '/stripe-events?limit=80', providesTags: ['Stripe'] }),
    productionOrders: build.query({ query: () => '/production-orders?limit=80' }),
    cancellations: build.query({ query: () => '/cancellations?limit=80' }),
    outbound: build.query({
      query: ({ kind = '' } = {}) => {
        const params = new URLSearchParams({ limit: '80' });
        if (kind) params.set('kind', kind);
        return `/outbound?${params}`;
      },
      providesTags: ['Outbound'],
    }),
    help: build.query({
      query: ({ status = '' } = {}) => {
        const params = new URLSearchParams({ limit: '80' });
        if (status) params.set('status', status);
        return `/help?${params}`;
      },
      providesTags: ['Help'],
    }),
    jobs: build.query({
      query: ({ status = '' } = {}) => {
        const params = new URLSearchParams({ limit: '80' });
        if (status) params.set('status', status);
        return `/jobs?${params}`;
      },
      providesTags: ['Jobs'],
    }),
    messages: build.query({ query: () => '/messages?limit=80', providesTags: ['Messages'] }),
  }),
});

export const {
  useOverviewQuery,
  usePromptsQuery,
  usePromptQuery,
  useUsersQuery,
  usePurchasesQuery,
  useStripeCheckoutsQuery,
  useStripeEventsQuery,
  useProductionOrdersQuery,
  useCancellationsQuery,
  useOutboundQuery,
  useHelpQuery,
  useJobsQuery,
  useMessagesQuery,
} = adminApi;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(adminApi.middleware),
});
