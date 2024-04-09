import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { CartItem } from '../../types/dataTypes'
import { theme } from '../../constants/theme'
import { useCartContext } from '../../context/CartContext'
import Icon from 'react-native-vector-icons/FontAwesome'

const screenWidth = Dimensions.get('screen').width

const CartCard = ({ cartItem }: { cartItem: CartItem }) => {
  const { addQuantityOfItem, substractQuantityOfItem, removeItemFromCart, getItemsCount } = useCartContext()

  return (
    <View style={styles.container}>
      <Image source={{ uri: cartItem.image.url }} style={[styles.image, { height: 100 }]} resizeMode='contain' />
      <View style={styles.detailsContainer}>

        <View style={{ width: 170 }}>
          <Text numberOfLines={2} style={styles.title}>{cartItem.product.title}</Text>

          {/* price of the item under the title */}
          <Text style={styles.price}>{(cartItem.price.amount * cartItem.quantity).toFixed(2)} USD</Text>
          {cartItem.title != 'Default Title' &&
            <Text style={styles.options}>{cartItem.title.replaceAll('/', '|').toUpperCase()}</Text>

          }
        </View>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.quantitySelector}>

            <TouchableOpacity
              onPress={() => {
                substractQuantityOfItem(cartItem.id, 1)
              }}
            >
              <Text style={{ color: '#4B2D83', fontWeight: 'bold', fontSize: 20, paddingHorizontal: 8, paddingVertical: 4 }}>-</Text>
            </TouchableOpacity>
            {/* <View style={{ backgroundColor: 'orange', display: 'flex', flexDirection: 'row', alignItems: 'center', width: 70, }}> */}
            <Text style={styles.quantity}>{cartItem.quantity}</Text>
            {/* </View> */}



            <TouchableOpacity
              onPress={() => addQuantityOfItem(cartItem.id, 1)}
            >
              <Text style={{
                color: '#4B2D83', fontWeight: 'bold', fontSize: 20,
                //  fontSize: Platform.OS == 'ios' ? 22 : 17, 
                paddingHorizontal: 8, paddingVertical: 4
              }}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItemFromCart(cartItem.id)} style={{ paddingRight: 8, marginTop: 0 }}>
            {/* <Icon name="times" size={18} color="#4B2D83" style={{ padding: 2 }} /> */}
            {/* where is the trash can??? */}
            {/* <Image source={TrashCan} style={{ height: 30, width: 30, backgroundColor: 'yellow' }} resizeMode='contain' /> */}
            <Image source={require('../../assets/TrashCan.png')} style={{ height: 34, width: 34 }} resizeMode='contain' />

            {/* <TrashCan /> */}
            {/* <BackArrow color='#D9D9D9' size={30} /> */}
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
    paddingTop: 15,
    paddingBottom: 10,
    // height: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#D9D9D9',

  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: 'black',
    fontWeight: '500',
    letterSpacing: 0.1,
    marginRight: 6,
    fontSize: 20,
  },
  options: {
    color: theme.colors.text,
    fontSize: 13,
    letterSpacing: 1.5,
    paddingTop: 16
  },
  price: {
    color: '#9E9EA1',
    fontWeight: '600',
    letterSpacing: 0,
    paddingTop: 2
  },
  image: {
    width: (screenWidth - 56) * 0.45,
    maxHeight: (screenWidth - 28) * 0.45 * 1.5,
    margin: 5
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    color: '#4B2D83',
    fontSize: 25,
    textAlign: 'center',
    paddingHorizontal: Platform.OS == 'ios' ? 16 : 14,
    fontWeight: 'bold',
    minWidth: 38,
    // backgroundColor: 'orange'
  }
})

