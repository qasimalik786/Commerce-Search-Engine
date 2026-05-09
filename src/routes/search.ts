import { FastifyInstance } from 'fastify'
import esClient, { PRODUCTS_INDEX } from '../services/elasticsearch'
import { trackEvent } from '../services/analytics'

export default async function searchRoutes(app: FastifyInstance) {

  app.get('/search', async (request, reply) => {
    const {
      q = '',
      category,
      brand,
      minPrice,
      maxPrice,
      page = '1',
      limit = '10',
      sort
    } = request.query as Record<string, string>

    const from = (Number(page) - 1) * Number(limit)

    const filters: any[] = [{ term: { is_active: true } }]
    if (category) filters.push({ term: { category } })
    if (brand)    filters.push({ term: { brand } })
    if (minPrice || maxPrice) {
      filters.push({
        range: {
          price: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) })
          }
        }
      })
    }

    const sortOption: any[] = []
    if (sort === 'price_asc')  sortOption.push({ price: 'asc' })
    if (sort === 'price_desc') sortOption.push({ price: 'desc' })
    if (sort === 'popular')    sortOption.push({ click_count: 'desc' })
    sortOption.push('_score')

    const result = await esClient.search({
      index: PRODUCTS_INDEX,
      from,
      size: Number(limit),
      sort: sortOption,
      query: {
        bool: {
          must: q
            ? [{ multi_match: { query: q, fields: ['name^3', 'brand^2', 'description', 'tags'], fuzziness: 'AUTO', operator: 'or' } }]
            : [{ match_all: {} }],
          filter: filters,
          should: [
            { range: { stock:       { gt: 0, boost: 1.5 } } },
            { range: { click_count: { gt: 0, boost: 1.2 } } }
          ]
        }
      },
      highlight: { fields: { name: {}, description: {} } }
    })

    const total = (result.hits.total as any).value ?? 0
    const hits = result.hits.hits.map((hit: any) => ({
      id:        hit._id,
      score:     hit._score,
      highlight: hit.highlight,
      ...hit._source
    }))

    // Track analytics
    await trackEvent({
      event_type:   total === 0 ? 'no_results' : 'search',
      query:        q,
      result_count: total
    })

    return reply.send({ total, page: Number(page), limit: Number(limit), results: hits })
  })

  // GET /autocomplete?q=ni
  app.get('/autocomplete', async (request, reply) => {
    const { q = '' } = request.query as { q: string }

    const result = await esClient.search({
      index: PRODUCTS_INDEX,
      size: 5,
      query: { match_phrase_prefix: { name: { query: q } } }
    })

    const suggestions = result.hits.hits.map((hit: any) => ({
      id:    hit._id,
      name:  hit._source.name,
      brand: hit._source.brand
    }))

    return reply.send({ suggestions })
  })

  // POST /click — track product click
  app.post('/click', async (request, reply) => {
    const { product_id, query } = request.body as { product_id: string, query: string }

    // Track click event
    await trackEvent({ event_type: 'click', query, product_id })

    // Increment click count on product
    await esClient.update({
      index: PRODUCTS_INDEX,
      id: product_id,
      script: { source: 'ctx._source.click_count += 1', lang: 'painless' }
    })

    return reply.send({ message: 'Click tracked' })
  })
}