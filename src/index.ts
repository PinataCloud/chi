import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/id', async (c) => {
  const req = await fetch('https://kubo.railway.internal:5001/api/v0/id')
  const res = await req.json()
  return c.json(res, 200)
})

export default app
