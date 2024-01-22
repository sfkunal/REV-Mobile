import { View, Text, StyleSheet, Image, Dimensions, TouchableWithoutFeedback, FlatList, Modal, ActivityIndicator, NativeModules, StatusBar, Platform, TextInput, Touchable } from 'react-native'
import { useEffect, useState, useRef } from 'react'
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
import { TouchableOpacity } from 'react-native-gesture-handler'
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the Icon component
// import GooglePlacesInput from './AddressAutocomplete'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'

// import { useNavigationContext } from '../context/NavigationContext'


const windowHeight = Dimensions.get('window').height - 50 - (hasHomeIndicator ? 30 : 0)
const screenWidth = Dimensions.get('screen').width;

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
  const [selectedMode, setSelectedMode] = useState('forYou'); // 'forYou' or 'explore'
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address>({});


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

    try {
      const query = `query {
        collection(id: "gid://shopify/Collection/469310570784") {
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

  useEffect(() => {
    fetchUserOrders()
    fetchPopularProducts()
    fetchForYou()
    fetchExploreProducts()
    getCustomerAddress()
  }, [userToken, userOrders])

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

  const HomeList = ({ data }) => (
    <View style={{ paddingTop: 10, paddingBottom: sbHeight + 220 }}>
      <FlatList
        data={data}
        renderItem={({ item }) => <ProductCard data={item} />}
        keyExtractor={item => item.id} // Make sure to have a keyExtractor for unique keys
        ItemSeparatorComponent={ItemSeparator} // Add this line
        keyboardDismissMode='on-drag'
        showsVerticalScrollIndicator={true}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 14 }}
      />
    </View>
  );

  const GooglePlacesInput = () => {
    return (
      <GooglePlacesAutocomplete
        placeholder='Where To?'
        fetchDetails={true}
        minLength={3}
        onPress={(data, details = null) => {
          bottomSheetRef.current?.close();
          if (details) {
            const addressComponents = details.address_components;
            const address1 = `${addressComponents.find(c => c.types.includes('street_number'))?.long_name} ${addressComponents.find(c => c.types.includes('route'))?.long_name}`;
            const address2 = addressComponents.find(c => c.types.includes('subpremise'))?.long_name; // This line is new
            const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
            const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
            const country = addressComponents.find(c => c.types.includes('country'))?.short_name;
            const zip = addressComponents.find(c => c.types.includes('postal_code'))?.long_name;
            const addressDict = {
              address1: address1 ? address1 : '',
              address2: address2 ? address2 : '',
              city: city ? city : '',
              state: state ? state : '',
              country: country ? country : '',
              zip: zip ? zip : '',
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
                {selectedAddress ? (
                  <View>
                    <Text style={{ paddingLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#4B2D83' }}>
                      Delivering to:
                    </Text>
                    <Text style={{ paddingLeft: 6, paddingBottom: 7, fontSize: 14, width: '80%' }}>
                      {formatAddress(selectedAddress)}
                    </Text>
                    {/* <Icon name="edit" size={20} color="#4B2D83" style={{ position: 'absolute', right: 10, bottom: 7 }} /> */}
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ paddingLeft: 6, paddingBottom: 7, fontSize: 14, fontWeight: 'bold', color: '#4B2D83' }}>
                      Where are we delivering?
                    </Text>
                    {/* <Icon name="edit" size={20} color="#4B2D83" style={{ position: 'absolute', right: 20, bottom: -2 }} /> */}
                  </View>
                )}

              </TouchableOpacity>

              <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => setSelectedMode('forYou')}
                  style={selectedMode === 'forYou' ? styles.selectedMode : styles.notSelectedMode}>
                  <Text style={{
                    color: selectedMode === 'forYou' ? 'white' : theme.colors.text,
                    fontSize: 18,
                    letterSpacing: 1.8,
                    fontWeight: '500',
                    paddingLeft: 10,
                    paddingRight: 10 // Add some space between the two buttons
                  }}>
                    {userToken ? 'For ' + userToken.customer.firstName : 'FOR YOU'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedMode('explore')}
                  style={selectedMode === 'explore' ? styles.selectedMode : styles.notSelectedMode}>
                  <Text style={{
                    color: selectedMode === 'explore' ? 'white' : theme.colors.text,
                    fontSize: 18,
                    letterSpacing: 1.8,
                    fontWeight: '500',
                    paddingLeft: 10,
                    paddingRight: 10
                  }}>
                    Explore
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <HomeList data={selectedMode === 'explore' ? exploreProducts : (userOrders > 4 ? forYou : popularProducts)} />
          </View>
          <BottomSheet
            ref={bottomSheetRef}
            index={-1} // Start closed
            enablePanDownToClose
            snapPoints={['60%']} // Set the heights of the bottom sheet
          >
            <View
              style={{
                margin: 12,
                backgroundColor: "transparent",
                zIndex: 10,
                height: 400,
              }}
            >
              <GooglePlacesInput />
            </View>
          </BottomSheet>
        </>
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
    width: config.logoWidth,
    height: config.logoWidth * config.logoSizeRatio,
    alignSelf: 'center'
  },
  addressBox: {
    // height: 40,
    borderColor: 'black',
    // borderWidth: 1,
    // borderRadius: 7,
    flexDirection: 'row',
    marginTop: '2%',
    alignSelf: 'center',
    width: '93%',
    justifyContent: 'flex-start', // Add this line to center content vertically
    borderBottomWidth: 2,
    borderBottomColor: '#4B2D83',
  },
  selectedMode: {
    backgroundColor: '#4B2D83',
    borderRadius: 20, // Optional: if you want rounded corners
    padding: 5, // Adjust padding as needed
  },
  notSelectedMode: {
    // backgroundColor: 'purple',
    borderRadius: 20, // Optional: if you want rounded corners
    padding: 5, // Adjust padding as needed
  },
})

export default Home