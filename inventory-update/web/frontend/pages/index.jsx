import { useState, useCallback } from 'react'
import { Card, Page, Layout, TextContainer, Image, Stack, Heading, Form, TextField, FormLayout, EmptyState } from '@shopify/polaris'
import { useForm, useField, notEmptyString } from '@shopify/react-form'
import { TitleBar, ContextualSaveBar, ResourcePicker } from '@shopify/app-bridge-react'
import store from 'store-js'

import { trophyImage } from '../assets'

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg'

export default function HomePage() {
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const onSubmit = (body) => console.log('submit', body)
  const {
    fields: { title },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: 'the title' || '',
        validates: [notEmptyString('default title')],
      }),
    },
    onSubmit,
  })

  const emptyState = !store.get('ids')

  const toggleResourcePicker = useCallback(() => setShowResourcePicker(!showResourcePicker), [showResourcePicker])

  const handleSelection = useCallback((resources) => {
    const idsFromResources = resources.selection.map((product) => product.id)
    console.log("idsFromResources:", idsFromResources)
    setShowResourcePicker(false)
    store.set('ids', idsFromResources)
  }, [])

  return (
    <Page narrowWidth>
      <TitleBar title="同步库存" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack wrap={false} spacing="extraTight" distribution="trailing" alignment="center">
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>使用说明</Heading>
                  <p>我们目前用的是shopify 我们现在需要的是 能把一件代发仓的库存数字 同步到Shopify后台</p>
                  <p>你这边可以做shopify api接口么，是个物流公司 他们一件代发 我想把他们库存可以同步到我shopify</p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: '0 20px' }}>
                  <Image source={trophyImage} alt="Nice work on building a Shopify app" width={120} />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: 'Save',
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: 'Discard',
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card sectioned title="Title">
                <TextField {...title} label="Title" labelHidden helpText="Only store staff can see this title" />
              </Card>

              <Card title="选择商品">
                <TitleBar
                  title="库存同步"
                  // primaryAction={{
                  //   content: 'Select products',
                  //   onAction: toggleResourcePicker,
                  // }}
                />
                <ResourcePicker resourceType="Product" showVariants={false} open={showResourcePicker} onSelection={(resources) => handleSelection(resources)} onCancel={toggleResourcePicker}  />
                {emptyState ? (
                  <Layout>
                    <EmptyState
                      heading="选择需要同步库存的商品"
                      action={{
                        content: 'Select products',
                        onAction: toggleResourcePicker,
                      }}
                      image={img}
                    >
                      <p>选择需要同步库存的商品</p>
                    </EmptyState>
                  </Layout>
                ) : (
                  'You selected products'
                )}
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
