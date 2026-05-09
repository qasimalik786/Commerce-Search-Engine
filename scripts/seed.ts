import { Client } from '@elastic/elasticsearch'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' })

const products = [
  { name: 'Nike Air Max 270', description: 'Lightweight running shoe', brand: 'Nike', category: 'Shoes', price: 149.99, stock: 50, tags: ['running', 'sports', 'nike'] },
  { name: 'Nike Air Force 1', description: 'Classic street shoe', brand: 'Nike', category: 'Shoes', price: 109.99, stock: 30, tags: ['street', 'casual', 'nike'] },
  { name: 'Adidas Ultraboost 22', description: 'High performance running shoe', brand: 'Adidas', category: 'Shoes', price: 179.99, stock: 40, tags: ['running', 'boost', 'adidas'] },
  { name: 'Adidas Stan Smith', description: 'Classic tennis shoe', brand: 'Adidas', category: 'Shoes', price: 89.99, stock: 60, tags: ['casual', 'classic', 'adidas'] },
  { name: 'Puma RS-X', description: 'Retro style sneaker', brand: 'Puma', category: 'Shoes', price: 99.99, stock: 25, tags: ['retro', 'casual', 'puma'] },
  { name: 'Nike Dri-FIT T-Shirt', description: 'Moisture wicking training shirt', brand: 'Nike', category: 'Clothing', price: 34.99, stock: 100, tags: ['training', 'shirt', 'nike'] },
  { name: 'Adidas Tiro Track Pants', description: 'Football training pants', brand: 'Adidas', category: 'Clothing', price: 44.99, stock: 80, tags: ['football', 'training', 'adidas'] },
  { name: 'Nike Pro Shorts', description: 'Compression training shorts', brand: 'Nike', category: 'Clothing', price: 29.99, stock: 90, tags: ['compression', 'training', 'nike'] },
  { name: 'Casio G-Shock Watch', description: 'Rugged sports watch', brand: 'Casio', category: 'Accessories', price: 99.99, stock: 20, tags: ['watch', 'sports', 'casio'] },
  { name: 'Nike Sport Backpack', description: 'Spacious gym backpack', brand: 'Nike', category: 'Accessories', price: 59.99, stock: 35, tags: ['bag', 'gym', 'nike'] }
]

const seed = async () => {
  console.log('Seeding products...')

  for (const product of products) {
    const id = randomUUID()
    await client.index({
      index: 'products',
      id,
      document: { id, ...product, click_count: 0, is_active: true, created_at: new Date().toISOString() }
    })
    console.log(`✅ Indexed: ${product.name}`)
  }

  await client.indices.refresh({ index: 'products' })
  console.log('✅ Seed complete')
}

seed().catch(console.error)