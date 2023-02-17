/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { IndexTable, Thumbnail, UnstyledLink, Button } from "@shopify/polaris";
import { useState } from "react";
import { useAuthenticatedFetch, useNavigate } from "@shopify/app-bridge-react";
import { ImageMajor } from "@shopify/polaris-icons";
/**
 * @description
 * @export
 * @param {*} { products }
 * @returns {*} 
 * 
 * 
 * "inventoryItem": {
                  "id": "gid://shopify/InventoryItem/46546519261484",
                  "locationsCount": 1,
                  "inventoryLevels": {
                    "edges": [
                      {
                        "node": {
                          "available": 0,
                          "location": {
                            "name": "Shop location"
                          }
                        }
                      }
                    ]
                  }
 */

const updateSelectedProductsInventory_url = "/api/update-products-inventory";
export function SelectedProductsForSync({ products, isLoading }) {
  const [isFetching, setIsFetching] = useState(false);
  const [responseData, setResponseData] = useState({});
  const fetch = useAuthenticatedFetch();

  console.log("products1111:", products);
  const navigate = useNavigate();
  const resourceName = {
    singular: "selected products",
    plural: "selected products",
  };
  const inventoryUpdateParams = [];

  // [x]************************************************
  /**
   * @description
   * https://www.shopify.com/partners/blog/multi-location_and_graphql
   * 更新库存的时候需要 inventoryLevelId
   * 所以, 在商品列表查询的时候就可以把这个 inventoryLevelId 获取
   * 在更新的时候把这个 inventoryLevelId 提交给后台
   *
   * 更新库存query api 是inventoryAdjustQuantity
   * 参数availableDelta 是用来在原有库存基础上进行加减 , 比如原有 10 ,availableDelta = 5 ,
   * 那么 mutation 后就是 10 + 5 = 15
   *
   * 所以, 如果需要给库存设置一个定值的话, 需要先获取当前库存, 然后计算差值 再调用inventoryAdjustQuantity
   * 并且调用inventoryAdjustQuantity 方法后, 库存值可能是个负值
   */
  // [x]************************************************
  const updateProducts = async () => {
    if (products.length === 0) return;
    try {
      setIsFetching(true);
      const response = await fetch(updateSelectedProductsInventory_url, {
        method: "POST",
        body: JSON.stringify(inventoryUpdateParams),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const _responseData = await response.json();
        setResponseData(_responseData);
        console.log("responseData :>> ", _responseData, responseData);
      } else {
        console.log("updateProducts response error:>> ", response);
      }
    } catch (error) {
      console.log("updateProducts error :>> ", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  // [x] 库存更新参数 inventoryUpdateParams
  // [x] 通过父组件传递过来 products 可以获取到需要的 id 等信息 在组件挂载后这个参数就拼接完成
  // [x] 所以提交到后台查询的时候, 就能直接使用这个参数

  const rows = products.map((product, index) => {
    const {
      id,
      image,
      price,
      title,
      inventoryQuantity,
      firstInventoryLevelId,
    } = product;

    //[x] 模拟数据, 比如我们需要把库存设置为这个值
    const mockTargetInventoryQuantity = parseInt(100 * Math.random());
    inventoryUpdateParams.push({
      productId: id,
      inventoryLevelId: firstInventoryLevelId,
      availableDelta: mockTargetInventoryQuantity - inventoryQuantity,
    });

    return (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        onClick={() => {
          navigate(`/test/${id}`);
        }}
      >
        <IndexTable.Cell>
          <Thumbnail
            source={image || ImageMajor}
            alt="placeholder"
            color="base"
            size="small"
          />
        </IndexTable.Cell>

        <IndexTable.Cell>
          <UnstyledLink data-primary-link url={`/test/${id}`}>
            {truncate(title, 25)}
          </UnstyledLink>
        </IndexTable.Cell>

        <IndexTable.Cell>{price}</IndexTable.Cell>

        <IndexTable.Cell>{inventoryQuantity}</IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <>
      <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        selectable={false}
        loading={isLoading}
        headings={[
          { title: "thumbnail", hidden: true },
          { title: "title" },
          { title: "price" },
          { title: "quantity" },
        ]}
        style={{ marginBottom: "200px" }}
      >
        {rows}
      </IndexTable>
      <Button
        primary
        onClick={() => {
          updateProducts();
        }}
        style={{ margin: "10px" }}
      >
        测试随机更新库存
      </Button>
      {isFetching && "正在更新库存......"}
      {Object.keys(responseData).length > 0 && (
        <>
          <p>库存更新结果:</p>
          {JSON.stringify(responseData)}
        </>
      )}
    </>
  );
}

function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
