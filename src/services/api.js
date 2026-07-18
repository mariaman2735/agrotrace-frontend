/**
 * ============================================================
 * AgroTrace - Service API
 * Centralise toutes les requêtes HTTP vers le backend
 * ============================================================
 */

import axios from 'axios';

/**
 * Instance Axios configurée avec l'URL de base de l'API
 * L'URL est définie via la variable d'environnement REACT_APP_API_URL
 * en production, ou pointe vers localhost en développement
 */
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

/**
 * Intercepteur de requêtes
 * Ajoute automatiquement le token JWT dans l'en-tête Authorization
 * de chaque requête sortante si l'utilisateur est connecté
 */
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Authentification ──────────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const creerUtilisateur = (data) => API.post('/auth/creer', data);
export const getUtilisateurs = () => API.get('/auth/utilisateurs');

// ── Fournisseurs ──────────────────────────────────────────────────────────
export const getFournisseurs = () => API.get('/fournisseurs');
export const createFournisseur = (data) => API.post('/fournisseurs', data);
export const updateFournisseur = (id, data) => API.put(`/fournisseurs/${id}`, data);
export const deleteFournisseur = (id) => API.delete(`/fournisseurs/${id}`);
export const setMatieresPremieresFournisseur = (id, data) => API.put(`/fournisseurs/${id}/matieres-premieres`, data);

// ── Lots de matières premières ────────────────────────────────────────────
export const getLotsMP = () => API.get('/lots-mp');
export const createLotMP = (data) => API.post('/lots-mp', data);
export const updateStatutLotMP = (id, data) => API.put(`/lots-mp/${id}/statut`, data);

// ── Ordres de fabrication ─────────────────────────────────────────────────
export const getOFs = () => API.get('/ordres-fabrication');
export const createOF = (data) => API.post('/ordres-fabrication', data);
export const updateStatutOF = (id, data) => API.put(`/ordres-fabrication/${id}/statut`, data);
export const consommerLotMP = (id, data) => API.post(`/ordres-fabrication/${id}/consommer`, data);

// ── Lots de produits finis ────────────────────────────────────────────────
export const getLotsPF = () => API.get('/lots-pf');
export const createLotPF = (data) => API.post('/lots-pf', data);
export const updateStatutLotPF = (id, data) => API.put(`/lots-pf/${id}/statut`, data);
export const getTraceabilite = (id) => API.get(`/lots-pf/${id}/tracabilite`);

// ── Contrôles qualité ─────────────────────────────────────────────────────
export const getControles = () => API.get('/controles-qualite');
export const createControle = (data) => API.post('/controles-qualite', data);

// ── Non-conformités ───────────────────────────────────────────────────────
export const getNonConformites = () => API.get('/non-conformites');
export const createNonConformite = (data) => API.post('/non-conformites', data);
export const updateNonConformite = (id, data) => API.put(`/non-conformites/${id}`, data);

// ── Clients ───────────────────────────────────────────────────────────────
export const getClients = () => API.get('/clients');
export const createClient = (data) => API.post('/clients', data);

// ── Ventes ────────────────────────────────────────────────────────────────
export const getVentes = () => API.get('/ventes');
export const createVente = (data) => API.post('/ventes', data);

// ── Rappels produit ───────────────────────────────────────────────────────
export const getRappels = () => API.get('/rappels-produit');
export const createRappel = (data) => API.post('/rappels-produit', data);
export const updateStatutRappel = (id, data) => API.put(`/rappels-produit/${id}/statut`, data);

// ── Matières premières ────────────────────────────────────────────────────
export const getMatieresPremieres = () => API.get('/matieres-premieres');
export const createMatierePremiere = (data) => API.post('/matieres-premieres', data);
export const updateMatierePremiere = (id, data) => API.put(`/matieres-premieres/${id}`, data);
export const deleteMatierePremiere = (id) => API.delete(`/matieres-premieres/${id}`);

// ── Produits ───────────────────────────────────────────────────────────────
export const getProduits = () => API.get('/produits');
export const createProduit = (data) => API.post('/produits', data);
export const updateProduit = (id, data) => API.put(`/produits/${id}`, data);
export const deleteProduit = (id) => API.delete(`/produits/${id}`);

// ── Demandes d'accès ──────────────────────────────────────────────────────
export const createDemandeAcces = (data) => API.post('/demandes-acces', data);
export const getDemandesAcces = () => API.get('/demandes-acces');
export const updateStatutDemande = (id, data) => API.put(`/demandes-acces/${id}/statut`, data);

// ── Réinitialisation mot de passe ─────────────────────────────────────────
export const demanderReset = (data) => API.post('/reset-password/demander', data);
export const verifierTokenReset = (token) => API.get(`/reset-password/verifier/${token}`);
export const reinitialiserMotDePasse = (data) => API.post('/reset-password/reinitialiser', data);

export default API;