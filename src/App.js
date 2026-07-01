import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tracabilite from './pages/Tracabilite';
import Fournisseurs from './pages/Fournisseurs';
import LotsMP from './pages/LotsMP';
import MatieresPremières from './pages/MatieresPremières';
import OrdresFabrication from './pages/OrdresFabrication';
import LotsPF from './pages/LotsPF';
import Stock from './pages/Stock';
import ControleQualite from './pages/ControleQualite';
import NonConformites from './pages/NonConformites';
import RappelProduit from './pages/RappelProduit';
import Clients from './pages/Clients';
import Ventes from './pages/Ventes';
import Utilisateurs from './pages/Utilisateurs';
import DemandeAcces from './pages/DemandeAcces';
import DemandesAcces from './pages/DemandesAcces';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import MonProfil from './pages/MonProfil';
import {
    MdDashboard, MdSearch, MdPeople, MdInventory,
    MdFactory, MdLabel, MdCheckCircle, MdWarning,
    MdReplay, MdTrendingUp, MdSettings, MdEmail,
    MdMenu, MdClose, MdPerson
} from 'react-icons/md';

const menuItems = {
    ADMINISTRATEUR: [
        { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
        { path: '/tracabilite', label: 'Traçabilité', Icon: MdSearch },
        { section: 'APPROVISIONNEMENT' },
        { path: '/fournisseurs', label: 'Fournisseurs', Icon: MdPeople },
        { path: '/lots-mp', label: 'Lots MP', Icon: MdInventory },
        { path: '/matieres-premieres', label: 'Matières premières', Icon: MdInventory },
        { section: 'PRODUCTION' },
        { path: '/ordres-fabrication', label: 'Ordres fabrication', Icon: MdFactory },
        { path: '/lots-pf', label: 'Lots PF', Icon: MdLabel },
        { path: '/stock', label: 'Stocks', Icon: MdInventory },
        { section: 'QUALITÉ' },
        { path: '/controle-qualite', label: 'Contrôle qualité', Icon: MdCheckCircle },
        { path: '/non-conformites', label: 'Non-conformités', Icon: MdWarning },
        { path: '/rappel-produit', label: 'Rappel produit', Icon: MdReplay },
        { section: 'COMMERCIAL' },
        { path: '/clients', label: 'Clients', Icon: MdPeople },
        { path: '/ventes', label: 'Ventes', Icon: MdTrendingUp },
        { section: 'ADMINISTRATION' },
        { path: '/utilisateurs', label: 'Utilisateurs', Icon: MdSettings },
        { path: '/demandes-acces', label: "Demandes d'accès", Icon: MdEmail },
        { section: 'MON COMPTE' },
        { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
    RESP_ACHAT: [
        { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
        { section: 'APPROVISIONNEMENT' },
        { path: '/fournisseurs', label: 'Fournisseurs', Icon: MdPeople },
        { path: '/lots-mp', label: 'Lots MP', Icon: MdInventory },
        { path: '/matieres-premieres', label: 'Matières premières', Icon: MdInventory },
        { section: 'MON COMPTE' },
        { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
    OPERATEUR_PRODUCTION: [
        { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
        { section: 'PRODUCTION' },
        { path: '/ordres-fabrication', label: 'Ordres fabrication', Icon: MdFactory },
        { path: '/lots-pf', label: 'Lots PF', Icon: MdLabel },
        { section: 'MON COMPTE' },
        { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
    RESP_QUALITE: [
        { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
        { section: 'QUALITÉ' },
        { path: '/controle-qualite', label: 'Contrôle qualité', Icon: MdCheckCircle },
        { path: '/non-conformites', label: 'Non-conformités', Icon: MdWarning },
        { path: '/rappel-produit', label: 'Rappel produit', Icon: MdReplay },
        { section: 'MON COMPTE' },
        { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
    RESP_COMMERCIAL: [
        { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
        { section: 'COMMERCIAL' },
        { path: '/clients', label: 'Clients', Icon: MdPeople },
        { path: '/ventes', label: 'Ventes', Icon: MdTrendingUp },
        { section: 'MON COMPTE' },
        { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
    RESP_STOCK: [
    { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
    { section: 'STOCKS' },
    { path: '/stock', label: 'Stocks', Icon: MdInventory },
    { path: '/lots-mp', label: 'Lots MP', Icon: MdInventory },
    { path: '/lots-pf', label: 'Lots PF', Icon: MdLabel },
    { path: '/matieres-premieres', label: 'Matières premières', Icon: MdInventory },
    { section: 'MON COMPTE' },
    { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
    AUDITEUR: [
    { path: '/dashboard', label: 'Tableau de bord', Icon: MdDashboard },
    { path: '/tracabilite', label: 'Traçabilité', Icon: MdSearch },
    { section: 'CONSULTATION' },
    { path: '/lots-mp', label: 'Lots MP', Icon: MdInventory },
    { path: '/lots-pf', label: 'Lots PF', Icon: MdLabel },
    { path: '/stock', label: 'Stocks', Icon: MdInventory },
    { path: '/controle-qualite', label: 'Contrôle qualité', Icon: MdCheckCircle },
    { path: '/non-conformites', label: 'Non-conformités', Icon: MdWarning },
    { section: 'MON COMPTE' },
    { path: '/mon-profil', label: 'Mon profil', Icon: MdPerson },
    ],
};

const Sidebar = ({ open, onClose }) => {
    const { utilisateur, logout } = useAuth();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const menus = menuItems[utilisateur?.role] || menuItems['ADMINISTRATEUR'];

    return (
        <>
            {open && <div style={S.overlay} onClick={onClose} />}
            <div style={{ ...S.sidebar, left: open ? 0 : '-260px' }}>
                <div style={S.sidebarHeader}>
                    <img src="/logo.png" alt="AgroTrace" style={S.logoImg} />
                    <button style={S.closeBtn} onClick={onClose}>
                        <MdClose size={20} color="#666" />
                    </button>
                </div>
                <p style={S.logoSub}>Traçabilité Agroalimentaire</p>
                <nav style={S.nav}>
                    {menus.map((item, i) =>
                        item.section ? (
                            <div key={i} style={S.section}>{item.section}</div>
                        ) : (
                            <Link key={i} to={item.path}
                                style={{
                                    ...S.link,
                                    backgroundColor: isActive(item.path) ? '#f0faf4' : 'transparent',
                                    color: isActive(item.path) ? '#1B6B3A' : '#555',
                                    fontWeight: isActive(item.path) ? '700' : '400',
                                    borderLeft: isActive(item.path) ? '3px solid #1B6B3A' : '3px solid transparent',
                                }}
                                onClick={onClose}
                            >
                                <item.Icon size={18} color={isActive(item.path) ? '#1B6B3A' : '#888'} />
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>
                <div style={S.sidebarBottom}>
                    <div style={S.userRow}>
                        <div style={S.avatar}>
                            {utilisateur?.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={S.userName}>{utilisateur?.nom}</div>
                            <div style={S.userRole}>{utilisateur?.role}</div>
                        </div>
                    </div>
                    <button style={S.logoutBtn}
                        onClick={() => { logout(); window.location.href = '/login'; }}>
                        Déconnexion
                    </button>
                </div>
            </div>
        </>
    );
};

const Layout = ({ children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <div style={S.topbar}>
                <button style={S.hamburger} onClick={() => setOpen(true)}>
                    <MdMenu size={26} color="#333" />
                </button>
                <img src="/logo.png" alt="AgroTrace" style={S.topbarLogo} />
            </div>
            <div style={S.content}>{children}</div>
        </div>
    );
};

const withLayout = (Component) => (
    <PrivateRoute>
        <Layout><Component /></Layout>
    </PrivateRoute>
);

const S = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 200 },
    sidebar: { position: 'fixed', top: 0, left: 0, width: '250px', height: '100vh', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 300, transition: 'left 0.3s ease', boxShadow: '4px 0 20px rgba(0,0,0,0.08)' },
    sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 4px', borderBottom: '1px solid #f0f0f0' },
    logoImg: { width: '120px' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
    logoSub: { color: '#aaa', fontSize: '11px', margin: '6px 0 8px 16px' },
    nav: { flex: 1, overflowY: 'auto', padding: '4px 8px' },
    section: { color: '#bbb', fontSize: '10px', padding: '14px 8px 4px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase' },
    link: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '9px 10px', fontSize: '14px', borderRadius: '8px', margin: '1px 0', transition: 'all 0.15s' },
    sidebarBottom: { padding: '12px', borderTop: '1px solid #f0f0f0' },
    userRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1B6B3A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px', flexShrink: 0 },
    userName: { color: '#333', fontSize: '13px', fontWeight: '600' },
    userRole: { color: '#aaa', fontSize: '11px' },
    logoutBtn: { width: '100%', padding: '8px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
    topbar: { height: '56px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    hamburger: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
    topbarLogo: { height: '32px' },
    content: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/demande-acces" element={<DemandeAcces />} />
                    <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                    <Route path="/reinitialiser-mot-de-passe/:token" element={<ReinitialiserMotDePasse />} />
                    <Route path="/dashboard" element={withLayout(Dashboard)} />
                    <Route path="/tracabilite" element={withLayout(Tracabilite)} />
                    <Route path="/fournisseurs" element={withLayout(Fournisseurs)} />
                    <Route path="/lots-mp" element={withLayout(LotsMP)} />
                    <Route path="/matieres-premieres" element={withLayout(MatieresPremières)} />
                    <Route path="/ordres-fabrication" element={withLayout(OrdresFabrication)} />
                    <Route path="/lots-pf" element={withLayout(LotsPF)} />
                    <Route path="/stock" element={withLayout(Stock)} />
                    <Route path="/controle-qualite" element={withLayout(ControleQualite)} />
                    <Route path="/non-conformites" element={withLayout(NonConformites)} />
                    <Route path="/rappel-produit" element={withLayout(RappelProduit)} />
                    <Route path="/clients" element={withLayout(Clients)} />
                    <Route path="/ventes" element={withLayout(Ventes)} />
                    <Route path="/utilisateurs" element={withLayout(Utilisateurs)} />
                    <Route path="/demandes-acces" element={withLayout(DemandesAcces)} />
                    <Route path="/mon-profil" element={withLayout(MonProfil)} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
export default App;