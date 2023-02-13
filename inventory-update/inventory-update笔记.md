# inventory-update

参考文章

[shopify 多仓库库存管理](https://www.shopify.com/partners/blog/multi-location_and_graphql) (必读--- 库存更新主要需要这篇文章!!!)

## 流程

frontend 通过 ResourcePicker 来选择商品, form 提交保存到本地 localstorage

form 提交后, 会重新加载 page/index 页面, 判断本地 localstorage 有已选择商品 ids 则加载 ResourceListWithProducts 组件

ResourceListWithProducts 组件中需要查询 shopify api 获取这些选择的商品信息

有两种方式,

要么前端浏览器环境去查询接口, 也就是 react-apollo [参考地址](https://github.com/Shopify/shopify-demo-app-node-react/blob/master/components/ResourceList.js)

要么使用官网 sample 的方式, 在 node 后端去查询 shopify admin graphql api , 然后提供接口地址给前端去查询

这里使用第二种方式, 也就是在 app node 后端进行 graphql 查询 , 然后提供 restful 接口和 app 前端交互

## 获取商品价格

```js
// variables
{
  "ids":  ["gid://shopify/Product/8140937527596"]
}

// gql 查询
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


```

## 更新商品价格

```js

// mutation , change price
 mutation productVariantUpdate($input: ProductVariantInput!) {
   productVariantUpdate(input: $input) {
     product {
       title
     }
     productVariant {
       id
       price
     }
   }
 }

 // query variable
 {
  "input": {
    "id": "gid://shopify/ProductVariant/44491218518316",
    "price": 100
  }
}
```

注意在更新价格的时候需要的 id 并不是商品 id 而是价格对象的 id

在查询商品的时候返回的数据中有 variants 对象, 里面对每个属性都有独立的 id

所以, 需要改变商品价格的时候查询中提交的 id 其实是某个属性 id 而不是商品 id

```js
{
  "data": {
    "nodes": [
      {
        "title": "dry moon car",
        "handle": "dry-moon",
        "descriptionHtml": "",
        "id": "gid://shopify/Product/8140937527596",
        "images": {
          "edges": [
            {
              "node": {
                "originalSrc": "https://cdn.shopify.com/s/files/1/0720/7131/5756/products/car1.jpg?v=1675763715",
                "altText": null
              }
            }
          ]
        },
        "variants": {
          "edges": [
            {
              "node": {
                "price": "100000.00",
                "id": "gid://shopify/ProductVariant/44491218518316"
              }
            }
          ]
        }
      }
    ]
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 7,
      "actualQueryCost": 7,
      "throttleStatus": {
        "maximumAvailable": 1000,
        "currentlyAvailable": 993,
        "restoreRate": 50
      }
    }
  }
}
```

// 更新库存

```js
mutation productVariantUpdate($input: ProductVariantInput!) {
  productVariantUpdate(input: $input) {
    product {
      title
    }
    productVariant {
      id
      price
      inventoryQuantity
    }
  }
}

// variables
 {
  "input": {
    "id": "gid://shopify/ProductVariant/44491218518316",
    "price": 100,
     "inventoryQuantities": [
      {
        "availableQuantity": 1,
        "locationId": "gid://shopify/Location/78189232428"
      }
    ]
  }
}

```
