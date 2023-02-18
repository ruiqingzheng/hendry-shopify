// doc: https://github.com/Shopify/shopify-api-js#readme
// https://github.com/Shopify/shopify-api-js/blob/main/docs/guides/custom-store-app.md
// node --require('@babel/register') client.js
require('dotenv').config()
import '@shopify/shopify-api/adapters/node'
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api'
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

async function testClient() {
  // Use REST resources to make calls.
  const { count: productCount } = await shopify.rest.Product.count({ session })
  const { count: customerCount } = await shopify.rest.Customer.count({ session })
  const { count: orderCount } = await shopify.rest.Order.count({ session })

  console.log(`There are ${productCount} products, ${customerCount} customers, and ${orderCount} orders in the ${session.shop} store.`)
}

(async function() { await testClient()})()

export default shopify
