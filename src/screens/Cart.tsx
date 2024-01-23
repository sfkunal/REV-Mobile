import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CartStackParamList } from '../types/navigation'
import { useCartContext } from '../context/CartContext'
import { FlatList } from 'react-native-gesture-handler'
import CartCard from '../components/cart/CartCard'
import FillButton from '../components/shared/FillButton'
import { useNavigationContext } from '../context/NavigationContext'
import { useAuthContext } from '../context/AuthContext'
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from '@gorhom/bottom-sheet'

type Props = NativeStackScreenProps<CartStackParamList, 'Cart'>

const Cart = ({ navigation }: Props) => {
  const { getItemsCount, getTotalPrice, cartItems } = useCartContext()
  const { userToken } = useAuthContext()
  const { rootNavigation } = useNavigationContext()
  const totalPrice = getTotalPrice()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.screenTitle}>Cart ({getItemsCount()})</Text>
      )
    })
  }, [getItemsCount])

  const createCheckout = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const query = `mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
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
        input: {
          "allowPartialAddresses": true,
          "lineItems": cartItems.map((item) => (
            {
              variantId: item.id,
              quantity: item.quantity
            }
          ))
        }
      }

      const response: any = await storefrontApiClient(query, variables)

      if (response.errors && response.errors.length != 0) {
        setIsLoading(false)
        throw response.errors[0].message
      }

      if (response.data.checkoutCreate.checkoutUserErrors && response.data.checkoutCreate.checkoutUserErrors.length != 0) {
        setIsLoading(false)
        throw response.data.checkoutCreate.checkoutUserErrors[0].message
      }

      if (userToken) {
        const query2 = `mutation checkoutCustomerAssociateV2($checkoutId: ID!, $customerAccessToken: String!) {
          checkoutCustomerAssociateV2(checkoutId: $checkoutId, customerAccessToken: $customerAccessToken) {
            checkout {
              id
            }
            checkoutUserErrors {
              code
              field
              message
            }
            customer {
              id
            }
          }
        }`

        const variables2 = {
          checkoutId: response.data.checkoutCreate.checkout.id,
          customerAccessToken: userToken.accessToken
        }

        const response2: any = await storefrontApiClient(query2, variables2)

        if (response2.errors && response2.errors.length != 0) {
          console.log('Associate customer failed.')
          console.log(response2.errors[0].message)
        }

      }

      rootNavigation.push('ShippingAddress', { checkoutId: response.data.checkoutCreate.checkout.id })

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
    <>
      {cartItems.length == 0 ?
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.empty}>Cart is empty.</Text>
        </View> :
        <LinearGradient colors={['#FFFFFF', '#D9D9D9', '#FFFFFF']} style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            renderItem={({ item }) => <CartCard cartItem={item} />}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          />
          <View style={[styles.checkoutContainer, { height: errorMessage.length != 0 ? 68 : 150}]}>
            {isLoading ?
              <View style={{ width: 100, alignItems: 'center' }}>
                <ActivityIndicator size='small' />
              </View> :
              <View style={{borderWidth: 3}}>
                {errorMessage.length != 0 &&
                  <Text style={styles.error}>{errorMessage}</Text>
                }
                <View style={{ flexDirection: 'column', borderWidth: 1, width: '70%', alignSelf: 'center' }}>
                  <View style={{ flexDirection: 'row', paddingVertical: 4, width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{}}>Subtotal:</Text>
                    <Text style={{}}>{totalPrice} USD</Text>
                  </View>
                  <View style={{ flexDirection: 'row', paddingVertical: 4, width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{}}>Tax: </Text>
                    <Text style={{}}>0.99 USD</Text>
                  </View>
                  <View style={{ flexDirection: 'row', paddingVertical: 4, width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{}}>Total: </Text>
                    <Text style={{}}>{totalPrice + 0.99} USD</Text>
                  </View>
                </View>
                {/* <FillButton
                  title='CHECKOUT'
                  onPress={createCheckout}
                /> */}
                <TouchableOpacity onPress={createCheckout} style={styles.reviewOrderContainer}>
                  <Text>hi</Text>
                </TouchableOpacity>
              </View>
            }

          </View>
        </LinearGradient>
      }
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  text: {
    color: theme.colors.text
  },
  empty: {
    color: theme.colors.text,
    fontSize: 15,
    letterSpacing: 1
  },
  checkoutContainer: {
    // height: 50,
    borderColor: theme.colors.infoText,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14
  },
  error: {
    alignSelf: 'center',
    color: 'red',
    marginBottom: 4,
    letterSpacing: 1.8
  },
  screenTitle: {
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.text,
    fontSize: 16
  },
  reviewOrderContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4B2D83', 
    alignItems:'center',
    width: 250,
    alignSelf: 'center',
  },
})

export default Cart