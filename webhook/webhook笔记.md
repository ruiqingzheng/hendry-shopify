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
