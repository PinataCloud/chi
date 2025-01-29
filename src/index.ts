import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()
app.use('*', logger())
app.use('*', cors({
  origin: '*',
}))
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/id', async (c) => {
  const req = await fetch(`http://${process.env.KUBO_URL}:5001/api/v0/id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ""
  })
  const res = await req.json()
  return c.json(res, 200)
})

export default app
