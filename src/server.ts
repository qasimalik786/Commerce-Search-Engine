import app from './app'
import { createProductIndex } from './services/elasticsearch'
import { createAnalyticsIndex } from './services/analytics'

const PORT = Number(process.env.PORT) || 3000

const start = async () => {
  try {
    await createProductIndex()
    await createAnalyticsIndex()
    await app.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`Server running on port ${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()