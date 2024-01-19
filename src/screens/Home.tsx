import { View, Text, StyleSheet, Image, Dimensions, TouchableWithoutFeedback, FlatList, ActivityIndicator, NativeModules, StatusBar, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { hasHomeIndicator, theme } from '../constants/theme'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import logoDark from '../../assets/logo-dark.png'
import logo from '../../assets/logo.png'
import SubscribeComponent from '../components/home/SubscribeComponent'
import { HomeStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuthContext } from '../context/AuthContext'
import { config } from '../../config'
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext'
import ProductCard from '../components/shared/ProductCard'
// import { useNavigationContext } from '../context/NavigationContext'


const windowHeight = Dimensions.get('window').height - 50 - (hasHomeIndicator ? 30 : 0)
const screenWidth = Dimensions.get('screen').width;

type Props = NativeStackScreenProps<HomeStackParamList, 'Collection'>

const Home = ({ navigation }: Props) => {
  const { userToken } = useAuthContext()
  const [collections, setCollections] = useState<any[]>([])
  const [forYou, setForYou] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const { rootNavigation } = useNavigationContext()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [userOrders, setUserOrders] = useState(0);


  const { StatusBarManager } = NativeModules
  const [sbHeight, setsbHeight] = useState<any>(StatusBar.currentHeight)

  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBarManager.getHeight((statusBarHeight: any) => {
        setsbHeight(Number(statusBarHeight.height))
      })
    }
  }, [])

  useEffect(() => {
    if (!userToken && rootNavigation) {
      rootNavigation.navigate('LoginStackNavigator', {
        screen: 'Login',
      });
    }
  }, [userToken, rootNavigation]);

  const fetchUserOrders = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const query = `query {
        customer(customerAccessToken: "${userToken.accessToken}") {
          orders(first: 100) {
            nodes {
              id
            }
          }
        }
      }`

      const response: any = await storefrontApiClient(query)

      if (response.errors && response.errors.length != 0) {
        setIsLoading(false)
        throw response.errors[0].message
      }

      const userOrders = response.data.customer.orders.nodes.length
      setUserOrders(userOrders);
      setIsLoading(false)

    } catch (e) {
      console.log(e)
    }
  }

  const fetchForYou = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (userToken) {
      try {
        const query = `query {
          customer(customerAccessToken: "${userToken.accessToken}") {
            orders(first: 30, reverse: true) {
              nodes {
                lineItems(first: 30) {
                  nodes {
                   quantity
                   variant {
                     product {
                       id
                       title
                       description
                       vendor
                       availableForSale
                       compareAtPriceRange {
                         minVariantPrice {
                           amount
                           currencyCode
                         }
                       }
                       priceRange {
                         minVariantPrice {
                           amount
                           currencyCode
                         }
                       }
                       images(first: 10) {
                         nodes {
                           url
                           width
                           height
                         }
                       }
                       options {
                         id
                         name
                         values
                       }
                       variants(first:200) {
                         nodes {
                           availableForSale
                           selectedOptions {
                             value
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

        const response: any = await storefrontApiClient(query)

        if (response.errors && response.errors.length != 0) {
          setIsLoading(false)
          throw response.errors[0].message
        }

        const forYouProducts = response.data.customer.orders.nodes

        let productCounts = {};

        forYouProducts.forEach((order: { lineItems: { nodes: { variant: { product: { id: any; title: any } }; quantity: any }[] } }) => {
          order.lineItems.nodes.forEach((lineItem: { variant: { product: { id: any; title: any } }; quantity: any }) => {
            if (lineItem.variant && lineItem.variant.product) {
              const productId = lineItem.variant.product.id;
              const productName = lineItem.variant.product.title;
              if (productCounts[productId]) {
                productCounts[productId].quantity += lineItem.quantity;
              } else {
                productCounts[productId] = { quantity: lineItem.quantity, name: productName, ...lineItem.variant.product };
              }
            }
          });
        });

        const sortedProducts = Object.entries(productCounts)
          .filter(([, quantity]) => quantity !== undefined)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 20)
          .map(([key, value]) => value); // map to get rid of keys

        setForYou(sortedProducts)
        setIsLoading(false)

      } catch (e) {
        console.log(e)
      }
    }
  }

  const fetchAllProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const query = `query {
        products(first: 100) {
          nodes {
            id
            title
            description
            vendor
            availableForSale
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              nodes {
                url
                width
                height
              }
            }
            options {
              id
              name
              values
            }
            variants(first: 200) {
              nodes {
                availableForSale
                selectedOptions {
                  value
                }
              }
            }
          }
        }
      }`

      const response: any = await storefrontApiClient(query)

      if (response.errors && response.errors.length != 0) {
        setIsLoading(false)
        throw response.errors[0].message
      }
      const products = response.data.products.nodes
      setAllProducts(products)
      setIsLoading(false)

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchForYou()
    fetchAllProducts()
    fetchUserOrders()
  }, [userToken])

  const HomeList = ({ data }) => (
    <FlatList
      data={data}
      renderItem={({ item }) => <ProductCard data={item} />}
      keyboardDismissMode='on-drag'
      showsVerticalScrollIndicator={false}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      ListHeaderComponent={() => (
        <View style={{ marginHorizontal: -14 }}>
          <View style={{
            backgroundColor: theme.colors.text,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16, marginTop: 44 + sbHeight
          }}>
            <Text style={{
              color: theme.colors.background,
              fontSize: 18,
              letterSpacing: 1.8,
              fontWeight: '500'
            }}>FOR YOU</Text>
          </View>
          {/* <Text style={styles.text}>Check out our curated selection of products.</Text> */}
        </View>
      )}
    />
   );

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {isLoading ? (
        <ActivityIndicator style={{ alignSelf: 'center' }} />
      ) : (
        <HomeList data={allProducts}/>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    height: windowHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  text: {
    color: theme.colors.text
  },
  collectionTitle: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    color: theme.colors.text,
    fontWeight: '600',
    letterSpacing: 7,
  },
  logo: {
    backgroundColor: 'transparent',
    position: 'absolute',
    resizeMode: 'contain',
    width: config.logoWidth,
    height: config.logoWidth * config.logoSizeRatio,
    top: 72,
    left: 24
  }
})

export default Home