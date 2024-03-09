import { View, Text, StyleSheet, Image, Dimensions, TouchableWithoutFeedback, FlatList, Modal, ActivityIndicator, NativeModules, StatusBar, Platform, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
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

// import { useNavigationContext } from '../context/NavigationContext'


const windowHeight = Dimensions.get('window').height - 50 - (hasHomeIndicator ? 30 : 0)
const screenWidth = Dimensions.get('screen').width;
const textDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vel semper nisl. Morbi id diam et eros aliquet mollis. Sed cursus, justo ut pellentesque posuere, tortor turpis bibendum ante, eu fringilla mi arcu ac purus.';

type Props = NativeStackScreenProps<HomeStackParamList, 'Collection'>

const Home = ({ navigation }: Props) => {
  const { userToken } = useAuthContext()
  const [forYou, setForYou] = useState<any[]>([])
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

        const userOrders = response.data.customer.orders.nodes.length
        // console.log('userOrders thooooo');
        console.log(response.data.customer.orders.nodes)
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
          .slice(0, 16)
          .map(([key, value]) => value); // map to get rid of keys

        setForYou(sortedProducts)
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const fetchExploreProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')
    const exploreID = 'gid://shopify/Collection/469310570784'

    try {
      const query = `query {
        collection(id: ${exploreID}) {
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
      // setExploreProducts(products)
      return products;
      // console.log(products);
      setIsLoading(false)
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
    fetchForYou()
    fetchExploreProducts()
    getCustomerAddress()
    createSectionData();
  }, [userToken, userOrders])

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

  const HomeList = React.memo(({ data }: { data: any }) => (
    <ScrollView style={{ paddingTop: 10, paddingBottom: sbHeight + 300 }}>
      <View style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, width: 220, marginLeft: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, position: 'absolute', top: -8, left: 4, zIndex: 11, }}>
        <Text style={{ fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>Your past orders</Text>
      </View>
      {data ? (<FlatList
        data={forYou.filter(item => item != null)}
        // data={data}
        renderItem={({ item }) => (<View style={{ height: '30%', marginTop: 25 }}><ProductCard data={item} />
        </View>)}
        // <ProductCard data={item} />}
        horizontal={true}
        keyboardDismissMode='on-drag'
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        style={{ borderWidth: 2, marginLeft: 10, borderColor: '#4B2D83', borderTopLeftRadius: 36, borderBottomLeftRadius: 36, marginRight: -5, zIndex: 2 }}
        keyExtractor={item => item.id.toString()}

      // keyExtractor={(item) => item.id.toString()}
      />) : (<View style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, width: '110%', marginLeft: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, position: 'absolute', top: -8, left: 4, backgroundColor: 'white', height: 250, zIndex: -1, marginTop: 10, }}>
        <Text style={{ width: '60%', marginRight: '10%', textAlign: 'center', fontWeight: '300' }}>
          Products from your previous orders will show up here!
        </Text>
      </View>)}

      <View>
        <FlatList
          data={data.filter(item => item != null)}
          renderItem={({ item }) => <ProductCard data={item} />}
          keyExtractor={item => item.id.toString()}// Make sure to have a keyExtractor for unique keys
          ItemSeparatorComponent={ItemSeparator} // Add this line
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={true}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 14 }}
        />
      </View>

    </ScrollView>
  ))

  const HorizontalList = React.memo(({ title, data, nav }: { title: string, data: any, nav: string }) => {

    return (
      <View style={{ flex: 1, marginTop: 10, }}>
        <TouchableOpacity style={{ zIndex: 10 }}
          onPress={() => {
            navigation.navigate('Collection', { collectionId: nav })
          }}>
          <View style={{ borderWidth: 2, borderColor: '#4B2D83', borderRadius: 30, width: 120, marginLeft: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, position: 'absolute', top: -8, left: 4, zIndex: 3, backgroundColor: 'white', }}>
            <Text style={{ fontSize: 22, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83' }}>{title}</Text>
          </View></TouchableOpacity>

        <FlatList
          data={data.filter(item => item != null)}
          // data={data}
          renderItem={({ item }) => (<View style={{ height: '90%', marginTop: 25 }}><ProductCard data={item} />
          </View>)}
          // <ProductCard data={item} />}
          horizontal={true}
          keyboardDismissMode='on-drag'
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14 }}
          style={{ borderWidth: 2, marginLeft: 10, borderColor: '#4B2D83', borderTopLeftRadius: 36, borderBottomLeftRadius: 36, marginRight: -5, zIndex: 2 }}
          keyExtractor={item => item.id.toString()}

        // keyExtractor={(item) => item.id.toString()}
        />
      </View>
    )
  })

  const MemoizedHorizontalList = React.memo(HorizontalList);

  const FullList = ({ sections }: { sections: any }) => {
    // console.log(sections)
    // console.log(sectionData[0].data[0].id)
    // console.log(sectionData[0].data[0].options[0].id)

    const renderItem = useCallback(({ item }) => (
      <MemoizedHorizontalList
        title={item.title}
        data={item.data}
        nav={item.nav}
      />
    ), [])
    return (
      // <View>

      // </View>
      <View style={{ paddingTop: 10, paddingBottom: sbHeight + 300 }}>
        {sections ? (<FlatList
          data={sections}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.title}
          ItemSeparatorComponent={() => (<View style={{ height: 30, marginBottom: 10, width: '100%', }} ></View>)}
          showsVerticalScrollIndicator={false}
        />) : (<ActivityIndicator />)
        }
      </View >
    )
  }



  {/* <FlatList
        data={data.filter(item => item != null)}
        renderItem={({ item }) => <ProductCard data={item} />}
        keyExtractor={item => item.id.toString()} // Make sure to have a keyExtractor for unique keys
        ItemSeparatorComponent={ItemSeparator} // Add this line
        keyboardDismissMode='on-drag'
        showsVerticalScrollIndicator={true}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 14 }}
      /> */}

  // where we create the data to make the sections (horizontal scrolls)
  const createSectionData = async () => {
    // if things are still loading, just return
    // const products = await fetchExploreProducts('gid://shopify/Collection/456011710752');
    if (isLoading) {
      return;
    }
    // array of arrays of products
    const sections = [
      { title: 'Popular', data: popularProducts, nav: 'gid://shopify/Collection/456011481376' },
      { title: 'Sweets', data: popularProducts, nav: 'gid://shopify/Collection/456011710752' },
      { title: 'Energy', data: popularProducts, nav: 'gid://shopify/Collection/456011776288' },
      { title: 'Drinks', data: popularProducts, nav: 'gid://shopify/Collection/456011514144' },
      { title: 'Nicotine', data: popularProducts, nav: 'gid://shopify/Collection/459750572320' },
      { title: 'International', data: popularProducts, nav: 'gid://shopify/Collection/458202546464' },
      { title: 'Ready To Eat', data: popularProducts, nav: 'gid://shopify/Collection/456011940128' },
      { title: 'Sweet Treats', data: popularProducts, nav: 'gid://shopify/Collection/456011710752' },
      { title: 'Snacks', data: popularProducts, nav: '"gid://shopify/Collection/456011546912' },
      { title: 'Chips', data: popularProducts, nav: 'gid://shopify/Collection/456011612448' },
      { title: 'Healthy', data: popularProducts, nav: 'gid://shopify/Collection/458202448160' },
      { title: 'Candy', data: popularProducts, nav: 'gid://shopify/Collection/456011677984' },
      { title: 'Ice Cream', data: popularProducts, nav: 'gid://shopify/Collection/456011841824' },
      { title: 'Beer & Wine', data: popularProducts, nav: 'gid://shopify/Collection/463924003104' },
      { title: 'Booze', data: popularProducts, nav: 'gid://shopify/Collection/463924134176' },
      { title: 'Student Essentials', data: popularProducts, nav: 'gid://shopify/Collection/456012038432' },
      { title: 'Personal Care', data: popularProducts, nav: 'gid://shopify/Collection/456011972896' },
    ];

    setSectionData(sections);
    // return sections
  }


  const GooglePlacesInput = () => {
    return (
      // in here is apartment/suite missing?
      <GooglePlacesAutocomplete
        placeholder='Where To?'
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
          radius: '5000',
          components: 'country:us',
        }}
        styles={{
          textInput: {
            height: 38,
            color: '#FFFFFF',
            fontSize: 16,
            backgroundColor: '#4B2D83',
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

      />
    );
  };

  return (
    <View style={{ flex: 0 }}>
      {isLoading ? (
        <ActivityIndicator style={{ alignSelf: 'center' }} />
      ) : (
        <>
          <View>
            <View style={{ flexDirection: 'column', justifyContent: 'center' }}>

              <TouchableOpacity style={styles.addressBox} onPress={() => bottomSheetRef.current?.expand()}>

                {selectedAddress ?
                  // if address selected
                  (
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


              {/* 2nd main menu item */}
              <View style={{ width: 245, height: 40, flexDirection: 'row', alignSelf: 'center', zIndex: 1, marginTop: 6, marginBottom: 10 }} >
                {selectedMode === 'explore' ?
                  (<>
                    <TouchableOpacity onPress={() => setSelectedMode('forYou')} style={{ backgroundColor: 'white', height: 40, width: 162, position: 'absolute', right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 1, borderColor: '#4B2D83' }}
                    //  activeOpacity={1}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: '#4B2D83', marginLeft: 24 }}>{userToken ? 'For ' + userToken.customer.firstName : 'FOR YOU'}</Text>
                    </TouchableOpacity>
                    {/* <View style={{ backgroundColor: 'pink', height: 100, width: 145, position: 'absolute', right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 30, }}> */}

                    {/* <TouchableOpacity style={{ height: '100%', width: '100%', backgroundColor: 'white', }}>
                      <Text>{userToken ? 'For ' + userToken.customer.firstName : 'FOR YOU'}</Text>
                    </TouchableOpacity> */}

                    {/* </View> */}
                    <TouchableOpacity onPress={() => setSelectedMode('explore')}
                      // activeOpacity={1} 
                      style={{ backgroundColor: '#4B2D83', height: 40, width: 120, position: 'absolute', left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 1, borderColor: '#4B2D83' }}>
                      <Text style={{ fontSize: 18, fontWeight: '500', color: '#FFFFFF' }} >
                        Explore
                      </Text>
                    </TouchableOpacity>
                  </>) :
                  (<>
                    {/* </View> */}
                    <TouchableOpacity onPress={() => setSelectedMode('forYou')} style={{ backgroundColor: '#4B2D83', height: 40, width: 162, position: 'absolute', right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 1 }}
                    //  activeOpacity={1}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '500', color: selectedMode === 'forYou' ? 'white' : '#4B2D83', marginLeft: 24 }}>{userToken ? 'For ' + userToken.customer.firstName : 'FOR YOU'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedMode('explore')}
                      // activeOpacity={1} 
                      style={{ backgroundColor: 'white', height: 40, width: 120, position: 'absolute', left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderWidth: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '500', color: '#4B2D83' }} >
                        Explore
                      </Text>
                    </TouchableOpacity>
                  </>)
                  // (<Text style={{ color: 'black' }}>Not selected</Text>)}
                }
              </View>

            </View>
            {selectedMode === 'explore' ? <FullList sections={sectionData} /> : <HomeList data={(userOrders > 4 ? forYou : exploreProducts)} />}
            {/* <HomeList data={selectedMode === 'explore' ? exploreProducts : (userOrders > 4 ? forYou : popularProducts)} /> */}


          </View>

          {/* this is what  */}
          <BottomSheet
            ref={bottomSheetRef}
            index={-1} // Start closed
            enablePanDownToClose
            snapPoints={['95%']} // Set the heights of the bottom sheet
          >
            <View
              style={{
                margin: 12,
                // backgroundColor: "transparent",
                backgroundColor: 'yellow',
                zIndex: 10,
                height: 400,
                paddingTop: 20
              }}
            >
              <Text style={{ fontSize: 20, marginLeft: 12 }}>Where to?</Text>
              <GooglePlacesInput />
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 45 }}>
                <View style={{
                  width: '85%', borderWidth: 3, padding: 20, borderRadius: 20, borderColor: '#4B2D83',
                  // marginBottom: 40 
                }}>
                  <Text style={styles.textDescription}>{textDescription}</Text>
                </View>
                {/* <Image source={theme.dark == true ? logoDark : logo} style={styles.image} /> */}
              </View>
            </View>
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