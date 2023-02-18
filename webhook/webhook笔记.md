# webhook

shopify admin 后台创建 webhook 和 custom app

自定义 webhook 商品更新则触发事件发送 json 数据给指定地址

custom app 通过 ngrok 提供服务, 接受 webhook 触发的事件获取数据

自定义 app 获取到商品数据后, 通过 admin api 给商品更新 tags 属性

## 验证 webhook 数据

node 环境验证 webhook 数据
<https://medium.com/@scottdixon/verifying-shopify-webhooks-with-nodejs-express-ac7845c9e40a>
Shopify webhooks: HMAC validation on NodeJS Express
<https://medium.com/@jophin.joseph88/shopify-webhooks-hmac-validation-on-nodejs-express-ac66bc288e3e>

/\*\*\*\*

- <https://medium.com/@scottdixon/verifying-shopify-webhooks-with-nodejs-express-ac7845c9e40a>
- <https://gist.github.com/scottdixon/3d8ea3ab939f5935b486951d63aebd6d>
- shopify webhook 验证注意
-
- 'x-shopify-hmac-sha256' 值是对发送的 buffer 进行加密后的 hash 串
- 而 express app.use(express.json()) 后的 req.body 是对 buffer 读取为 json 字符串并 parse 为 json 对象了
- 所以, 如果 use express.json 后的 req.body 来进行加密, 得到 hash 后再比较就一定是验证失败的
-
- 所以只能先获取到 buffer , 然后对 buffer 进行加密后比较 , 于是不能使用 app.use(express.json()) , 因为那样 buffer 就已经被读取, getRawBody 无法获取流
- 使用 raw-body getRawBody(req) 得到 buffer 后, JSON.parse(buffer.toString()) 即可获取到 json 对象
- \*/

```js
const getRawBody = require('raw-body')

const body = await getRawBody(req)

console.log('hmac_header :>> ', hmac_header, 'rowBody:', body)
if (!verifyWebhook(body, hmac_header)) {
  console.log('webhook data verify failed :>> ')
  res.status(200).send('webhook works!')
  return
}

function verifyWebhook(payload, hmac) {
  const genHash = crypto.createHmac('sha256', process.env.WEBHOOK_SIGN_KEY).update(payload, 'utf8', 'hex').digest('base64')
  return genHash === hmac
}
```

## admin api 更新 tag

webhook 触发事件是商品更新, 获取到商品信息后, 可以通过 custom app 设置这个商品 tag

<https://github.com/Shopify/shopify-api-js/blob/main/docs/reference/clients/Rest.md>

安装依赖, rest api 只需 `@shopify/shopify-api`

```sh
yarn add @shopify/shopify-api
```

```js
// 首先获取 rest client
require('dotenv').config()
import '@shopify/shopify-api/adapters/node'
import { shopifyApi, LATEST_API_VERSION, Session, ApiVersion } from '@shopify/shopify-api'
import { restResources } from '@shopify/shopify-api/rest/admin/2023-01'

const shopify = shopifyApi({
  apiKey: process.env.API_KEY,
  apiSecretKey: process.env.CUSTOM_APP_TOKEN, // Note: this is the API access token, NOT the API Secret Key
  apiVersion: LATEST_API_VERSION,
  isCustomStoreApp: true, // this MUST be set to true (default is false)
  scopes: [],
  isEmbeddedApp: false,
  hostName: 'hendry-dev-store.myshopify.com',
  // Mount REST resources.
  restResources,
})

export const session = shopify.session.customAppSession('hendry-dev-store.myshopify.com')

export const client = new shopify.clients.Rest({
  session,
  apiVersion: ApiVersion.January23,
})
export default shopify
```

// 在 webhook 获取数据后通过 rest client 更新产品数据
// 比如 , 商品信息更新, webhook 发送通知事件, custom app 接受到数据后得到 id 等信息更新这个产品的 tags

```js
const webhookData = JSON.parse(body.toString())

console.log('webhookData :>> ', webhookData)
const targetProductId = webhookData.id
const updateInfo = {
  product: {
    tags: webhookData.tags + ', updated',
  },
}

await client.put({
  path: `products/${targetProductId}`,
  data: updateInfo,
})
```

## babel

node 环境使用 es module 需要 babel-register

```bash
yarn add  -D @babel/core @babel/cli @babel/preset-env @babel/register core-js@3.27.2
./node_modules/.bin/nodemon --require @babel/register index.js
```

// 修改 babelrc

```js
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry",
        "corejs": "3.22"
      }
    ]
  ]
}
```
