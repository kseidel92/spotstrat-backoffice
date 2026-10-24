import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { store } from './store';
import './styles.css';
import Overview from './pages/Overview';
import Prompts, { PromptDetail } from './pages/Prompts';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import Jobs from './pages/Jobs';

function Shell() {
  return (
    <div className="shell">
      <aside className="side">
        <p className="brand">SpotStrat</p>
        <p className="brand-sub">Backoffice · localhost</p>
        <nav className="nav">
          <NavLink end to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Visão geral</NavLink>
          <NavLink to="/prompts" className={({ isActive }) => (isActive ? 'active' : '')}>Prompts</NavLink>
          <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'active' : '')}>Jobs</NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>Usuários</NavLink>
          <NavLink to="/payments" className={({ isActive }) => (isActive ? 'active' : '')}>Pagamentos</NavLink>
          <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>Mensagens</NavLink>
        </nav>
        <p className="lock">API admin só em 127.0.0.1 · porta 7173</p>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/prompts/:id" element={<PromptDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/users" element={<Users />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
