import { StyleSheet, Dimensions, Image, FlatList, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StackParamList } from '../types/navigation'
import { hasHomeIndicator, theme } from '../constants/theme'
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet"
import FillButton from '../components/shared/FillButton'
import OutlineButton from '../components/shared/OutlineButton'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import { CartItem, Product } from '../types/dataTypes'
import ProductCard from '../components/shared/ProductCard'
import { useCartContext } from '../context/CartContext'
import { FontAwesome } from '@expo/vector-icons'
import { useWishlistContext } from '../context/WishlistContext'
import { useNavigationContext } from '../context/NavigationContext'
import { CartIcon } from '../components/shared/Icons'

const screenWidth = Dimensions.get('screen').width
const windowHeight = Dimensions.get('window').height

type Props = NativeStackScreenProps<StackParamList, 'ProductScreen'>

const ProductScreen = ({ route, navigation }: Props) => {
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlistContext()
  const { data } = route.params
  const { addItemToCart } = useCartContext()
  const { rootNavigation } = useNavigationContext();
  const { getItemsCount, cartItems } = useCartContext();
  let cartItemCount = getItemsCount();
  const { addQuantityOfItem, substractQuantityOfItem } = useCartContext()
  const [itemQuantity, setItemQuantity] = useState(0)


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => {
            navigation.goBack()
            navigation.push('Cart')
          }}>
            <CartIcon color="#4a307e" size={24} />
            {cartItemCount > 0 && (
              <View style={{
                position: 'absolute',
                right: -1,
                bottom: -5,
                backgroundColor: '#4a307e',
                borderRadius: 10,
                width: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{
                  color: 'white',
                  // fontSize: 10,
                  fontWeight: 'bold'
                }}>
                  {cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      )
    })
  }, [wishlist, cartItemCount])

  useEffect(() => {
    try {
      getProductRecommendations()
    } catch (e) {
      setTimeout(() => {
        getProductRecommendations()
      }, 5000)
      console.log(e)
    }

  }, [])

  const [selectedOptions, setSelectedOptions] = useState<{ name: string; value: string | null }[]>(
    data.options.map((option) => (
      {
        name: option.name,
        value: option.values.length == 1 ? option.values[0] : null
      }
    )
    ))

  const selectedItem = useMemo(() => data.variants.nodes.find((item) => {
    return item.selectedOptions.every((option, index) => {
      if (option.value != selectedOptions[index].value) {
        return false
      }
      return true
    })
  }) || null, [selectedOptions])
  const noVariants = useMemo(() => data.variants.nodes.length <= 1 && data.variants.nodes[0].selectedOptions.length <= 1 && data.variants.nodes[0].selectedOptions[0].value == 'Default Title', [data])

  var bottomSheetMode: 'add' | 'buy' = 'add'
  const [bottomSheetModeState, setBottomSheetModeState] = useState<'add' | 'buy'>('add')
  const snapPoints = useMemo(() => [350, "80%"], [])
  const snapPoints2 = useMemo(() => [220], [])
  const snapPoints3 = useMemo(() => [240], [])
  const sheetRef2 = useRef<BottomSheet>(null)
  const sheetRef3 = useRef<BottomSheet>(null)
  const showBuyBottomSheet = useCallback(() => {
    sheetRef2.current?.snapToIndex(0)
  }, [])

  const [productRecommendations, setProductRecommendations] = useState<Product[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const getProductRecommendations = async () => {

    const query = `query getProductRecommendations {
      productRecommendations(productId: "${data.id}") {
        id
        title
        description
        vendor
        availableForSale
        options {
          id
          name
          values
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first:200) {
          nodes {
            availableForSale
            selectedOptions {
              value
            }
          }
        }
        images(first: 10) {
          nodes {
            url
            width
            height
          }
        }
      }
    }`

    const response: any = await storefrontApiClient(query)

    if (response.errors && response.errors.length != 0) {
      throw response.errors[0].message
    }

    setProductRecommendations(response.data.productRecommendations.slice(0, 4) as Product[])
  }

  const addToCart = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const query = `query getProductById($id: ID!) {
        product(id: $id) {
          variantBySelectedOptions(selectedOptions: ${JSON.stringify(selectedOptions).replaceAll(`"name"`, `name`).replaceAll(`"value"`, `value`)}) {
            id
            title
            image {
              url
              width
              height
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            product {
              title
            }
            availableForSale
            quantityAvailable
            selectedOptions {
              value
            }
          }
        }
      }`

      const variables = { id: data.id }

      const response: any = await storefrontApiClient(query, variables)

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }

      addItemToCart(response.data.product.variantBySelectedOptions as CartItem, itemQuantity)
      //console.log(bottomSheetMode)
      if (bottomSheetMode == 'buy') {
        navigation.goBack()
        navigation.push('Cart')
      } else {
        sheetRef3.current.snapToIndex(0)
        sheetRef2.current.close()
      }

    } catch (e) {
      if (typeof e == 'string') {
        setErrorMessage(e)
      } else {
        setErrorMessage('Something went wrong. Try again.')
      }
    }

    setIsLoading(false)
  }

  return (
    <View style={{ flex: 1, marginBottom: hasHomeIndicator ? 14 : 0 }}>
      <FlatList
        data={data.images.nodes || []}
        renderItem={({ item }) => <Image source={{ uri: item.url }} style={styles.image} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <BottomSheet
        snapPoints={snapPoints}
        style={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text, borderRadius: 0, height: 2 }}
        backgroundComponent={() => <View style={{ backgroundColor: theme.colors.background }}></View>}
      >
        <BottomSheetScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ backgroundColor: theme.colors.background }}
        >
          <View style={{ width: '100%' }}>
            <Text style={styles.title}>{data.title.toUpperCase()}</Text>
            <Text style={styles.price}>{data.priceRange.minVariantPrice.amount} USD</Text>
            {data.availableForSale ?
              <>
                {isLoading ?
                  <ActivityIndicator size='small' style={{ alignSelf: 'center', marginTop: 30.5 }} /> :
                  <>
                    {noVariants && errorMessage != '' ?
                      <Text style={{ color: 'red', alignSelf: 'center', marginTop: 24 }}>{errorMessage}</Text> :
                      <View style={{ flexDirection: 'row', width: '100%' }}>
                        <View style={styles.buttonsContainer}>
                          {itemQuantity > 0 ? (
                            <TouchableOpacity 
                              onPress={() => {
                                bottomSheetMode = 'add'
                                setBottomSheetModeState('add')
                                if (!noVariants) {
                                  setTimeout(() => showBuyBottomSheet(), 1)
                                } else {
                                  addToCart()
                                }
                              }}>
                              <View style={styles.addCartContainer}>
                                <Text style={styles.addCartText}>Add to Cart</Text>
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity 
                              disabled={true}
                              onPress={() => {
                                bottomSheetMode = 'add'
                                setBottomSheetModeState('add')
                                if (!noVariants) {
                                  setTimeout(() => showBuyBottomSheet(), 1)
                                } else {
                                  addToCart()
                                }
                              }}>
                              <View style={styles.addCartDisabledContainer}>
                                <Text style={styles.addCartDisabledText}>Add to Cart</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.quantitySelector}>
                          <TouchableOpacity
                              onPress={() => {
                                if (itemQuantity < 100) {
                                  setItemQuantity(itemQuantity + 1)
                                }
                              }}
                            >
                              {/* <Text style={{ color: '#4B2D83', fontWeight: 'bold', fontSize: Platform.OS == 'ios' ? 22 : 17, paddingHorizontal: 8, paddingVertical: 4 }}>+</Text> */}
                              <FontAwesome name="angle-up" size={32} color='#4B2D83' />
                            </TouchableOpacity>
                            <Text style={{ color: '#4B2D83', fontWeight: 'bold', fontSize: Platform.OS == 'ios' ? 22 : 17, paddingHorizontal: 8, paddingVertical: 4 }}>{itemQuantity}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                if (itemQuantity > 1) {
                                  setItemQuantity(itemQuantity - 1)
                                }
                              }}
                            >
                              <FontAwesome name="angle-down" size={32} color='#4B2D83' />
                            </TouchableOpacity>
                          </View>
                      </View>
                    }
                  </>
                }
              </> :
              <Text style={[styles.text, { marginTop: 32 }]}>Out of stock.</Text>
            }

            {data.description.length != 0 && <Text style={styles.subTitle}>DESCRIPTION</Text>}
            {data.description.length != 0 && <Text style={styles.subTitle}>{data.description}</Text>}
            {/* <Text style={styles.subTitle}>VENDOR: {data.vendor.toUpperCase()}</Text> */}
            <Text style={styles.subTitle}>DISCOVER MORE</Text>
          </View>

          <FlatList
            data={productRecommendations}
            scrollEnabled={false}
            renderItem={({ item }) => <ProductCard data={item} />}
            keyboardDismissMode='on-drag'
            showsVerticalScrollIndicator={false}
            numColumns={2}
            contentContainerStyle={{ paddingTop: 16 }}
          />
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        snapPoints={snapPoints2}
        index={-1}
        enablePanDownToClose={true}
        ref={sheetRef2}
        style={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text, borderRadius: 0, height: 2 }}
        backgroundComponent={() => <View style={{ backgroundColor: theme.colors.background }}></View>}
      >
        <BottomSheetView style={{ flex: 1, marginHorizontal: 14, paddingBottom: 14, justifyContent: 'space-between' }}>
          <View>
            {data.options.map((option, index) => (
              <View
                style={{ marginTop: 4 }}
                key={option.id}
              >
                <Text style={styles.optionTitle}>{option.name}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -14 }}
                >
                  {
                    option.values.map((item) => (
                      <TouchableOpacity
                        onPress={() => setSelectedOptions(selectedOptions => selectedOptions.map(selectedOption =>
                          selectedOption.name == option.name ?
                            { name: selectedOption.name, value: item } :
                            { name: selectedOption.name, value: selectedOption.value }
                        ))}
                        key={item}
                      >
                        <Text
                          style={[
                            styles.optionValue,
                            selectedOptions[index].value == item ? { backgroundColor: theme.colors.text, color: theme.colors.background } : null
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))
                  }
                </ScrollView>
              </View>
            ))}
          </View>          
        </BottomSheetView>
      </BottomSheet>

      {/* Succesfully added to the cart message bottom sheet. */}
      <BottomSheet
        snapPoints={snapPoints3}
        index={-1}
        enablePanDownToClose={true}
        ref={sheetRef3}
        style={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text, borderRadius: 0, height: 2 }}
        backgroundComponent={() => <View style={{ backgroundColor: theme.colors.background }}></View>}
      >
        <BottomSheetView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.text}>Item was added succesfully to the cart.</Text>
          <TouchableOpacity onPress={() => {
            navigation.goBack()
            navigation.push('Cart')
          }}>
            <Text style={[styles.text, { marginTop: 8, fontWeight: '600', paddingBottom: 24 }]}>Visualize</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.text,
    letterSpacing: 1.5,
    alignSelf: 'center'
  },
  image: {
    width: screenWidth - 50, // reduce the width by 100 units
    height: (windowHeight - 100) / 1.3, // reduce the height by half after subtracting 100 units
    resizeMode: 'contain', // maintain the aspect ratio of the image
    alignSelf: 'center', // center the image horizontally
  },
  container: {
    flex: 1,
    marginHorizontal: 14,
    backgroundColor: theme.colors.background
  },
  title: {
    color: 'black',
    fontWeight: '400',
    letterSpacing: 1.5,
    fontSize: 15
  },
  subTitle: {
    color: theme.colors.text,
    fontWeight: '300',
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: 16,
  },
  optionTitle: {
    color: theme.colors.text,
    letterSpacing: 1.5,
    marginTop: 4
  },
  optionValue: {
    color: theme.colors.text,
    letterSpacing: 1.5,
    marginLeft: 6,
    marginTop: 8,
    marginBottom: 5.5,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  price: {
    color: '#4B2D83',
    fontWeight: '600',
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: 4
  },
  buttonsContainer: {
    flexDirection: 'row',
    // justifyContent: 'center', // Align the 'ADD TO CART' button to the left
    marginTop: 30,
    bottom: -10,
    flex: 1, 
  },
  quantitySelector: {
    // position: 'absolute',
    right: -30,
    // top: -35,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'flex-end', // Align the quantity selector to the right
    flex: 1,
  },
  addCartContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4B2D83', 
    alignItems:'center',
    width: 250,
  },
  addCartText: {
    color: '#FFFFFF', 
    fontSize:12, 
    letterSpacing:1,
    fontWeight: 'bold'
  },
  addCartDisabledContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#D9D9D9', 
    backgroundOpacity: 0.4,
    borderColor: '#4B2D83',
    borderOpacity: 0.2,
    borderWidth: 0.5,
    alignItems:'center',
    width: 250,
  },
  addCartDisabledText: {
    color: theme.colors.text, 
    fontSize:12, 
    letterSpacing:1,
    fontWeight: '500'
  }
})

export default ProductScreen