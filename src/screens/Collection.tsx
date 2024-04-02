import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Image, Dimensions, NativeModules, StatusBar, Platform, TouchableOpacity } from 'react-native'
import { BackArrow, BackArrowIcon } from '../components/shared/Icons'
import ProductCard from '../components/shared/ProductCard'
import { theme } from '../constants/theme'
import { Product } from '../types/dataTypes'
import { MenuStackParamList } from '../types/navigation'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import logo from '../../assets/logo.png'
import splash from '../../assets/splash.png'

const screenWidth = Dimensions.get('screen').width

type Props = NativeStackScreenProps<MenuStackParamList, 'Collection'>

const Collection = ({ route, navigation }: Props) => {
  const { collectionId } = route.params
  const { getId } = navigation
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [pTop, setPTop] = useState<number>(0)

  const [collection, setCollection] = useState<any | null>(null)
  const { StatusBarManager } = NativeModules
  const [sbHeight, setsbHeight] = useState<any>(StatusBar.currentHeight)

  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBarManager.getHeight((statusBarHeight: any) => {
        setsbHeight(Number(statusBarHeight.height))
        // console.log(statusBarHeight.height)
      })
    }
  }, [])

  useEffect(() => {
    console.log('route params', route.params)
    console.log(String(navigation.getState().routes[0].name) === 'Home')
    if (String(navigation.getState().routes[0].name) === 'Home') {
      StatusBarManager.getHeight((statusBarHeight: any) => {
        setsbHeight(Number(statusBarHeight.height))
        console.log(statusBarHeight.height)
        setPTop(sbHeight + 44)
      })
    }
  })

  const fetchCollection = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const query = `query getCollectionById($id: ID!) {
      collection(id: $id) {
        title
        description
        image {
          url
          height
          width
        }
        products(first: 200) {
          nodes {
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
        }
      }
    }`

    const variables = { id: collectionId }

    const response: any = await storefrontApiClient(query, variables)

    if (response.errors && response.errors.length != 0) {
      setIsLoading(false)
      throw response.errors[0].message
    }

    setCollection(response.data.collection)

    setIsLoading(false)
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        // <BackArrowIcon
        //   color={'#4B2D83'}
        //   size={20}
        //   onPress={() => navigation.goBack()}
        // />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrow color={'#4B2D83'}
            size={20}
          />
        </TouchableOpacity>

      ),
      headerTitle: () => (
        // <Text style={styles.title}>{collection?.title || ''}</Text>
        <Image source={logo} style={{ width: 100, height: 50 }} resizeMode="contain" />
      ),
    });

    try {
      fetchCollection()
    } catch (e) {
      if (typeof e == 'string') {
        setErrorMessage(e)
      } else {
        setErrorMessage('Something went wrong. Try again.')
      }
    }
  }, [route.params.collectionId])


  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingTop: 10 + pTop, width: '100%' }}>
      {isLoading ?
        <ActivityIndicator style={{ alignSelf: 'center' }} /> :
        <FlatList
          data={collection.products.nodes as Product[]}
          renderItem={({ item }) => <ProductCard data={item} />}
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.container}
          ListHeaderComponent={<View style={{}} />}
        //   () => (
        //   <View style={{ marginHorizontal: -14 }}>
        //     {/* <View style={[styles.titleContainer]}>
        //       <Text style={styles.title}>{collection.title}</Text>
        //     </View>
        //     { collection.description && <Text style={styles.text}>{collection.description}</Text>}              */}
        //     {/* <FlatList 
        //       data={collection.products.nodes.slice(0,2) as Product[]}
        //       renderItem={({item}) => <ProductCard data={item} /> }
        //       keyboardDismissMode='on-drag'
        //       showsVerticalScrollIndicator={false}
        //       numColumns={2}
        //       contentContainerStyle={{marginHorizontal: 14}}
        //     /> */}


        //     {/* This is what the preview picture is */}
        //     {/* {collection && collection.image &&
        //       <Image
        //         source={{ uri: collection.image.url }}
        //         style={{ width: screenWidth, height: screenWidth * collection.image.height / collection.image.width, marginBottom: 16 }}
        //       />
        //     } */}
        //   </View>
        // )}
        />
      }
    </View>
  )
}

export default Collection

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    // paddingTop: 47 + 47,
    // paddingTop: 0,
  },
  titleContainer: {
    backgroundColor: theme.colors.text,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'black',
    fontSize: 18,
    letterSpacing: 1.8,
    fontWeight: 'bold'
  },
  text: {
    color: theme.colors.text,
    alignSelf: 'center',
    fontSize: 16,
    letterSpacing: 1.5,
    fontWeight: '300',
    marginBottom: 16,
    textAlign: 'center'
  },
  image: {
    width: screenWidth,
    height: 400,
    marginBottom: 16
  }
})