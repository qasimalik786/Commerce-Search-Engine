import esClient from './elasticsearch'

const ANALYTICS_INDEX = 'search_analytics'

export const createAnalyticsIndex = async () => {
  const exists = await esClient.indices.exists({ index: ANALYTICS_INDEX })
  if (exists) return

  await esClient.indices.create({
    index: ANALYTICS_INDEX,
    mappings: {
      properties: {
        event_type:  { type: 'keyword' },
        query:       { type: 'keyword' },
        product_id:  { type: 'keyword' },
        result_count:{ type: 'integer' },
        timestamp:   { type: 'date' }
      }
    }
  })
  console.log('✅ Analytics index created')
}

export const trackEvent = async (payload: {
  event_type: 'search' | 'click' | 'no_results'
  query?: string
  product_id?: string
  result_count?: number
}) => {
  await esClient.index({
    index: ANALYTICS_INDEX,
    document: {
      ...payload,
      timestamp: new Date().toISOString()
    }
  })
}