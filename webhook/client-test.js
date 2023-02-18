import { client, session } from './shopify-client'

async function testClient() {
  //   // Use REST resources to make calls.
  //   const { count: productCount } = await client.Product.count({session})
  //   const { count: customerCount } = await client.Customer.count({session})
  //   const { count: orderCount } = await client.Order.count({session})
  //   console.log(`There are ${productCount} products, ${customerCount} customers, and ${orderCount} orders in the ${session.shop} store.`)

  const getResponse = await client.get({
    path: 'products',
  })
  // console.log(getResponse.headers, getResponse.body)
  // console.log('response body :>> ', getResponse.body)
  const products = getResponse.body.products

  const testId = products[1].id
  const originTitle = products[1].title
  const body = { product: { title: 'Mountaineering backpack' } }

  // console.log('testId :>> ', testId, "originTitle:", originTitle);
  if (testId) {
    const putResponse = await client.put({
      path: `products/${testId}`,
      data: body
    })
    // console.log(putResponse.headers, putResponse.body)
    console.log(putResponse.body)
  }

  // 修改某个产品的标题
}

;(async function() {
  await testClient()
})()
