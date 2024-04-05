import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '../../constants/theme'
import { Order } from '../../types/dataTypes'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState } from 'react'
import { DownArrowIcon, RightArrowIcon, UpArrowIcon } from '../shared/Icons'

const OrderCard = ({ data }: { data: Order }) => {
  // console.log(data.lineItems.nodes[0].title)

  // const priceString = ;
  const price = parseFloat(data.totalPrice.amount + "").toFixed(2)
  const [open, setOpen] = useState<Boolean>(false);
  const [formattedDate, setFormattedDate] = useState<string | null>(null)

  useEffect(() => {
    setFormattedDate(formatDate());
  })



  const formatDate = () => {
    const pieces = data.processedAt.replace('T', ' ').replace('Z', '').replaceAll('-', '/').split('/');
    const formattedDate = pieces[1] + '/' + pieces[2].split(' ')[0] + '/' + pieces[0];
    return formattedDate;
  }



  return (

    // this could be a touchable, but the link doesnt pull anything up

    <View style={{ borderBottomWidth: 1, borderColor: 'black', paddingVertical: 8 }}>
      {!open ? (<View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.leftText}>
          {formattedDate}
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
          <Text style={styles.rightText}>
            {(price)} USD
          </Text>
          <TouchableOpacity style={{ marginLeft: 20, }} onPress={() => setOpen(!open)}>
            <DownArrowIcon size={30} color={'#4B2D83'} />
          </TouchableOpacity>
        </View>
      </View>) : (
        <View style={{ flexDirection: 'column' }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* <Text>
              {data.processedAt.replace('T', ' ').replace('Z', '').replaceAll('-', '/')}
            </Text> */}
            <Text style={styles.leftText}>
              {formattedDate}
            </Text>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.title, { color: theme.colors.infoText }]}>
                {(price)} USD
              </Text>
              <TouchableOpacity style={{ marginLeft: 20, }} onPress={() => setOpen(!open)}>
                <UpArrowIcon size={30} color={'#4B2D83'} />
              </TouchableOpacity>
            </View>
            {/* All of the info under */}

          </View>

          {/* items */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 }}>
            <Text style={styles.leftText}>
              Items
            </Text>
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {data.lineItems.nodes.map((item, index) => (<Text style={styles.rightText}>
                {item.title}
              </Text>))}
            </View>
          </View>

          {/*  */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <Text style={styles.leftText}>
              Status
            </Text>
            <Text style={styles.rightText}>
              {data.fulfillmentStatus}
            </Text>
          </View>
        </View>
      )
      }
    </View >

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
    // paddingVertical: 3
  },
  leftText: {
    fontSize: 14,
    fontWeight: '600'
  },
  rightText: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#555555'
  }
})