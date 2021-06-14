import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from "axios";
import cheerio from 'cheerio'

export default async (request: VercelRequest, response: VercelResponse) => {
  const { url } = request.query
  if (!new URL(url.toString()).hostname.endsWith("github.com")) {
    return response.status(403).end()
  }
  let r;
  try {
    r = await axios(url.toString())
  } catch (e) {
    return response.status(e.response.status).end()
  }
  let $ = cheerio.load(r.data)
  let result = $("meta[property='og:image']").attr()
  if (result) {
    if (result.content.startsWith("https://opengraph.githubassets.com/")) {
      let img = await axios({
        url: result.content,
        responseType: "arraybuffer"
      })
      return response.status(200).setHeader("content-type", img.headers['content-type']).send(img.data)
    }
  }
  response.status(204).end()
}