import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProfileStackParamList } from '../types/navigation'
import { BackArrow, BackArrowIcon } from '../components/shared/Icons'
import { theme } from '../constants/theme'
import { useAuthContext } from '../context/AuthContext'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import { Order } from '../types/dataTypes'
import OrderCard from '../components/profile/OrderCard'
import { TouchableOpacity } from 'react-native-gesture-handler'

type Props = NativeStackScreenProps<ProfileStackParamList, 'Orders'>

const Orders = ({ navigation }: Props) => {
  const { userToken } = useAuthContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.screenTitle}>Order History</Text>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: -16 }}>
          <BackArrow
            color={'#4B2D83'}
            size={20}
          />
        </TouchableOpacity>
      ),
    })
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    setErrorMessage('')

    if (!userToken) {
      setIsLoading(false)
      return
    }

    const query = `query {
      customer(customerAccessToken: "${userToken.accessToken}") {
        orders(first: 200) {
          nodes {
            id
            customerUrl
            fulfillmentStatus
            processedAt
            name
            totalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }`

    try {
      const response: any = await storefrontApiClient(query)

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }

      const reversedOrders = response.data.customer.orders.nodes.reverse() as Order[]
      setOrders(reversedOrders)

    } catch (e) {

      if (typeof e == 'string') {
        setErrorMessage(e)
      } else {
        setErrorMessage('Something went wrong. Try again.')
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <>
      {isLoading ?
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='small' />
        </View> :
        <>
          {orders.length != 0 ?
            <FlatList
              data={orders}
              renderItem={({ item }) => <OrderCard data={item} />}
              contentContainerStyle={styles.container}
              ItemSeparatorComponent={() => (
                <View style={{ borderBottomWidth: 0.5, borderColor: theme.colors.disabledText, marginHorizontal: -20 }}></View>
              )}
              showsVerticalScrollIndicator={false}
            /> :
            <ScrollView
              contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              scrollEnabled={false}
              keyboardDismissMode='on-drag'
            >
              <Text style={styles.text}>You haven't placed any order yet.</Text>
            </ScrollView>

          }
        </>
      }
    </>
  )
}

export default Orders

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  screenTitle: {
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 20
  },
  text: {
    color: theme.colors.text,
    // letterSpacing: 1.8
  },
})