require('dotenv').config()
const crypto = require('crypto')
const express = require('express')
const getRawBody = require('raw-body')
const app = express()
const port = 3000
// app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello World!')
})
/****
 * https://medium.com/@scottdixon/verifying-shopify-webhooks-with-nodejs-express-ac7845c9e40a
 * https://gist.github.com/scottdixon/3d8ea3ab939f5935b486951d63aebd6d
 * shopify webhook 验证注意
 *  
 * 'x-shopify-hmac-sha256' 值是对发送的 buffer 进行加密后的 hash 串
 * 而 express app.use(express.json()) 后的 req.body 是对 buffer 读取为 json 字符串并 parse 为 json 对象了
 * 所以, 如果use express.json 后的 req.body 来进行加密, 得到 hash 后再比较就一定是验证失败的
 * 
 * 所以只能先获取到 buffer , 然后对 buffer 进行加密后比较 , 于是不能使用 app.use(express.json()) , 因为那样 buffer 就已经被读取, getRawBody 无法获取流
 * 使用raw-body  getRawBody(req) 得到 buffer 后,  JSON.parse(buffer.toString()) 即可获取到 json 对象
 * 
 */

function verifyWebhook(payload, hmac) {
  const genHash = crypto.createHmac('sha256', process.env.WEBHOOK_SIGN_KEY).update(payload, 'utf8', 'hex').digest('base64')
  return genHash === hmac
}

app.post('/webhook/demo', async (req, res) => {
  // 需要验证 HTTP_X_SHOPIFY_HMAC_SHA256
  const hmac_header = req.headers['x-shopify-hmac-sha256']
  const body = await getRawBody(req)

  console.log('hmac_header :>> ', hmac_header, 'rowBody:', body)
  if (!verifyWebhook(body, hmac_header)) {
    console.log('webhook data verify failed :>> ')
    res.status(200).send('webhook works!')
    return
  }

  const webhookData = JSON.parse(body.toString())

  console.log('webhookData :>> ', webhookData);

  res.status(200).send('webhook works!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
