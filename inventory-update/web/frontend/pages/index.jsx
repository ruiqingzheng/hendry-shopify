/* eslint-disable react/react-in-jsx-scope */
import { useState, useCallback } from "react";
import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Heading,
  Form,
  TextField,
  Button,
  FormLayout,
  // EmptyState,
  Link,
} from "@shopify/polaris";
import { useForm, useField, notEmptyString } from "@shopify/react-form";
import {
  // TitleBar,
  ContextualSaveBar,
  ResourcePicker,
} from "@shopify/app-bridge-react";
import store from "store-js";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
// import ResourceListWithProducts from "../components/ResourceListWithProducts";

import { trophyImage } from "../assets";
// import ResourceListWithProducts from "../components/ResourceListWithProducts";
import { SelectedProductsForSync } from "../components/SelectedProductsForSync";

// const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";
const getSelectedProductsInfo_url = "/api/selected-products";

export default function HomePage() {
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  //[x] 处理用户提交表单 onSubmit 只会获取 useForm 里面的 field 字段内容
  const onSubmit = (body) => {
    console.log("submit body:", body);
    return { status: "success" };
  };

  const fetch = useAuthenticatedFetch();

  const fetchProducts = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(getSelectedProductsInfo_url, {
        method: "POST",
        body: JSON.stringify(store.get("ids")),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const responseProducts = await response.json();
        setResponseData(responseProducts);
        console.log("responseProducts:>> ", responseProducts);
      }
    } catch (error) {
      console.log("error:>> ", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  // const onSubmit = (body) => {

  // };

  const {
    fields: { title },
    dirty,
    reset,
    submitting,
    submit,
  } = useForm({
    fields: {
      title: useField({
        value: "3" || "",
        validates: [notEmptyString("default title")],
      }),
    },
    onSubmit,
  });

  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  );

  //[x] 处理用户选择商品 当用户选择了商品那么需要在这里去查询后台
  const handleSelection = useCallback((resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    console.log("idsFromResources:", idsFromResources);
    setShowResourcePicker(false);
    store.set("ids", idsFromResources);
    fetchProducts();
  }, []);

  return (
    <Page narrowWidth>
      {/* <TitleBar title="同步库存" primaryAction={null} /> */}
      {/* <TitleBar
                  title="库存同步"
                  primaryAction={{
                    content: "Select products",
                    onAction: toggleResourcePicker,
                  }}
                /> */}
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>使用说明</Heading>
                  <p>
                    我们目前用的是shopify 我们现在需要的是
                    能把一件代发仓的库存数字 同步到Shopify后台
                  </p>
                  <p>
                    你这边可以做shopify api接口么，是个物流公司 他们一件代发
                    我想把他们库存可以同步到我shopify
                  </p>

                  <Link url="/test"> go test page</Link>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card sectioned title="设置同步间隔时间">
                <TextField
                  {...title}
                  label="Title"
                  labelHidden
                  helpText="请输入整数, 单位秒"
                />
              </Card>

              <Card sectioned title="选择需要同步库存的商品">
                <ResourcePicker
                  resourceType="Product"
                  showVariants={false}
                  open={showResourcePicker}
                  onSelection={(resources) => handleSelection(resources)}
                  onCancel={toggleResourcePicker}
                />
                <Button primary onClick={toggleResourcePicker}>
                  Add product
                </Button>
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>

        <Layout.Section>
          <Card
            title={
              isFetching ? "正在查询选择的商品...." : "已选择同步库存的商品"
            }
            actions={[{ content: "选择商品", onAction: toggleResourcePicker }]}
          >
            <SelectedProductsForSync
              products={responseData}
              isLoading={isFetching}
            ></SelectedProductsForSync>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
