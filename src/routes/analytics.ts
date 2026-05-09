import { FastifyInstance } from 'fastify'
import esClient from '../services/elasticsearch'

const ANALYTICS_INDEX = 'search_analytics'

export default async function analyticsRoutes(app: FastifyInstance) {

  // GET /analytics/top-searches
  app.get('/analytics/top-searches', async (request, reply) => {
    const result = await esClient.search({
      index: ANALYTICS_INDEX,
      size: 0,
      query: { term: { event_type: 'search' } },
      aggs: {
        top_queries: {
          terms: { field: 'query', size: 10 }
        }
      }
    })

    const buckets = (result.aggregations?.top_queries as any)?.buckets || []
    return reply.send({
      top_searches: buckets.map((b: any) => ({
        query: b.key,
        count: b.doc_count
      }))
    })
  })

  // GET /analytics/zero-results
  app.get('/analytics/zero-results', async (request, reply) => {
    const result = await esClient.search({
      index: ANALYTICS_INDEX,
      size: 0,
      query: { term: { event_type: 'no_results' } },
      aggs: {
        zero_result_queries: {
          terms: { field: 'query', size: 10 }
        }
      }
    })

    const buckets = (result.aggregations?.zero_result_queries as any)?.buckets || []
    return reply.send({
      zero_result_searches: buckets.map((b: any) => ({
        query: b.key,
        count: b.doc_count
      }))
    })
  })

  // GET /analytics/ctr
  app.get('/analytics/ctr', async (request, reply) => {
    const result = await esClient.search({
      index: ANALYTICS_INDEX,
      size: 0,
      aggs: {
        by_query: {
          terms: { field: 'query', size: 10 },
          aggs: {
            searches: { filter: { term: { event_type: 'search' } } },
            clicks:   { filter: { term: { event_type: 'click'  } } }
          }
        }
      }
    })

    const buckets = (result.aggregations?.by_query as any)?.buckets || []
    return reply.send({
      ctr_by_query: buckets.map((b: any) => ({
        query:    b.key,
        searches: b.searches.doc_count,
        clicks:   b.clicks.doc_count,
        ctr:      b.searches.doc_count > 0
          ? ((b.clicks.doc_count / b.searches.doc_count) * 100).toFixed(1) + '%'
          : '0%'
      }))
    })
  })

  // GET /analytics/summary
  app.get('/analytics/summary', async (request, reply) => {
    const result = await esClient.search({
      index: ANALYTICS_INDEX,
      size: 0,
      aggs: {
        total_searches:    { filter: { term: { event_type: 'search'     } } },
        total_clicks:      { filter: { term: { event_type: 'click'      } } },
        total_no_results:  { filter: { term: { event_type: 'no_results' } } }
      }
    })

    const aggs = result.aggregations as any
    return reply.send({
      total_searches:   aggs.total_searches.doc_count,
      total_clicks:     aggs.total_clicks.doc_count,
      total_no_results: aggs.total_no_results.doc_count,
      overall_ctr:      aggs.total_searches.doc_count > 0
        ? ((aggs.total_clicks.doc_count / aggs.total_searches.doc_count) * 100).toFixed(1) + '%'
        : '0%'
    })
  })
}