## Chi

**A light and portable IPFS sync engine**

Chi provides an easy way to sync files local IPFS files with pinning services like [Pinata](https://pinata.cloud). By setting the `KUBO_URL` you can interface an IPFS node running locally or in a cloud environment. Additional pinning services can be added as well through the `config.ts` file by providing the name, endpoint, and API key for the service.

## Quickstart

In this quickstart we'll show you how to start using Chi along side a Kubo node

### IPFS Kubo Setup

To start using Chi make sure you already have an IPFS node available.

**Local**

[Install Kubo](https://docs.ipfs.tech/install/command-line/#system-requirements) and then run the daemon in your terminal:

```bash
ipfs daemon
```

This will make your node accessible through `http://127.0.0.1:5001` (aka your `KUBO_URL`)

**Cloud**

There are multiple ways you can run Kubo in cloud infrastructure. One of the easiest we've seen is through a Docker image through a service like [Railway](https://railway.com). Simply spin up a new app, click `+Create` in the top right, then select `Docker Image`. Then use `ipfs/kubo` as the name. This should spin up the daemon automatically, and you will either need to make the endpoint accessible or connect Chi to it in Railway as well.

### Chi Setup

Clone the repo and install dependencies

```bash
git clone https://github.com/PinataCloud/chi
cd chi
npm install
```

Rename the `.env.example` file to `.env` and edit the `KUBO_URL` if applicable. There is also a `PINATA_JWT` variable if you want to use Pinata as a pinning service. In the `config.ts` file you can edit or add more pinning services you want to sync with.

After the variables are filled out start up the server with the command below:

```bash
npm run dev
```

This should spin up a dev server on `http://localhost:3000` where the API can be accessed

## Usage

The Chi API has just two simple endpoints you can use to upload files and list them

**`POST /upload`**

Using a multipart formdata request you can upload a file to your IPFS node which will then trigger a sync upload to your pinning service. Here's an example in Typescript:

```typescript
const file = new File(["Hello IPFS!"], "hello.txt", { type: "plain/text" })
const data = new FormData()
data.append("file", file)
const request = await fetch("http://localhost:3000/upload", {
  method: "POST",
  body: data
})
const response = await request.json()
console.log(response)
```

**`GET /pins/list`**

Get a list of your pins by making a simple GET request to `/pins/list`

```typescript
const request = await fetch("http://localhost:3000/pins/list")
const response = await request.json()
console.log(response)
```
