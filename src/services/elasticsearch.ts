import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
})

export const PRODUCTS_INDEX = 'products'

export const createProductIndex = async () => {
  const exists = await client.indices.exists({ index: PRODUCTS_INDEX })

  if (exists) {
    console.log('Products index already exists')
    return
  }

  await client.indices.create({
    index: PRODUCTS_INDEX,
    mappings: {
      properties: {
        id:           { type: 'keyword' },
        name:         { type: 'text', analyzer: 'standard' },
        description:  { type: 'text', analyzer: 'standard' },
        brand:        { type: 'keyword' },
        category:     { type: 'keyword' },
        price:        { type: 'float' },
        stock:        { type: 'integer' },
        click_count:  { type: 'integer' },
        is_active:    { type: 'boolean' },
        created_at:   { type: 'date' },
        tags:         { type: 'keyword' }
      }
    },
    settings: {
      analysis: {
        analyzer: {
          standard: {
            type: 'standard'
          }
        }
      }
    }
  })

  console.log('✅ Products index created')
}

export default client