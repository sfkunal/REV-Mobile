import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { CartItem } from '../../types/dataTypes'
import { theme } from '../../constants/theme'
import { useCartContext } from '../../context/CartContext'
import Icon from 'react-native-vector-icons/FontAwesome'

const screenWidth = Dimensions.get('screen').width

const CartCard = ({ cartItem }: { cartItem: CartItem }) => {
  const { addQuantityOfItem, substractQuantityOfItem, removeItemFromCart } = useCartContext()

  return (
    <View style={styles.container}>
      <Image source={{ uri: cartItem.image.url }} style={[styles.image, { height: 100 }]} resizeMode='contain' />
      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.title}>{cartItem.product.title.toUpperCase()}</Text>
          <Text style={styles.price}>{cartItem.price.amount} USD</Text>
          {cartItem.title != 'Default Title' &&
            <Text style={styles.options}>{cartItem.title.replaceAll('/', '|').toUpperCase()}</Text>
          }
        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.quantitySelector}>

            <TouchableOpacity
              onPress={() => substractQuantityOfItem(cartItem.id)}
            >
              <Text style={{ color: '#4B2D83', fontWeight: 'bold', fontSize: 28, paddingHorizontal: 8, paddingVertical: 4 }}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{cartItem.quantity}</Text>

            <TouchableOpacity
              onPress={() => addQuantityOfItem(cartItem.id)}
            >
              <Text style={{ color: '#4B2D83', fontWeight: 'bold', fontSize: Platform.OS == 'ios' ? 22 : 17, paddingHorizontal: 8, paddingVertical: 4 }}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItemFromCart(cartItem.id)} style={{ paddingRight: 15 }}>
            <Icon name="times" size={18} color="#4B2D83" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default CartCard

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: screenWidth - 28,
    paddingTop: 16,
    // height: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between'
  },
  title: {
    color: 'black',
    fontWeight: '500',
    letterSpacing: 1.5,
    margin: 3
  },
  options: {
    color: theme.colors.text,
    fontSize: 13,
    letterSpacing: 1.5,
    paddingTop: 16
  },
  price: {
    color: 'grey',
    fontWeight: '600',
    letterSpacing: 1.5,
    paddingTop: 4
  },
  image: {
    width: (screenWidth - 28) * 0.45,
    maxHeight: (screenWidth - 28) * 0.45 * 1.5,
    margin: 5
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    color: '#4B2D83',
    fontSize: 15,
    paddingHorizontal: Platform.OS == 'ios' ? 16 : 14,
    width: 38,
    fontWeight: 'bold'
  }
})