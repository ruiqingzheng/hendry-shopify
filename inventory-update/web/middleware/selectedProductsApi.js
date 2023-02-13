import express from 'express'
import shopify from '../shopify.js'

// node 客户端 graphql 请求不需要 gql 包裹
const GET_PRODUCTS_BY_ID = `
query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`

const QR_CODE_ADMIN_QUERY = `
  query nodes($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
      ... on ProductVariant {
        id
        price
      }
      ... on DiscountCodeNode {
        id
      }
    }
  }
`

export const selectedProductsApi = async (app) => {
  app.use(express.json())

  app.post('/api/selected-products', async (req, res) => {
    const selectedProductIds = req.body

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    })

    const adminData = await client.query({
      data: {
        query: GET_PRODUCTS_BY_ID,

        /* The IDs that are pulled from the app's database are used to query product, variant and discount information */
        variables: { ids: selectedProductIds },
      },
    })

    const products = adminData.body.data.nodes

    // console.log('adminData:', adminData)
    console.log('selected products:',JSON.stringify(products,null, 5))

    res.status(200).send(JSON.stringify(selectedProductIds))
  })
}
