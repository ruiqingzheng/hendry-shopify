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

/** @type {*}
 * 查询商品价格等库存信息
 * shopify 多仓库库存管理
 * 更新库存必须要inventoryLevels id
 * https://www.shopify.com/partners/blog/multi-location_and_graphql
 *
 */
const GET_PRODUCTS_WITH_INVENTORY_BY_ID = `
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
            inventoryQuantity
            inventoryItem {
              id
              locationsCount
              inventoryLevels(first: 2) {
                edges {
                  node {
                    id
                    available
                    location {
                      name
                       address {
                        city
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`

//[TODO]
//[*]

const test_query_1 = `
mutation {
  item0: inventoryAdjustQuantity(input: {inventoryLevelId: "gid://shopify/InventoryLevel/114573246764?inventory_item_id=46540776374572", availableDelta: 99}) {
    inventoryLevel {
      available
    }
    userErrors {
      field
      message
    }
  }
}
`
const test_query_2 = `
mutation {
  item0: inventoryAdjustQuantity(input: {inventoryLevelId: "gid://shopify/InventoryLevel/114573246764?inventory_item_id=46540776374572", availableDelta: 99}) {
    inventoryLevel {
      available
    }
    userErrors {
      field
      message
    }
  }
  item1: inventoryAdjustQuantity(input: {inventoryLevelId: "gid://shopify/InventoryLevel/114573246764?inventory_item_id=46540776309036", availableDelta: -9974}) {
    inventoryLevel {
      available
    }
    userErrors {
      field
      message
    }
  }
}
`

/****
 *
 * 更新库存
 * 参数 availableDelta ,  是用来在原有库存基础上进行加减 , 比如原有 10 ,availableDelta = 5 ,
 * 那么 mutation 后就是 10 + 5 = 15
 *
 */

export const selectedProductsApi = async (app) => {
  app.use(express.json())

  /**
   * @description
   * 查询前端提交的商品信息 (前端用ResourcePicker获取到用户选择的商品 id)
   * 参数格式:  商品 id 数组
   * ['gid://shopify/Product/8140937527596', 'gid://shopify/Product/8142641889580']
   */

  app.post('/api/selected-products', async (req, res) => {
    try {
      const selectedProductIds = req.body

      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      })

      const adminData = await client.query({
        data: {
          query: GET_PRODUCTS_WITH_INVENTORY_BY_ID,
          // query: GET_PRODUCTS_WITH_INVENTORY_BY_ID,

          /* The IDs that are pulled from the app's database are used to query product, variant and discount information */
          variables: { ids: selectedProductIds },
        },
      })

      const products = adminData.body.data.nodes

      const result = products.map((p) => ({
        title: p.title,
        id: p.id,
        image: p.images.edges[0]?.node.originalSrc,
        price: p.variants.edges[0].node.price,
        inventoryQuantity: p.variants.edges[0].node.inventoryQuantity,
        inventoryItem: p.variants.edges[0].node.inventoryItem,
        firstInventoryLevelId: p.variants.edges[0].node.inventoryItem.inventoryLevels.edges[0].node.id,
      }))

      // console.log('adminData:', adminData.body.nodes)
      // console.log('selected products:', JSON.stringify(products, null, 5))

      res.status(200).send(result)
      // res.status(200).send({ testing: adminData.body.nodes })
    } catch (error) {
      console.log('middleware selectedProductsApi error, ', error)
      res.status(500).send({ error: error.message })
    }
  })

  app.post('/api/update-products-inventory', async (req, res) => {
    const selectedProducts = req.body
    console.log('update-products-inventory params', selectedProducts)
    let query_string = 'mutation {'
    selectedProducts.forEach((product, index) => {
      query_string += `
        item${index}: inventoryAdjustQuantity (input:{
          inventoryLevelId: "${product.inventoryLevelId}", 
          availableDelta:${product.availableDelta} }) {
                                    inventoryLevel {
                                      available
                                    }
                                    userErrors {
                                      field
                                      message
                                    }
        }
      `
    })
    query_string += '}'

    console.log('query_string :>> ', query_string)

    try {
      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      })
     const result = await client.query({
        data: {
          query: query_string,
          variables: {},
        },
      })

      console.log('query result', result)
      const updatedResponse = result.body.data
      res.status(200).send(updatedResponse)
    } catch (error) {
      console.log('middleware update-products-inventory error, ', error)
      res.status(500).send({ error: error.message })
    }
  })
}
