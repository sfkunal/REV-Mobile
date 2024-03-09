import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '../../constants/theme'
import { Order } from '../../types/dataTypes'
import * as WebBrowser from 'expo-web-browser'

const OrderCard = ({ data }: { data: Order }) => {
  console.log(data)

  // const priceString = ;
  const price = parseFloat(data.totalPrice.amount + "").toFixed(2)
  return (

    // this could be a touchable, but the link doesnt pull anything up
    <TouchableOpacity
      // onPress={() => WebBrowser.openBrowserAsync(data.customerUrl)}
      style={{ paddingVertical: 6 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Order</Text>
        <Text style={[styles.title, { color: theme.colors.infoText }]}>{data.name}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Status</Text>
        <Text style={[styles.title, { color: theme.colors.infoText }]}>{data.fulfillmentStatus}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Date</Text>
        <Text style={[styles.title, { color: theme.colors.infoText }]}>{data.processedAt.replace('T', ' ').replace('Z', '').replaceAll('-', '/')}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Total Price</Text>
        <Text style={[styles.title, { color: theme.colors.infoText }]}>{(price)} USD</Text>
      </View>
    </TouchableOpacity>
  )
}

export default OrderCard

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1
  },
  title: {
    color: theme.colors.text,
    // letterSpacing: 1.8,
    paddingVertical: 3
  }
})