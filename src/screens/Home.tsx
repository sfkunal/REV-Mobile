import { View, Text, StyleSheet, Image, Dimensions, TouchableWithoutFeedback, FlatList, Modal, ActivityIndicator, NativeModules, StatusBar, Platform, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { hasHomeIndicator, theme } from '../constants/theme'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import logoDark from '../assets/logo-dark.png'
import logo from '../assets/logo.png'
import SubscribeComponent from '../components/home/SubscribeComponent'
import { HomeStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuthContext } from '../context/AuthContext'
import { config } from '../../config'
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext'
import ProductCard from '../components/shared/ProductCard'
import { getProductInfoQuery } from '../queries/PopularProductsStaticQuery'
// import { TouchableOpacity } from 'react-native-gesture-handler'
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the Icon component
// import GooglePlacesInput from './AddressAutocomplete'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
import { ChevronDownIcon, HangerIcon, PinIcon } from '../components/shared/Icons'
import { Product } from '../types/dataTypes'
import { ScrollView } from 'react-native-gesture-handler'
import HomeList from '../components/home/HomeList'

// import { useNavigationContext } from '../context/NavigationContext'


const windowHeight = Dimensions.get('window').height - 50 - (hasHomeIndicator ? 30 : 0)
const screenWidth = Dimensions.get('screen').width;
const textDescription = 'I love REv. I loev REV so much';

type Props = NativeStackScreenProps<HomeStackParamList, 'Collection'>

const Home = ({ navigation }: Props) => {
  const { userToken } = useAuthContext()
  const [pastItems, setPastItems] = useState<any[]>([])
  const [popularProducts, setPopularProducts] = useState<any[]>([])
  const [exploreProducts, setExploreProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const { rootNavigation } = useNavigationContext()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [userOrders, setUserOrders] = useState(0);
  const [selectedMode, setSelectedMode] = useState('explore'); // 'forYou' or 'explore'
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address>({});
  const [catsLoading, setCatsLoading] = useState<Boolean>(false);
  const [sectionData, setSectionData] = useState<any[]>([]);
  const [isStoreClosed, setIsStoreClosed] = useState<Boolean>(false)

  const [suggestionsLoading, setSuggestionsLoading] = useState<Boolean>(false);
  const [productRecommendations, setProductRecommendations] = useState<any>([]);

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
      if (userToken) {
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

        const userOrders = response.data.customer.orders?.nodes.length
        // console.log('userOrders thooooo');
        // console.log(response.data.customer.orders.nodes)
        // // console.log(userOrders);
        setUserOrders(userOrders);
        setIsLoading(false)
      }
    } catch (e) {
      console.log(e)
    }
  }


  const fetchPopularProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')

    // popular products is currently hardcoded!!!!!!!!
    try {
      const productIds = [
        "8626723258656",
        "8651298799904",
        "8651303616800",
        "8651309023520",
        "8837273714976",
        "8656809001248",
        "8738456109344",
        "8772894523680",
        "8651307483424",
        "8837266243872",
        "8837226266912",
        "8926543642912",
        "8837446435104",
        "8794648740128",
        "8626515116320",
        "8626695995680",
      ];

      const queries = productIds.map(id => getProductInfoQuery(id));
      const responses = await Promise.all(queries.map(query => storefrontApiClient(query)));
      const products = responses.map((response: { data: any }) => response.data.product);
      // if (responses.errors && responses.errors.length != 0) {
      //   setIsLoading(false)
      //   throw response.errors[0].message
      // }

      setPopularProducts(products)
      // console.log(products)
      setIsLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  const fetchPastItems = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (userToken) {
      try {
        const query = `query {
          customer(customerAccessToken: "${userToken.accessToken}") {
            orders(first: 10, reverse: true) {
              nodes {
                lineItems(first: 250) {
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
                       images(first: 1) {
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

        // this will do for now
        const recentOrders = response.data.customer.orders.nodes
        let recentItemsMap = new Map();

        recentOrders.forEach(order => {
          order.lineItems.nodes.forEach(lineItem => {
            if (lineItem.variant && lineItem.variant.product) {
              const prodID = lineItem.variant.product.id
              if (!recentItemsMap.has(prodID)) {
                recentItemsMap.set(prodID, {
                  ...lineItem.variant.product,
                  quantity: lineItem.quantity
                })
              } else {
                const existingItem = recentItemsMap.get(prodID)
                existingItem.quantity += lineItem.quantity;
              }
            }
          })
        })

        const recentItems = Array.from(recentItemsMap.values()); // array from value set
        setPastItems(recentItems);
        setIsLoading(false);

        // let productCounts = {};

        // forYouProducts.forEach((order: { lineItems: { nodes: { variant: { product: { id: any; title: any } }; quantity: any }[] } }) => {
        //   order.lineItems.nodes.forEach((lineItem: { variant: { product: { id: any; title: any } }; quantity: any }) => {
        //     if (lineItem.variant && lineItem.variant.product) {
        //       const productId = lineItem.variant.product.id;
        //       const productName = lineItem.variant.product.title;
        //       if (productCounts[productId]) {
        //         productCounts[productId].quantity += lineItem.quantity;
        //       } else {
        //         productCounts[productId] = { quantity: lineItem.quantity, name: productName, ...lineItem.variant.product };
        //       }
        //     }
        //   });
        // });

        // const sortedProducts = Object.entries(productCounts)
        //   .filter(([, quantity]) => quantity !== undefined)
        //   .sort((a, b) => Number(b[1]) - Number(a[1]))
        //   .slice(0, 16) // so only the first 16
        //   .map(([key, value]) => value); // map to get rid of keys

        // setPastItems(sortedProducts)
        // setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const fetchCollection = async (collectionID: string) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const query = `query {
        collection(id: "${collectionID}") {
          id
          title
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
        }
      }`

      const response: any = await storefrontApiClient(query)

      if (response.errors && response.errors.length != 0) {
        setIsLoading(false)
        throw response.errors[0].message
      }

      const products = response.data.collection.products.nodes
      setIsLoading(false)
      return products;
      // console.log(products);

    } catch (e) {
      console.log(e)
    }
  }


  const fetchRecommendations = async () => {
    setSuggestionsLoading(true);
    if (!pastItems) {
      setSuggestionsLoading(false);
      return;
    }

    try {
      // these aren't alternated, it is pretty much just 5 of one, then 5 of another. 
      const topProducts = pastItems.slice(0, 5);
      const recommendationsPromises = topProducts.map(prod => getProductRecommendations(prod.id));
      const recommendationResults = await Promise.all(recommendationsPromises);

      // Flatten the results and deduplicate
      const flattenedRecommendations = recommendationResults.flat();
      const uniqueRecommendations = deduplicateRecommendations(flattenedRecommendations);
      // console.log('unique recs', uniqueRecommendations);
      setProductRecommendations(Array.from(uniqueRecommendations));
    } catch (e) {
      console.log(e);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Deduplicate recommendations based on their IDs
  function deduplicateRecommendations(recommendations) {
    const unique = new Map();

    recommendations.forEach(rec => {
      if (!unique.has(rec.id)) {
        unique.set(rec.id, rec);
      }
    });

    return Array.from(unique.values());
  }

  const getProductRecommendations = async (id) => {

    const query = `query getProductRecommendations {
      productRecommendations(productId: "${id}") {
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
    // console.log('length of product recs: ', response.data.productRecommendations.length)

    if (response.errors && response.errors.length != 0) {
      throw response.errors[0].message
    }
    return response.data.productRecommendations.slice(0, 6) as Product[];
  }

  const fetchExploreProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')
    const exploreID = 'gid://shopify/Collection/469310570784'

    try {
      const query = `query {
        collection(id: "${exploreID}") {
          id
          title
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
        }
      }`

      const response: any = await storefrontApiClient(query)

      if (response.errors && response.errors.length != 0) {
        setIsLoading(false)
        throw response.errors[0].message
      }

      const products = response.data.collection.products.nodes
      setExploreProducts(products)
      setIsLoading(false)

      return products;
      // console.log(products);
    } catch (e) {
      console.log(e)
    }
  }

  const getCustomerAddress = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (userToken) {
      try {
        const query = `query {
          customer(customerAccessToken: "${userToken.accessToken}") {
            defaultAddress {
              address1
              address2
              city
              province
              country
              zip
            }
          }
        }`

        const response: any = await storefrontApiClient(query)

        if (response.errors && response.errors.length != 0) {
          setIsLoading(false)
          throw response.errors[0].message
        }

        const fetchedDefaultAddress = response.data.customer.defaultAddress;
        setSelectedAddress(fetchedDefaultAddress);
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const updateCustomerAddress = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (userToken && selectedAddress) {
      try {
        const query = `query {
          customer(customerAccessToken: "${userToken.accessToken}") {
            defaultAddress {
              id
            }
          }
        }`

        const response: any = await storefrontApiClient(query)

        if (response.errors && response.errors.length != 0) {
          setIsLoading(false)
          throw response.errors[0].message
        }

        if (response.data.customer.defaultAddress === null) {
          createCustomerAddress()
        } else {

          const defaultAddressId = response.data.customer.defaultAddress.id ? response.data.customer.defaultAddress.id : null;

          const mutation = `mutation {
          customerAddressUpdate(
            customerAccessToken: "${userToken.accessToken}"
           id: "${defaultAddressId}"
            address: {
              address1: "${selectedAddress.address1}"
              address2: "${selectedAddress.address2}"
              city: "${selectedAddress.city}"
              province: "${selectedAddress.state}"
              country: "${selectedAddress.country}"
              zip: "${selectedAddress.zip}"
            }
          ) {
            customerAddress {
              address1
              city
              province
              country
              zip
            }
          }
        }`

          const mutationResponse: any = await storefrontApiClient(mutation)

          if (response.errors && response.errors.length != 0) {
            setIsLoading(false)
            throw response.errors[0].message
          }
          setIsLoading(false)
        }
      } catch (e) {
        console.log(e)
      }
      setIsLoading(false)
    }
  }

  const createCustomerAddress = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (userToken) {
      try {
        const mutation = `mutation {
          customerAddressCreate(
            customerAccessToken: "${userToken.accessToken}"
            address: {
              address1: "${selectedAddress.address1}"
              address2: "${selectedAddress.address2}"
              city: "${selectedAddress.city}"
              province: "${selectedAddress.state}"
              country: "${selectedAddress.country}"
              zip: "${selectedAddress.zip}"
            }
          ) {
            customerAddress {
              address1
              city
              province
              country
              zip
            }
          }
        }`

        const response: any = await storefrontApiClient(mutation)

        if (response.errors && response.errors.length != 0) {
          setIsLoading(false)
          throw response.errors[0].message
        }
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedAddress && Object.keys(selectedAddress).length > 0) {
      updateCustomerAddress();
    }
  }, [selectedAddress]);

  // THIS IS WHERE ALL OF THE PRODUCTS ARE FETCHED
  useEffect(() => {
    fetchUserOrders()
    fetchPopularProducts()
    fetchPastItems()
    fetchExploreProducts()
    getCustomerAddress()
    createSectionData();

    // fetchRecommendations();
  }, [userToken, userOrders])

  // this will get the user recommendations
  useEffect(() => {
    if (pastItems?.length > 0) {
      fetchRecommendations();
    }
  }, [pastItems])

  // this is what gives the space between the items
  const ItemSeparator = () => <View style={{ height: 10, width: '100%' }} />;

  interface Address {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  }

  const formatAddress = (address: Address) => {
    const { address1, address2, city, state, country, zip } = address;
    const parts = [
      address1 && address1.length !== 0 ? address1 : '',
      address2 && address2.length !== 0 ? `, ${address2}` : '',
      city && city.length !== 0 ? `, ${city}` : '',
      state && state.length !== 0 ? `, ${state}` : '',
      zip && zip.length !== 0 ? `, ${zip}` : '',
    ];
    return parts.join('');
  };

  const ForYouList = React.memo(({ data }: { data: any }) => {
    const ForYouHorizontalList = function () {
      return (
        <>
          <View style={{ borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, paddingHorizontal: 20, position: 'absolute', top: -20, left: 4, zIndex: 11, backgroundColor: 'white' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>Back for seconds?</Text>
          </View>

          {/* view all if needed. There is a weird cutoff tho */}
          {/* <View
            style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', top: -12, position: 'absolute', right: 40, zIndex: 1, backgroundColor: 'white', width: 100, height: 23, }}
          >
            <Text style={{ fontSize: 12, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>View all</Text>
          </View> */}
          {pastItems && pastItems.length > 0 ? (<FlatList
            data={pastItems.filter(item => item != null)}
            // data={data}
            renderItem={({ item }) =>
            (<View style={{
              width: 180, padding: 5, marginRight: 25, paddingVertical: 15,
            }}>
              <ProductCard data={item} />
            </View>)}
            // <ProductCard data={item} />}
            horizontal={true}
            keyboardDismissMode='on-drag'
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ borderWidth: 2, marginLeft: 0, borderColor: '#4B2D83', borderTopLeftRadius: 36, borderBottomLeftRadius: 36, marginRight: -5, zIndex: -1 }}
            keyExtractor={item => item.id}

          // keyExtractor={(item) => item.id.toString()}
          />) : (<View style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, width: '110%', marginLeft: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, position: 'absolute', top: -8, left: 4, backgroundColor: 'white', height: 250, zIndex: -1, marginTop: 10, }}>
            <Text style={{ width: '60%', marginRight: '10%', textAlign: 'center', fontWeight: '300' }}>
              Products from your previous orders will show up here!
            </Text>
          </View>)}
        </>
      )
    }
    // console.log(data);
    return (
      <View style={{ paddingBottom: sbHeight + 320 }}>
        <FlatList
          ListHeaderComponent={<View style={{ marginTop: 10, width: '110%' }}><ForYouHorizontalList /></View>}
          data={data.filter(item => item != null)}
          renderItem={({ item }) => <ProductCardMemo data={item} />}
          keyExtractor={item => item.id.toString()}// Make sure to have a keyExtractor for unique keys
          ItemSeparatorComponent={ItemSeparator} // Add this line
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={true}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 14 }}
        />
      </View>
    )

  })
  // <ScrollView style={{ paddingTop: 10, paddingBottom: sbHeight + 300 }}>

  const ProductCardMemo = React.memo(ProductCard);

  // </ScrollView>

  // const HorizontalList = React.memo(({ title, data, nav }: { title: string, data: any, nav: string }) => {
  //   return (
  //     <View style={{ flex: 1, marginTop: 10, }}>
  //       <TouchableOpacity style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, marginLeft: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, position: 'absolute', top: -8, left: 4, zIndex: 3, backgroundColor: 'white', paddingHorizontal: 14 }}
  //         onPress={() => {
  //           navigation.navigate('Collection', { collectionId: nav })
  //         }}

  //       >

  //         <Text style={{ fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>{title}</Text>
  //       </TouchableOpacity>

  //       <FlatList
  //         ListHeaderComponent={<View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />}
  //         data={data.filter(item => item != null)}
  //         // data={data}
  //         renderItem={({ item }) => (<View style={{ height: '90%', marginTop: 25 }}><ProductCardMemo data={item} />
  //         </View>)}
  //         // <ProductCard data={item} />}
  //         horizontal={true}
  //         keyboardDismissMode='on-drag'
  //         showsHorizontalScrollIndicator={false}
  //         contentContainerStyle={{ paddingHorizontal: 14 }}
  //         style={{ borderWidth: 2, marginLeft: 10, borderColor: '#4B2D83', borderTopLeftRadius: 36, borderBottomLeftRadius: 36, marginRight: -5, zIndex: 2 }}
  //         keyExtractor={item => item.id}

  //       // keyExtractor={(item) => item.id.toString()}
  //       />
  //     </View>
  //   )
  // })

  // where we create the data to make the sections (horizontal scrolls)
  const createSectionData = async () => {
    // if things are still loading, just return
    // const products = await fetchExploreProducts('gid://shopify/Collection/456011710752');

    if (isLoading) {
      return;
    }
    // array of arrays of products
    const sections = [
      { title: 'Popular', data: [], nav: 'gid://shopify/Collection/456011481376' },
      { title: 'Sweets', data: [], nav: 'gid://shopify/Collection/456011710752' },
      { title: 'Energy', data: [], nav: 'gid://shopify/Collection/456011776288' },
      { title: 'Drinks', data: [], nav: 'gid://shopify/Collection/456011514144' },
      { title: 'Nicotine', data: [], nav: 'gid://shopify/Collection/459750572320' },
      { title: 'International', data: [], nav: 'gid://shopify/Collection/458202546464' },
      { title: 'Ready To Eat', data: [], nav: 'gid://shopify/Collection/456011940128' },
      { title: 'Sweet Treats', data: [], nav: 'gid://shopify/Collection/456011710752' },
      { title: 'Snacks', data: [], nav: '"gid://shopify/Collection/456011546912' },
      { title: 'Chips', data: [], nav: 'gid://shopify/Collection/456011612448' },
      { title: 'Healthy', data: [], nav: 'gid://shopify/Collection/458202448160' },
      { title: 'Candy', data: [], nav: 'gid://shopify/Collection/456011677984' },
      { title: 'Ice Cream', data: [], nav: 'gid://shopify/Collection/456011841824' },
      { title: 'Beer & Wine', data: [], nav: 'gid://shopify/Collection/463924003104' },
      { title: 'Booze', data: [], nav: 'gid://shopify/Collection/463924134176' },
      { title: 'Student Essentials', data: [], nav: 'gid://shopify/Collection/456012038432' },
      { title: 'Personal Care', data: [], nav: 'gid://shopify/Collection/456011972896' },
    ];
    setSectionData(sections);
    // return sections
  }


  const GooglePlacesInput = () => {
    return (
      // can use radius, srictbounds parameters so that we limit any autocompletes, so effectively people can't put an address outside of a certain radius. If that is something that we want to do. 
      <>
        <GooglePlacesAutocomplete
          placeholder='4748 University Wy NE A, Seattle, WA 98105'
          fetchDetails={true}
          minLength={3}
          onPress={(data, details = null) => {
            bottomSheetRef.current?.close();
            if (details) {
              const addressComponents = details.address_components;
              const address1 = `${addressComponents.find(c => c.types.includes('street_number'))?.long_name} ${addressComponents.find(c => c.types.includes('route'))?.long_name}`;
              const address2 = addressComponents.find(c => c.types.includes('subpremise'))?.long_name || ''; // This line is new
              const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
              const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
              const country = addressComponents.find(c => c.types.includes('country'))?.short_name;
              const zip = addressComponents.find(c => c.types.includes('postal_code'))?.long_name;
              const addressDict = {
                address1: address1,
                address2: address2,
                city: city,
                state: state,
                country: country,
                zip: zip
              };

              setSelectedAddress(addressDict);
            }
          }}
          query={{
            key: 'AIzaSyCK1fS3nkmrrPJKjxunXnVNc3pRCHNWWJ4',
            language: 'en',
            location: '47.6062,-122.3321', // Latitude and longitude for Seattle
            radius: '5000', // 
            components: 'country:us',
            // strictbounds: true, // this would make it so that nothing outside of the range would be available
          }}
          styles={{
            container: {
              diplay: 'flex',
              width: '100%'
            },
            textInput: {
              height: 38,
              color: '#000000',
              backgroundColor: '#F0F0F0',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#4B2D83',
              borderRadius: 5,
              // paddingHorizontal: 10,
              paddingLeft: 4,
              paddingRight: 6,

              // backgroundColor: '#4B2D83',
            },
            // the autofill text
            description: {
              fontWeight: '400'
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
            textInputPlaceholder: { // This is the style property for the placeholder text
              color: '#FFFFFF', // Placeholder text color
              fontSize: 16, // Placeholder text font size
              // Add any additional styling here
            },

          }}
          // renderLeftButton={() => <PinIcon size={24} color='black' />}
          // listViewDisplayed='auto'
          // listViewDisplayed={3}
          numberOfLines={3}
        />
        {/* <View style={{ backgroundColor: '#4B2D83', width: '90%', marginLeft: 'auto', marginRight: 'auto', height: 1, borderRadius: 30 }} />
        <View style={{ position: 'absolute', backgroundColor: '#4B2D83', width: '90%', marginLeft: 'auto', marginRight: 'auto', height: 1, borderRadius: 30 }} /> */}

      </>
    );
  };

  return (
    <View style={{ flex: 0 }}>
      {isLoading ? (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator style={{ alignSelf: 'center' }} />
        </View>

      ) : (
        <>
          <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'column', justifyContent: 'center', width: '100%' }}>

              <TouchableOpacity style={styles.addressBox} onPress={() => bottomSheetRef.current?.expand()}>

                {selectedAddress ?
                  // if address selected
                  (
                    <View style={{
                      width: '100%',
                      backgroundColor: '#D9D9D9',
                      borderTopRightRadius: 25, borderBottomRightRadius: 25, paddingTop: 5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 10,
                    }}>
                      <View style={{ marginLeft: 20, marginBottom: 4 }}>
                        <PinIcon size={24} color='black' />
                      </View>

                      <View style={{ width: '75%' }}>
                        <Text style={{ paddingLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#4B2D83' }}>
                          Delivering to:
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{ paddingLeft: 6, paddingBottom: 7, fontSize: 14, width: '100%' }}>
                          {formatAddress(selectedAddress)}
                        </Text>

                      </View>
                      <View style={{ display: 'flex', marginRight: 12, marginTop: 12, }}>
                        <ChevronDownIcon color='#4B2D83' size={25} />
                      </View>
                    </View>
                  )
                  // address not selected
                  : (
                    <>
                      <View style={{
                        width: '100%',
                        backgroundColor: '#D9D9D9',
                        // backgroundColor: 'yellow',
                        borderTopRightRadius: 25, borderBottomRightRadius: 25, paddingTop: 5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row',
                        marginTop: 10,
                      }}>
                        <View style={{ marginLeft: 20, marginBottom: 4 }}>
                          <PinIcon size={24} color='black' />
                        </View>

                        <View style={{ width: '75%', }}>
                          <Text style={{ fontSize: 18, color: 'black', fontWeight: '500', marginBottom: 4, marginLeft: 10 }}>
                            Select Delivery Address
                          </Text>
                        </View>

                        <View style={{ display: 'flex', marginRight: 12, marginTop: 12, }}>
                          <ChevronDownIcon color='#4B2D83' size={25} />
                        </View>
                      </View>

                      {/* <View style={{ width: '100%', backgroundColor: '#D9D9D9', borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingTop: 5 }}>
                        <Text style={{ paddingLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#4B2D83' }}>
                          Where are we delivering?
                        </Text>
                        <Text style={{ paddingLeft: 6, paddingBottom: 7, fontSize: 14, width: '80%' }}>
                          Enter your address here...
                        </Text>
                      </View> */}
                    </>
                  )
                }
              </TouchableOpacity>

              {/* 4th attempt at making a toggle for the top */}
              {/* the issue with this code is that the explore will fade onClick. workaround would be absolute positioning and don't wrap inside the other touchable. I like this for now, though */}
              <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
                {selectedMode === 'explore' ?
                  (<>
                    <TouchableOpacity style={{ width: 245, height: 40, borderWidth: 1, borderRadius: 30, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }} onPress={() => setSelectedMode('forYou')}>
                      <TouchableOpacity activeOpacity={1} style={{ width: 120, height: 40, borderRadius: 30, borderWidth: 1, backgroundColor: '#4B2D83', display: 'flex', justifyContent: 'center', alignItems: 'center', }} onPress={() => setSelectedMode('explore')}>
                        <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: 'white' }}>
                          Explore
                        </Text>
                      </TouchableOpacity>
                      <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: '#4B2D83', marginRight: 36 }}>
                        {/* {userToken ? 'For ' + userToken.customer.firstName : 'FOR YOU'} */}
                        For You
                      </Text>
                    </TouchableOpacity>

                  </>
                  ) :
                  (<>
                    <TouchableOpacity style={{ width: 245, height: 40, borderWidth: 1, borderRadius: 30, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }} onPress={() => setSelectedMode('explore')}>
                      <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: '#4B2D83', marginLeft: 28 }}>
                        Explore
                      </Text>
                      <TouchableOpacity activeOpacity={1} style={{ width: 136, height: 40, borderRadius: 30, borderWidth: 1, backgroundColor: '#4B2D83', display: 'flex', justifyContent: 'center', alignItems: 'center', }} onPress={() => setSelectedMode('forYou')}>
                        <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: 'white' }}>
                          {/* {userToken ? 'For ' + userToken.customer.firstName : 'FOR YOU'} */}
                          For You
                        </Text>
                      </TouchableOpacity>

                    </TouchableOpacity>

                  </>
                  )}
              </View>


            </View>
            {selectedMode === 'explore' ?
              <View style={{ display: 'flex', height: '100%', marginTop: 0, paddingBottom: sbHeight + 320 }}><HomeList navigation={navigation} /></View>

              : <View style={{ paddingTop: 10 }}><ForYouList data={(userOrders > 1 && productRecommendations ? productRecommendations : exploreProducts)} /></View>}
          </View>

          {/* this is what  */}
          <BottomSheet
            ref={bottomSheetRef}
            index={-1} // Start closed
            enablePanDownToClose
            snapPoints={['92%']} // Set the heights of the bottom sheet
          >

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{
                flex: 1,
                // height: '90%',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#4B2D83' }}>
                  Where should we deliver to?
                </Text>
                <GooglePlacesInput />
              </View>

              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ width: '100%', height: 150, marginBottom: 150, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'center' }}>
                  <View style={{ backgroundColor: 'orange', width: 150, height: 150, }} />
                </View>

              </View>
            </KeyboardAvoidingView>





            {/* <KeyboardAvoidingView
              style={{
                // margin: 12,
                // backgroundColor: "transparent",
                // backgroundColor: 'yellow',
                zIndex: 10,
                // height: 400,
                display: 'flex',
                paddingTop: 10,
                marginHorizontal: 20,
                // width: '95%',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'yellow',
                height: '80%',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '400', marginBottom: 8, marginLeft: 2 }}>Where should we deliver to?</Text>
              <GooglePlacesInput />

              <Text>Butt stuff</Text>
              <View style={{ backgroundColor: 'orange', width: 300, height: 300, }} />
            </KeyboardAvoidingView> */}


          </BottomSheet>
        </>
      )
      }
    </View >
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
    width: '50%',
    height: '50%',
    resizeMode: 'contain',
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
    width: config.logoWidth,
    height: config.logoWidth * config.logoSizeRatio,
    alignSelf: 'center'
  },
  addressBox: {
    // height: 40,
    borderColor: 'black',
    // borderWidth: 1,
    borderRadius: 20,
    marginBottom: 4,
    flexDirection: 'row',
    marginTop: '2%',
    alignSelf: 'flex-start',
    width: '95%',
    justifyContent: 'flex-start', // Add this line to center content vertically
    // borderBottomWidth: 2,
    // borderBottomColor: '#4B2D83',
  },
  selectedMode: {
    backgroundColor: '#4B2D83',
    borderRadius: 20, // Optional: if you want rounded corners
    padding: 5, // Adjust padding as needed
  },
  notSelectedMode: {
    borderRadius: 20, // Optional: if you want rounded corners
    padding: 5, // Adjust padding as needed
  },
  textDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    letterSpacing: 1,
    paddingBottom: 8,
  },
})

export default Home