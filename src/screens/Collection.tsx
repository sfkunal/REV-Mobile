import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Image, Dimensions, NativeModules, StatusBar, Platform, TouchableOpacity, ScrollView } from 'react-native'
import { BackArrow, BackArrowIcon, SearchIcon } from '../components/shared/Icons'
import ProductCard from '../components/shared/ProductCard'
import { theme } from '../constants/theme'
import { Product } from '../types/dataTypes'
import { MenuStackParamList } from '../types/navigation'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import logo from '../assets/logo.png'
import splash from '../assets/splash.png'
import { TextInput } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome';


const screenWidth = Dimensions.get('screen').width

type Props = NativeStackScreenProps<MenuStackParamList, 'Collection'>

const Collection = ({ route, navigation }: Props) => {
  const { collectionId } = route.params
  const { getId } = navigation
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [pTop, setPTop] = useState<number>(0)
  const [searchInput, setSearchInput] = useState('')

  const [collection, setCollection] = useState<any | null>(null)
  const { StatusBarManager } = NativeModules
  const [sbHeight, setsbHeight] = useState<any>(StatusBar.currentHeight)
  const [products, setProducts] = useState<Product[]>([])

  const windowWidth = Dimensions.get('window').width
  const screenWidth = Dimensions.get('screen').width

  useEffect(() => {
    if (searchInput.length > 0) {
      try {
        search();
      } catch (e) {
        if (typeof e === 'string') {
          setErrorMessage(e);
        } else {
          setErrorMessage('Something went wrong. Try again.');
        }
      }
    } else {
      setProducts([]);
    }
  }, [searchInput]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBarManager.getHeight((statusBarHeight: any) => {
        setsbHeight(Number(statusBarHeight.height))
        // console.log(statusBarHeight.height)
      })
    }
  }, [])

  useEffect(() => {
    if (String(navigation.getState().routes[0].name) === 'Home') {
      StatusBarManager.getHeight((statusBarHeight: any) => {
        setsbHeight(Number(statusBarHeight.height))
        // console.log(statusBarHeight.height)
        setPTop(sbHeight + 44)
      })
    }
  })

  useEffect(() => {
    // console.log('title', collection.title)
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.screenTitle}>{collection?.title}</Text>
      ),
    })
  }, [collection])

  const search = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const query = `{
      products(first: 64, query: "title:${searchInput}*") {
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
    }`

    const response: any = await storefrontApiClient(query)

    if (response.errors && response.errors.length != 0) {
      setIsLoading(false)
      throw response.errors[0].message
    }

    setProducts(response.data.products.nodes as Product[])

    setIsLoading(false)
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: -12 }}>
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
    <View style={{ flex: 1, paddingTop: 10 + pTop, width: '100%' }}>


      {/* search bar */}
      <View style={{ width: '95%', height: 45, backgroundColor: '#D9D9D9', display: 'flex', flexDirection: 'row', alignItems: 'center', borderTopRightRadius: 30, borderBottomRightRadius: 30, marginBottom: 10 }}>
        <View style={{ marginLeft: 20 }}>
          <SearchIcon color='black' size={20} />
        </View>

        <TextInput
          placeholder='Search'
          placeholderTextColor={theme.colors.disabledText}
          style={{ backgroundColor: '#D9D9D9', width: windowWidth - 100, marginLeft: 6, fontSize: 18, fontWeight: '500', padding: 10 }}
          onChangeText={(text) => setSearchInput(text)}
          value={searchInput}
          autoCapitalize='none'
        />
        {searchInput && searchInput.length !== 0 ? (<TouchableOpacity onPress={() => setSearchInput('')}
          style={{ width: 25, height: 25, borderRadius: 20, backgroundColor: 'gray', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}
        >
          <Text style={{ color: 'white', fontWeight: '900' }}>X</Text>
          {/* <Icon name="times-circle" size={25} color='white' /> */}
        </TouchableOpacity>) : (null)}
      </View>


      {/* {isLoading ?
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator style={{ alignSelf: 'center' }} /></View>
        : { searchInput && searchInput.length !== 0 ? <T() : (<FlatList
        data={collection.products.nodes as Product[]}
        renderItem={({ item }) => <ProductCard data={item} />}
        keyboardDismissMode='on-drag'
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<View style={{}} />}
      />)}
        
      } */}

      {isLoading ? (
        <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={"small"} />
        </View>
      ) : (
        <>
          {errorMessage !== "" ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : (
            <>
              {searchInput.length > 0 ? (
                products.length !== 0 ? (
                  <FlatList
                    data={products}
                    renderItem={({ item }) => <ProductCard data={item} />}
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    contentContainerStyle={styles.container}
                  />
                ) : (
                  // TODO I dont think this actually shows up
                  <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <Text style={{}}>No results matching your search</Text>
                  </View>
                )
              ) : (

                <View style={{ paddingTop: 10, }}>
                  {/* <PopularThumbNail color='black' size={24} /> */}

                  <FlatList
                    data={collection.products.nodes as Product[]}
                    renderItem={({ item }) => <ProductCard data={item} />}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 14, flexGrow: 1, paddingBottom: 50, }}
                  />
                </View>
              )}
            </>
          )}
        </>
      )}
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
  },
  error: {
    color: 'red',
    alignSelf: 'center',
    marginTop: 12
  },
  screenTitle: {
    fontWeight: '800',
    fontSize: 24,
    color: '#4B2D83',
  }
})