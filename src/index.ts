import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { KuboAddResponse } from './types'
import { insertFileIntoQueue } from './utils/db'
import { serve } from '@hono/node-server'


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
  const localOnly = c.req.query("localOnly");
  const rules = c.req.query("rules");
  const data = await c.req.formData()
  const file = data.get('file')
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400)
  }
  const formData = new FormData()
  formData.append('file', file)
  const uploadReq = await fetch(`${process.env.KUBO_URL}/api/v0/add`, {
    method: 'POST',
    body: formData
  })
  console.log(uploadReq.status)
  const uploadRes: KuboAddResponse = await uploadReq.json()
  console.log(uploadRes)
  //  Store data in remote pin queue
  if (rules && (!localOnly || localOnly === "false")) {
    await insertFileIntoQueue(rules, uploadRes.Hash);
  }

  return c.json(uploadRes, 200)
})

app.get('/list', async (c) => {
  const listReq = await fetch(`${process.env.KUBO_URL}/api/v0/pin/ls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const listRes = await listReq.json()
  return c.json(listRes, 300)
})

app.get('/queue', async (c) => {
  try {

  } catch (error) {
    console.log(error);
    return c.json({ message: "Server error" }, 500);
  }
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
