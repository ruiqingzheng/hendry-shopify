# inventory-update

## 流程

frontend 通过 ResourcePicker 来选择商品, form 提交保存到本地 localstorage

form 提交后, 会重新加载 page/index 页面, 判断本地 localstorage 有已选择商品 ids 则加载 ResourceListWithProducts 组件

ResourceListWithProducts 组件中需要查询 shopify api 获取这些选择的商品信息

有两种方式,

要么前端浏览器环境去查询接口, 也就是 react-apollo [参考地址](https://github.com/Shopify/shopify-demo-app-node-react/blob/master/components/ResourceList.js)

要么使用官网 sample 的方式, 在 node 后端去查询 shopify admin graphql api , 然后提供接口地址给前端去查询

这里使用第二种方式, 也就是在 app node 后端进行 graphql 查询 , 然后提供 restful 接口和 app 前端交互
