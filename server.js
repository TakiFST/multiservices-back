// server.js
// API REST Multiservices (sans base de données) — Node 22 + Express
// Endpoints: /health, /api/categories, /api/services, /api/services/:id
//            /api/services/nettoyage, /api/services/bricolage, /api/services/cours-particuliers

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// --------- Données en mémoire (MOCK) ---------
const categories = [
  { id: 1, slug: 'nettoyage',            name: 'Nettoyage' },
  { id: 2, slug: 'bricolage',             name: 'Bricolage' },
  { id: 3, slug: 'cours-particuliers',    name: 'Cours particuliers' }
];

// UUIDs statiques pour démo (pas besoin de lib)
const services = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    category_slug: 'nettoyage',
    title: 'Nettoyage appartement',
    description: 'Entretien complet appartement jusqu’à 80m²',
    price_cents: 5000, currency: 'EUR', unit: 'flat',
    duration_min: 180, active: true,
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-02-01T10:00:00.000Z'
  },
  {
    id: '11111111-1111-1111-1111-222222222222',
    category_slug: 'nettoyage',
    title: 'Vitres & baies vitrées',
    description: 'Vitres int./ext.',
    price_cents: 2000, currency: 'EUR', unit: 'hour',
    duration_min: 60, active: true,
    created_at: '2026-02-02T10:00:00.000Z',
    updated_at: '2026-02-02T10:00:00.000Z'
  },
  {
    id: '22222222-2222-2222-2222-111111111111',
    category_slug: 'bricolage',
    title: 'Montage de meubles',
    description: 'Montage de meubles en kit (jusqu’à 2 pièces)',
    price_cents: 4000, currency: 'EUR', unit: 'flat',
    duration_min: 120, active: true,
    created_at: '2026-02-03T10:00:00.000Z',
    updated_at: '2026-02-03T10:00:00.000Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    category_slug: 'bricolage',
    title: 'Petites réparations',
    description: 'Petite plomberie/électricité non invasive',
    price_cents: 3000, currency: 'EUR', unit: 'hour',
    duration_min: 60, active: true,
    created_at: '2026-02-04T10:00:00.000Z',
    updated_at: '2026-02-04T10:00:00.000Z'
  },
  {
    id: '33333333-3333-3333-3333-111111111111',
    category_slug: 'cours-particuliers',
    title: 'Cours de maths (lycée)',
    description: 'Cours particulier niveau lycée',
    price_cents: 3000, currency: 'EUR', unit: 'hour',
    duration_min: 60, active: true,
    created_at: '2026-02-05T10:00:00.000Z',
    updated_at: '2026-02-05T10:00:00.000Z'
  },
  {
    id: '33333333-3333-3333-3333-222222222222',
    category_slug: 'cours-particuliers',
    title: 'Cours d’anglais (tous niveaux)',
    description: 'Oral, grammaire, préparation examens',
    price_cents: 2800, currency: 'EUR', unit: 'hour',
    duration_min: 60, active: true,
    created_at: '2026-02-06T10:00:00.000Z',
    updated_at: '2026-02-06T10:00:00.000Z'
  }
];

// --------- Middlewares ---------
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*'
}));
app.use(express.json());

// --------- Helpers ---------
const SORT_MAP = { title: 'title', price: 'price_cents', created_at: 'created_at' };

function getPagination(pageParam, pageSizeParam, maxPageSize = 100) {
  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), maxPageSize);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

function parseBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v !== 'string') return undefined;
  const t = v.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(t)) return true;
  if (['false', '0', 'no', 'off'].includes(t)) return false;
  return undefined;
}

function toPublicService(svc) {
  const cat = categories.find(c => c.slug === svc.category_slug);
  return {
    id: svc.id,
    title: svc.title,
    description: svc.description,
    price: {
      amount: Math.round(svc.price_cents) / 100,
      currency: svc.currency,
      unit: svc.unit
    },
    duration_min: svc.duration_min,
    active: svc.active,
    category: cat ? { slug: cat.slug, name: cat.name } : null,
    created_at: svc.created_at,
    updated_at: svc.updated_at
  };
}

function listServices({ categorySlug, q, sort = 'title', order = 'asc', page = 1, pageSize = 20, active }) {
  // Filtrage
  let arr = services.slice().filter(s => (typeof active === 'boolean' ? s.active === active : s.active === true));
  if (categorySlug) arr = arr.filter(s => s.category_slug === categorySlug);
  if (q && typeof q === 'string' && q.trim()) {
    const term = q.trim().toLowerCase();
    arr = arr.filter(s =>
      (s.title && s.title.toLowerCase().includes(term)) ||
      (s.description && s.description.toLowerCase().includes(term))
    );
  }

  // Tri
  const key = SORT_MAP[sort] || 'title';
  const dir = (order && order.toLowerCase() === 'desc') ? -1 : 1;
  arr.sort((a, b) => {
    let va = a[key], vb = b[key];
    if (key === 'created_at') { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); }
    if (typeof va === 'string') return va.localeCompare(vb) * dir;
    return ((va || 0) - (vb || 0)) * dir;
  });

  // Pagination
  const total = arr.length;
  const { page: p, pageSize: ps, offset } = getPagination(page, pageSize);
  const data = arr.slice(offset, offset + ps).map(toPublicService);

  return {
    data,
    paging: {
      page: p, pageSize: ps, total,
      totalPages: Math.max(Math.ceil(total / ps), 1)
    },
    meta: { sort, order }
  };
}

// --------- Routes ---------

// Santé
app.get('/health', (_req, res) => res.json({ ok: true }));

// Catégories
app.get('/api/categories', (_req, res) => {
  res.json({ data: categories });
});

// Liste générique des prestations (avec filtres)
app.get('/api/services', (req, res) => {
  const { category, q, sort, order, page, pageSize, active } = req.query;
  const result = listServices({
    categorySlug: typeof category === 'string' ? category.toLowerCase().trim() : undefined,
    q, sort, order, page, pageSize, active: parseBool(active)
  });
  res.json(result);
});

// Routes dédiées par catégorie
app.get('/api/services/nettoyage', (req, res) => {
  const { q, sort, order, page, pageSize, active } = req.query;
  const result = listServices({ categorySlug: 'nettoyage', q, sort, order, page, pageSize, active: parseBool(active) });
  res.json(result);
});

app.get('/api/services/bricolage', (req, res) => {
  const { q, sort, order, page, pageSize, active } = req.query;
  const result = listServices({ categorySlug: 'bricolage', q, sort, order, page, pageSize, active: parseBool(active) });
  res.json(result);
});

app.get('/api/services/cours-particuliers', (req, res) => {
  const { q, sort, order, page, pageSize, active } = req.query;
  const result = listServices({ categorySlug: 'cours-particuliers', q, sort, order, page, pageSize, active: parseBool(active) });
  res.json(result);
});

// Détail d’une prestation
app.get('/api/services/:id', (req, res) => {
  const svc = services.find(s => s.id === req.params.id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  res.json(toPublicService(svc));
});

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Boot
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API (mock) listening on http://localhost:${port}`);
});
