# Scalable AI-Powered Commerce Search Engine

A high-performance product search platform built with Node.js, Elasticsearch, and AI query rewriting — inspired by real-world systems like AboutYou / SCAYLE.

---

## Architecture

User Request
↓
Kubernetes LoadBalancer / Docker
↓
Commerce Search App (Node.js + Fastify)
↓
┌─────────────────────────────────┐
│  /search       → Elasticsearch  │
│  /ai-search    → OpenAI + ES    │
│  /autocomplete → Elasticsearch  │
│  /click        → Analytics      │
│  /analytics    → ES Aggregates  │
└─────────────────────────────────┘
↓
Elasticsearch + PostgreSQL

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Backend | Node.js + TypeScript |
| API Framework | Fastify |
| Search Engine | Elasticsearch 8.11 |
| Database | PostgreSQL 15 |
| AI Layer | OpenAI GPT-3.5 |
| Containerization | Docker |
| Orchestration | Kubernetes |

---

## Features

- ✅ Full-text product search with typo tolerance
- ✅ Faceted filters (category, brand, price range)
- ✅ Smart ranking (stock boost, click boost, relevance score)
- ✅ Autocomplete suggestions
- ✅ AI query rewriting (vague → precise)
- ✅ AI synonym expansion
- ✅ Click tracking + CTR analytics
- ✅ Zero-result detection
- ✅ Docker + Kubernetes ready

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /search?q=nike | Full-text search with filters |
| GET | /ai-search?q=cheap shoes | AI-powered semantic search |
| GET | /autocomplete?q=ni | Autocomplete suggestions |
| GET | /products/:id | Get single product |
| POST | /products | Ingest product |
| POST | /click | Track product click |
| GET | /analytics/summary | Overall metrics |
| GET | /analytics/top-searches | Most searched queries |
| GET | /analytics/zero-results | Failed searches |
| GET | /analytics/ctr | CTR per query |

---

## Running Locally

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- Git

### Option 1 — Local Development (No Docker)

**Step 1 — Clone the repo:**
```bash
git clone https://github.com/YOUR_USERNAME/commerce-search-engine.git
cd commerce-search-engine
```

**Step 2 — Install dependencies:**
```bash
npm install
```

**Step 3 — Create .env file:**
```env
PORT=3000
ELASTICSEARCH_URL=http://localhost:9200
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/commerce_search
NODE_ENV=development
OPENAI_API_KEY=your_openai_key_here
OPENAI_BASE_URL=https://api.chatanywhere.tech/v1
```

**Step 4 — Start Elasticsearch + PostgreSQL:**
```bash
docker-compose up -d
```

**Step 5 — Seed product data:**
```bash
npx ts-node scripts/seed.ts
```

**Step 6 — Start server:**
```bash
npm run dev
```

**Step 7 — Test:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/search?q=nike
```

---

### Option 2 — Docker Compose (Full Stack)

**Step 1 — Clone the repo:**
```bash
git clone https://github.com/YOUR_USERNAME/commerce-search-engine.git
cd commerce-search-engine
```

**Step 2 — Create .env file:**
```env
PORT=3000
ELASTICSEARCH_URL=http://elasticsearch:9200
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/commerce_search
NODE_ENV=production
OPENAI_API_KEY=your_openai_key_here
OPENAI_BASE_URL=https://api.chatanywhere.tech/v1
```

**Step 3 — Start everything:**
```bash
docker-compose up -d
```

**Step 4 — Seed product data:**
```bash
docker-compose exec app npx ts-node scripts/seed.ts
```

**Step 5 — Test:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/search?q=nike
```

**Step 6 — Stop everything:**
```bash
docker-compose down
```

---

### Option 3 — Kubernetes (Docker Desktop)

**Prerequisites:**
- Docker Desktop with Kubernetes enabled
- kubectl installed

**Step 1 — Clone the repo:**
```bash
git clone https://github.com/YOUR_USERNAME/commerce-search-engine.git
cd commerce-search-engine
```

**Step 2 — Build and push Docker image:**
```bash
docker build -t YOUR_DOCKERHUB_USERNAME/commerce-search:v1 .
docker push YOUR_DOCKERHUB_USERNAME/commerce-search:v1
```

**Step 3 — Update image name in k8s/app-deployment.yaml:**
```yaml
image: YOUR_DOCKERHUB_USERNAME/commerce-search:v1
```

**Step 4 — Deploy to Kubernetes:**
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/elasticsearch.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app-deployment.yaml
```

**Step 5 — Verify all pods running:**
```bash
kubectl get pods
```

Expected output:

NAME                                  READY   STATUS
commerce-search-app-xxx               1/1     Running
commerce-search-app-yyy               1/1     Running
elasticsearch-xxx                     1/1     Running
postgres-xxx                          1/1     Running

**Step 6 — Seed product data:**
```bash
# Port forward Elasticsearch first
kubectl port-forward service/elasticsearch-service 9200:9200

# In a new terminal
npx ts-node scripts/seed.ts
```

**Step 7 — Test:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/search?q=nike
curl "http://localhost:3000/ai-search?q=cheap+running+shoes"
curl http://localhost:3000/analytics/summary
```

**Step 8 — Scale app instances:**
```bash
kubectl scale deployment commerce-search-app --replicas=5
```

**Step 9 — Cleanup:**
```bash
kubectl delete -f k8s/
```

---

## Search Relevance Logic

Products are ranked by:

1. **Text match score** — name (3x boost), brand (2x boost), description, tags
2. **In-stock boost** — in-stock products ranked 1.5x higher
3. **Click count boost** — popular products ranked 1.2x higher
4. **Fuzziness AUTO** — typo tolerance built in

Example:
- Search `nik air` → returns `Nike Air Max 270` ✅
- Search `cheap running shoes` → AI rewrites to `affordable running sneakers` ✅

---

## Analytics Metrics

| Metric | Description |
|--------|-------------|
| Top Searches | Most searched queries |
| Zero Results | Searches with no products found (lost sales) |
| CTR | Click through rate per query |
| Summary | Overall search engine health |

---

## Tradeoff Decisions

| Decision | Reason |
|----------|--------|
| Elasticsearch over Postgres full-text | Better relevance scoring, fuzzy matching, aggregations |
| Fastify over Express | 2x faster throughput, built-in schema validation |
| GPT-3.5 over embeddings | Simpler, cheaper, good enough for query rewriting at MVP |
| NodePort → LoadBalancer | LoadBalancer gives stable localhost on Docker Desktop |

---

## Scaling Strategy

- Horizontal scaling via Kubernetes replicas
- Elasticsearch can be scaled to multi-node cluster
- Analytics can be moved to BigQuery + dbt for large scale
- Kafka/PubSub can replace direct ES writes for analytics events