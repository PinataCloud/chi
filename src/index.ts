import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { FilterOptions, KuboAddResponse, RemoteQueue } from './types'
import { deleteFromPinningQueue, getPendingRemotePins, getRemotePinningQueue, insertFileIntoQueue, updateRemotePinStatus } from './utils/db'
import { getAiRecommendation } from './utils/ai'
import { ALLOWED_RULES, config } from '../config'
import { addRemotePinningService, uploadToRemotePinningService } from './utils/pinningService'
import cron from 'node-cron';
import { serve } from '@hono/node-server'
import dotenv from "dotenv";

dotenv.config();

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
  
  const rulesSplit: string[] = rules && rules.includes("+") ? rules ? rules?.split("+") : [rules] : [""];
  rulesSplit.forEach((rule: string) => {
    if(rule !== "" && !ALLOWED_RULES.includes(rule)) {
      return c.json({ message: "Invalid rules" }, 400)
    }
  })

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
  if(rules && (!localOnly || localOnly === "false")) {
    console.log("Adding to queue");
    await insertFileIntoQueue(rules, uploadRes.Hash);
  }

  return c.json(uploadRes, 200)
})

app.get('/pins/list', async (c) => {
  const listReq = await fetch(`${process.env.KUBO_URL}/api/v0/pin/ls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const listRes = await listReq.json()
  return c.json(listRes, 300)
})

app.get('/remote/list', async (c) => {
  try {
    const pending = c.req.query("pending");
    const provider = c.req.query("provider");
    let filterOptions: FilterOptions = {}
    if(pending) {
      filterOptions["pending"] = true;
    }

    if(provider) {
      filterOptions["provider"] = provider.toUpperCase();
    }

    const remotePins = await getRemotePinningQueue(filterOptions)
    return c.json({ data: remotePins }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ message: "Server error" }, 500);
  }
})

const processQueue = async () => {
  try {
    const rows = await getPendingRemotePins();
    console.log(rows);
    for(const row of rows) {
      try {
        //  get suggestion from AI
        const providerChoice = await getAiRecommendation(row.rules);
        console.log({providerChoice});
        if(providerChoice?.toUpperCase() === "PINATA") {
          //  Add remote pinning service if it doesn't exist
          console.log("Adding Pinata as a remote pinning service");
          await addRemotePinningService("pinata", "https://api.pinata.cloud/psa", config.pinataJwt || "");
          console.log("Uploading to Pinata")
          await uploadToRemotePinningService("", "pinata", row.cid);
          console.log("Uploaded!")
        } else if(providerChoice?.toUpperCase() === "FILEBASE") {
          console.log("Adding Filebase as a remote pinning service");
          await addRemotePinningService("filebase", "https://api.filebase.io/v1/ipfs", config.filebaseKey || "")          
          console.log("Uploading to Filebase")
          // await uploadToRemotePinningService("", "filebase", row.cid);
          console.log("Uploaded!")
        } 

        //  If no provider is selected, we keep it local
        //  Then we update the table        
        if(providerChoice) {
          console.log("Updating row")
          await updateRemotePinStatus(row.id, false, providerChoice?.toUpperCase())
        } else {
          console.log("No provider chosen")
        }     
      } catch (error) {
        console.log(error, row);
      }
    }
    console.log("Done!");
  } catch (error) {
    console.log(error);
  }
}

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
  console.log('Running processQueue...');
  processQueue();
});

serve({
  fetch: app.fetch,
  port
})
