import { View, Text, Image, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, NativeModules, StatusBar } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { CartStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { theme } from '../constants/theme'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import FillButton from '../components/shared/FillButton'
import { Entypo } from '@expo/vector-icons'
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet'
import { provinces } from '../constants/provinces'
import { AvailableShippingRatesType } from '../types/dataTypes'
import { useAuthContext } from '../context/AuthContext'
import Icon from 'react-native-vector-icons/FontAwesome'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import logoDark from '../../assets/logo-dark.png'
import logo from '../../assets/logo.png'


const screenHeight = Dimensions.get('screen').height
const textDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vel semper nisl. Morbi id diam et eros aliquet mollis. Sed cursus, justo ut pellentesque posuere, tortor turpis bibendum ante, eu fringilla mi arcu ac purus.';


type Props = NativeStackScreenProps<CartStackParamList, 'ShippingAddress'>

const ShippingAddress = ({ route, navigation }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const { userToken } = useAuthContext()
  const bottomSheetRef = useRef<BottomSheet>(null);


  const { StatusBarManager } = NativeModules
  const [sbHeight, setsbHeight] = useState<any>(StatusBar.currentHeight)

  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBarManager.getHeight((statusBarHeight: any) => {
        setsbHeight(Number(statusBarHeight.height))
      })
    }
  }, [])

  const { checkoutId, totalPrice } = route.params
  // console.log(totalPrice)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState(userToken ? userToken.customer.email : '')
  const [firstName, setFirstName] = useState(userToken ? userToken.customer.firstName : '')
  const [lastName, setLastName] = useState(userToken ? userToken.customer.lastName : '')
  const [phone, setPhone] = useState(userToken.customer?.phone || '')
  const [province, setProvince] = useState<{ code: string, province: string } | null>(null)
  const [zip, setZip] = useState('')
  const [selectedRateHandle, setSelectedRateHandle] = useState<string | null>(null);
  const [shippingOptionError, setShippingOptionError] = useState('');
  const [availableShippingRates, setAvailableShippingRates] = useState<AvailableShippingRatesType | null>(null);
  const [orderNotes, setOrderNotes] = useState('')
  const [defaultAddress, setDefaultAddress] = useState(null);

  const updateShippingOption = async () => {
    if (!selectedRateHandle) {
      setShippingOptionError('Please select a shipping option.');
      return;
    }
    setShippingOptionError('');
    setIsLoading(true);

    try {
      const query = `mutation checkoutShippingLineUpdate($checkoutId: ID!, $shippingRateHandle: String!) {
        checkoutShippingLineUpdate(checkoutId: $checkoutId, shippingRateHandle: $shippingRateHandle) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }`;

      const variables = {
        checkoutId,
        shippingRateHandle: selectedRateHandle
      };

      const response: any = await storefrontApiClient(query, variables);

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message;
      }

      if (response.data.checkoutShippingLineUpdate.checkoutUserErrors && response.data.checkoutShippingLineUpdate.checkoutUserErrors.length != 0) {
        throw response.data.checkoutShippingLineUpdate.checkoutUserErrors[0].message;
      }

      const webUrl = response.data.checkoutShippingLineUpdate.checkout.webUrl;

      // Here you can navigate to the payment screen or handle the webUrl as needed
      // For example: navigation.push('Payment', { webUrl, checkoutId, selectedRateHandle });
      navigation.push('Payment', { webUrl, checkoutId, selectedRateHandle })

    } catch (e) {
      console.log(e);
      if (typeof e === 'string') {
        setShippingOptionError(e);
      } else {
        setShippingOptionError('An error occurred while updating the shipping option.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateShippingAdress = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (!phone) {
      setErrorMessage('Please add your phone number.')
      setIsLoading(false)
      return
    }

    try {
      const query = `mutation checkoutEmailUpdateV2($checkoutId: ID!, $email: String!) {
        checkoutEmailUpdateV2(checkoutId: $checkoutId, email: $email) {
          checkout {
            id
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }`

      const variables = {
        checkoutId,
        email
      }

      const updateEmailResponse: any = await storefrontApiClient(query, variables)

      if (updateEmailResponse.errors && updateEmailResponse.errors.length != 0) {
        throw updateEmailResponse.errors[0].message
      }

      if (updateEmailResponse.data.checkoutEmailUpdateV2.checkoutUserErrors && updateEmailResponse.data.checkoutEmailUpdateV2.checkoutUserErrors.length != 0) {
        throw updateEmailResponse.data.checkoutEmailUpdateV2.checkoutUserErrors[0].message
      }

      const query2 = `mutation checkoutShippingAddressUpdateV2($checkoutId: ID!, $shippingAddress: MailingAddressInput!) {
        checkoutShippingAddressUpdateV2(checkoutId: $checkoutId, shippingAddress: $shippingAddress) {
          checkout {
            id
            availableShippingRates {
              ready
              shippingRates {
                handle
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }`

      if (province == null) {
        throw 'Please select a State.'
      }

      const variables2 = {
        checkoutId,
        allowPartialAddresses: true,
        shippingAddress: {
          address1: address1,
          address2: address2,
          city: city,
          company: "",
          country: "US",
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          province: province.code,
          zip: zip
        }
      }

      const response: any = await storefrontApiClient(query2, variables2)
      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }

      if (response.data.checkoutShippingAddressUpdateV2.checkoutUserErrors && response.data.checkoutShippingAddressUpdateV2.checkoutUserErrors.length != 0) {
        throw response.data.checkoutShippingAddressUpdateV2.checkoutUserErrors[0].message
      }

      const availableShippingRates: AvailableShippingRatesType = response.data.checkoutShippingAddressUpdateV2.checkout.availableShippingRates as AvailableShippingRatesType
      setAvailableShippingRates(availableShippingRates)
      // navigation.push('ShippingOptions', { checkoutId, availableShippingRates })

    } catch (e) {
      console.log(e)
      if (typeof e == 'string') {
        setErrorMessage(e)
      } else {
        setErrorMessage('Something went wrong. Try again.')
      }
    }

    setIsLoading(false)
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
        setDefaultAddress(fetchedDefaultAddress);
        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const updateCustomerAddress = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (userToken && defaultAddress) {
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

          const defaultAddressId = response.data.customer.defaultAddress.id

          const mutation = `mutation {
          customerAddressUpdate(
            customerAccessToken: "${userToken.accessToken}"
            id: "${defaultAddressId}"
            address: {
              address1: "${defaultAddress.address1}"
              address2: "${defaultAddress.address2}"
              city: "${defaultAddress.city}"
              province: "${defaultAddress.state}"
              country: "${defaultAddress.country}"
              zip: "${defaultAddress.zip}"
            }
          ) {
            customerAddress {
              id
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

        setIsLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    setIsLoading(false)
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
              address1: "${defaultAddress.address1}"
              address2: "${defaultAddress.address2}"
              city: "${defaultAddress.city}"
              province: "${defaultAddress.state}"
              country: "${defaultAddress.country}"
              zip: "${defaultAddress.zip}"
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
              address1: address1,
              address2: address2,
              city: city,
              state: state,
              country: country,
              zip: zip
            };

            setDefaultAddress(addressDict);
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
    return `${address1 ? `${address1}` : ''}${address2 ? `, ${address2}` : ''}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}${zip ? `, ${zip}` : ''}`;
  };

  useEffect(() => {
    getCustomerAddress()
  }, [userToken])

  useEffect(() => {
    if (defaultAddress && Object.keys(defaultAddress).length > 0) {
      updateCustomerAddress();
    }
  }, [defaultAddress]);

  useEffect(() => {
    if (defaultAddress) {
      setAddress1(defaultAddress.address1);
      setAddress2(defaultAddress.address2);
      setCity(defaultAddress.city);
      setProvince({ code: defaultAddress.province, province: defaultAddress.province });
      setZip(defaultAddress.zip);
    }
  }, [defaultAddress]);

  const sendToCheckOut = (shippingRate: { handle: any; title?: string; price?: { amount: number; currencyCode: string } }) => {
    setSelectedRateHandle(shippingRate.handle)
    updateShippingOption()
  }


  return (
    <>
      <View style={{ flex: 1 }} >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          ref={scrollViewRef}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 0, marginBottom: 15, paddingBottom: 5 }}>
            <Text style={{ textAlign: 'left', color: '#4B2D83', fontSize: 18, fontWeight: 'bold' }}>Order Total</Text>
            <Text style={{ textAlign: 'right', color: '#4B2D83', fontSize: 18, fontWeight: 'bold' }}>${totalPrice}</Text>
          </View>
          <TouchableOpacity style={{ borderWidth: 1, padding: 5, borderRadius: 10, backgroundColor: '#D9D9D9' }} onPress={() => bottomSheetRef.current?.expand()}>
            {defaultAddress ? (
              <View>
                <Text style={{ paddingLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#4B2D83' }}>
                  Delivering to:
                </Text>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ paddingLeft: 6, paddingBottom: 7, fontSize: 14, width: '80%' }}>
                  {formatAddress(defaultAddress)}
                </Text>
                {/* <Icon name="edit" size={20} color="#4B2D83" style={{ position: 'absolute', right: 10, bottom: 7 }} /> */}
              </View>
            ) : (
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ paddingLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#4B2D83' }}>
                  Where are we delivering?
                </Text>
                {/* <Icon name="edit" size={20} color="#4B2D83" style={{ position: 'absolute', right: 20, bottom: -2 }} /> */}
              </View>
            )}

          </TouchableOpacity>
          <TextInput
            placeholder='Phone'
            placeholderTextColor={theme.colors.disabledText}
            keyboardType='phone-pad'
            style={[styles.input, { marginBottom: 16 }]}
            onChangeText={(text) => setPhone(text)}
            autoCapitalize='none'
            autoComplete='tel'
            value={phone}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'position' : 'height'}
            keyboardVerticalOffset={44 + sbHeight}
          >
            <Text style={{ color: '#727272', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Leave a message!</Text>
            <TextInput
              placeholder='Apt #, door code, etc.'
              placeholderTextColor={'black'}
              keyboardType='default'
              style={{ width: '100%', height: 60, borderRadius: 15, backgroundColor: '#D9D9D9', padding: 10, textAlign: 'left' }}
              onChangeText={(text) => setOrderNotes(text)}
              value={orderNotes}
            />
            <View style={[styles.checkoutContainer, { height: errorMessage.length != 0 ? 68 : 50, marginBottom: 10 }]}>
              {isLoading ?
                <View style={{ width: 100, alignItems: 'center' }}>
                  <ActivityIndicator size='small' />
                </View> :
                <View>
                  {errorMessage.length != 0 &&
                    <Text style={styles.error}>{errorMessage}</Text>
                  }
                  <TouchableOpacity style={styles.updateContainer} onPress={updateShippingAdress}>
                    <Text style={styles.updateText}>Looks Good!</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </KeyboardAvoidingView>
          <View style={{ marginTop: 5 }}>
            {availableShippingRates && <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Select a shipping option:</Text>}
            {availableShippingRates && availableShippingRates.shippingRates.map((shippingRate) => (
              <TouchableOpacity
                key={shippingRate.handle}
                onPress={() => sendToCheckOut(shippingRate)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderColor: selectedRateHandle === shippingRate.handle ? '#4B2D83' : 'grey',
                  marginBottom: 10,
                }}
              >
                <Text>{shippingRate.title} - {shippingRate.price.amount} {shippingRate.price.currencyCode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>


      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Start closed
        enablePanDownToClose
        snapPoints={['90%']} // Set the heights of the bottom sheet
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
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 45 }}>
            <View style={{ width: '85%', borderWidth: 3, padding: 20, borderRadius: 20, borderColor: '#4B2D83', marginBottom: 40 }}>
              <Text style={styles.textDescription}>{textDescription}</Text>
            </View>
            <Image source={theme.dark == true ? logoDark : logo} style={styles.image} />
          </View>
        </View>
      </BottomSheet>
    </>
  )
}

export default ShippingAddress

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    paddingBottom: Platform.OS == 'ios' ? 280 : 20,
  },
  input: {
    marginTop: 16,
    fontSize: 16,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.text,
    padding: 5,
    paddingHorizontal: 4,
    color: theme.colors.text
  },
  countyPickerView: {
    marginTop: 16,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.text,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  county: {
    fontSize: 16
  },
  text: {
    color: theme.colors.text
  },
  provinceOptionTitle: {
    color: theme.colors.infoText,
    letterSpacing: 0.6,
    paddingVertical: 3
  },
  checkoutContainer: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.infoText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  provinceOptionsContainer: {
    alignItems: 'center',
    paddingTop: 16
  },
  error: {
    alignSelf: 'center',
    color: 'red',
    marginBottom: 4,
    letterSpacing: 1.8
  },
  textDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    letterSpacing: 1,
    paddingBottom: 8,
  },
  image: {
    width: '50%',
    height: '50%',
    resizeMode: 'contain',
  },
  updateContainer: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    width: '100%',
    backgroundColor: '#4B2D83',
    alignItems: 'center',
    borderRadius: 10,
  },
  updateText: {
    color: theme.colors.background,
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '500'
  }
})