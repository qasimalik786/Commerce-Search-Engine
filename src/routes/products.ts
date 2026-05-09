import { FastifyInstance } from 'fastify'
import esClient, { PRODUCTS_INDEX } from '../services/elasticsearch'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const ProductSchema = z.object({
  name:        z.string(),
  description: z.string(),
  brand:       z.string(),
  category:    z.string(),
  price:       z.number(),
  stock:       z.number(),
  tags:        z.array(z.string()).optional()
})

export default async function productRoutes(app: FastifyInstance) {

  // POST /products — ingest single product
  app.post('/products', async (request, reply) => {
    const body = ProductSchema.parse(request.body)
    const id = randomUUID()

    await esClient.index({
      index: PRODUCTS_INDEX,
      id,
      document: {
        id,
        ...body,
        click_count: 0,
        is_active: true,
        created_at: new Date().toISOString()
      }
    })

    return reply.code(201).send({ id, message: 'Product indexed' })
  })

  // GET /products/:id — get single product
  app.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const result = await esClient.get({ index: PRODUCTS_INDEX, id })
    return reply.send(result._source)
  })
}