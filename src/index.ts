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
  const req = await fetch(`https://${process.env.KUBO_URL}/api/v0/id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const res = await req.json()
  return c.json(res, 200)
})

app.post('/upload', async (c) => {
  const data = await c.req.formData()
  const file = data.get('file')
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400)
  }
  const formData = new FormData()
  formData.append('file', file)
  const uploadReq = await fetch(`https://${process.env.KUBO_URL}/api/v0/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: formData
  })
  const uploadRes = await uploadReq.json()
  return c.json(uploadRes, 200)
})

export default app
