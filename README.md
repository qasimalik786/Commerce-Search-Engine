# Scalable AI-Powered Commerce Search Engine

A high-performance product search platform built with Node.js, Elasticsearch, and AI query rewriting.

## Architecture
- **Backend**: Node.js + TypeScript + Fastify
- **Search**: Elasticsearch 8.11 (typo tolerance, faceted search, relevance ranking)
- **AI Layer**: OpenAI GPT-3.5 (query rewriting + synonym expansion)
- **Analytics**: Elasticsearch aggregations (CTR, top searches, zero results)
- **Infra**: Docker + Docker Compose

## Features
- ✅ Full-text product search with typo tolerance
- ✅ Faceted filters (category, brand, price range)
- ✅ Smart ranking (stock, click count, relevance score)
- ✅ Autocomplete
- ✅ AI query rewriting
- ✅ AI synonym expansion
- ✅ Click tracking + CTR analytics
- ✅ Zero-result detection

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
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

## Quick Start

```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
npm install

# Seed data
npx ts-node scripts/seed.ts

# Start server
npm run dev
```

## Search Relevance Logic
Products are ranked by:
1. Text match score (name^3, brand^2, description, tags)
2. In-stock boost (1.5x)
3. Click count boost (1.2x)
4. Fuzziness AUTO for typo tolerance

## Tradeoff Decisions
- **Elasticsearch over Postgres full-text**: Better relevance scoring, fuzzy matching, aggregations
- **Fastify over Express**: 2x faster throughput, built-in schema validation
- **GPT-3.5 over embeddings**: Simpler, cheaper, good enough for query rewriting at MVP stage