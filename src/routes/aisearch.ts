import { FastifyInstance } from 'fastify'
import esClient, { PRODUCTS_INDEX } from '../services/elasticsearch'
import { rewriteQuery, expandQueryWithSynonyms } from '../services/ai'
import { trackEvent } from '../services/analytics'

export default async function aiSearchRoutes(app: FastifyInstance) {

  // GET /ai-search?q=cheap running shoes
  app.get('/ai-search', async (request, reply) => {
    const { q = '' } = request.query as { q: string }

    if (!q) return reply.send({ results: [], message: 'Query required' })

    // Step 1 — rewrite query
    const rewrittenQuery = await rewriteQuery(q)

    // Step 2 — expand with synonyms
    const synonyms = await expandQueryWithSynonyms(rewrittenQuery)

    // Step 3 — build multi query with all variations
    const allQueries = [rewrittenQuery, ...synonyms]

    const result = await esClient.search({
      index: PRODUCTS_INDEX,
      size: 10,
      query: {
        bool: {
          should: allQueries.map(term => ({
            multi_match: {
              query: term,
              fields: ['name^3', 'brand^2', 'description', 'tags'],
              fuzziness: 'AUTO'
            }
          })),
          filter: [{ term: { is_active: true } }],
          minimum_should_match: 1
        }
      }
    })

    const total = (result.hits.total as any).value ?? 0
    const hits = result.hits.hits.map((hit: any) => ({
      id:    hit._id,
      score: hit._score,
      ...hit._source
    }))

    // Track event
    await trackEvent({
      event_type:   total === 0 ? 'no_results' : 'search',
      query:        q,
      result_count: total
    })

    return reply.send({
      original_query:  q,
      rewritten_query: rewrittenQuery,
      synonyms_used:   synonyms,
      total,
      results:         hits
    })
  })
}