import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import dotenv from 'dotenv'
import productRoutes from './routes/products'
import searchRoutes from './routes/search'
import analyticsRoutes from './routes/analytics'
import aiSearchRoutes from './routes/aisearch'

dotenv.config()

const app = Fastify({ logger: true })

app.register(cors)
app.register(helmet)
app.register(productRoutes)
app.register(searchRoutes)
app.register(analyticsRoutes)
app.register(aiSearchRoutes)

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

export default app