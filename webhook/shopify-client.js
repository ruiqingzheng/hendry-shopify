// doc: https://github.com/Shopify/shopify-api-js#readme
// https://github.com/Shopify/shopify-api-js/blob/main/docs/guides/custom-store-app.md
// node --require('@babel/register') client.js
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
