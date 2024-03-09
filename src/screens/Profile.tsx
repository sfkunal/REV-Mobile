import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Image } from 'react-native'
import React, { useEffect } from 'react'
import { theme } from '../constants/theme'
import { ProfileStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Entypo } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'
import { useNavigationContext } from '../context/NavigationContext'
import { useAuthContext } from '../context/AuthContext'
import * as WebBrowser from 'expo-web-browser'
import { config } from '../../config'
import { MailIcon, RightArrowIcon } from '../components/shared/Icons'
import { useCartContext } from '../context/CartContext'
import phone from '../../assets/phone.png'

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>

const Profile = ({ navigation }: Props) => {
  const { userToken, signOut } = useAuthContext()
  const { rootNavigation } = useNavigationContext()
  const { getItemsCount, getTotalPrice, cartItems } = useCartContext()

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <>
  //         {userToken ?
  //           <TouchableOpacity onPress={() => signOut()}>
  //             <Text style={styles.textButton}>LOG OUT</Text>
  //           </TouchableOpacity> :
  //           <TouchableOpacity onPress={() => rootNavigation.push('LoginStackNavigator', { screen: 'Login' })}>
  //             <Text style={styles.textButton}>LOG IN</Text>
  //           </TouchableOpacity>
  //         }
  //       </>
  //     )
  //   })
  // }, [userToken])

  // const deleteAccount = () => {
  //   Alert.alert(
  //     'Delete Account',
  //     'Are you sure that you want to delete your account? Please note that there is no option to restore your account or its data. You would still be able to check your order status using its order number.',
  //     [
  //       {
  //         text: 'Delete Account',
  //         style: 'destructive',
  //         onPress: () => signOut()
  //       },
  //       {
  //         text: 'Cancel',
  //         style: 'cancel'
  //       }
  //     ]
  //   )
  // }

  return (
    <View style={styles.container}>
      {/* upper */}
      <View>
        {/* Hi, Username */}
        <Text style={{
          fontSize: 20,
          marginVertical: 8,
          fontWeight: 'bold', color: '#4B2D83'
        }}>Hi, {userToken?.customer.firstName}</Text>



        {/* FEATURES COMING SOON */}
        {/* using 0.5 hours per order? */}
        {/* using 0.8 because 400g (0.4kg) of co2 emitted per mile of driving */}
        {/* TODO UPDATE THIS, should not be based on items count */}
        <Text style={{ marginBottom: 40, fontSize: 13, fontWeight: '300' }}>
          You saved {getItemsCount() * 0.5} hours shopping and prevented {Math.round((getItemsCount() * 0.8) * 100) / 100} kg of carbon emissions!
        </Text>

        {/* REVPASS COMING SOON */}
        <TouchableOpacity style={{
          backgroundColor: '#FFFFFF', borderRadius: 8, height: 50, display: 'flex', justifyContent: 'center',
          marginBottom: 40,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6, shadowColor: '#4B2D83'
        }}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Text style={{ fontWeight: 'bold', color: '#4B2D83', fontSize: 18, marginLeft: 10 }}>
              REV Pass & Rewards{" "}
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
              Coming Soon!
            </Text>
          </View>
        </TouchableOpacity >

        {/* REV REWARDS Coming Soon! */}
        {/* <TouchableOpacity style={{
          backgroundColor: '#FFFFFF', borderRadius: 8, height: 100, display: 'flex', justifyContent: 'space-between',
          shadowColor: 'black', shadowRadius: 2,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          marginBottom: 18
        }}>
          <View style={{}}>
            <Text style={{ fontWeight: '700', color: '#4B2D83', fontSize: 18, marginLeft: 16, marginTop: 24, }}>
              Invite friends, earn $$$
            </Text>
            <Text style={{ fontWeight: '300', color: 'black', fontSize: 18, marginLeft: 16, marginTop: 6 }}>
              REV Rewards coming soon!
            </Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
          </View>
        </TouchableOpacity > */}
      </View>

      {/* Lower */}
      <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'column' }} >
        {/* STORE HOURS */}
        < View style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          height: 130,
          marginBottom: 24,
          // borderWidth: 1,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          shadowColor: 'black', shadowRadius: 1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6
        }}>
          <View style={{ display: 'flex', marginLeft: 12, marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#4B2D83' }}>
              Store Hours
            </Text>
            <View style={{ marginLeft: 8, marginTop: 16, flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '300' }}>Sunday - Thursday: 11AM - 12AM</Text>
              <View style={{ width: 250, height: 1, borderRadius: 2, backgroundColor: '#3C3C4333' }}></View>
              <Text style={{ fontSize: 18, fontWeight: '300', }}>Friday - Saturday: 11AM - 1AM</Text>
            </View>

          </View>
        </View>

        {/* CONTACT US */}
        <View style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          height: 130,
          marginBottom: 24,
          // borderWidth: 1,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          shadowColor: 'black', shadowRadius: 1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6
        }}>
          <View style={{ display: 'flex', marginLeft: 12, marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#4B2D83' }}>
              Contact Us
            </Text>
            <View style={{ marginLeft: 8, marginTop: 16, flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginBottom: 20 }}>
              {/* MAIL CONTAINER */}
              <View style={{ display: 'flex', flexDirection: 'row' }}>
                <View style={{ justifyContent: 'center', marginRight: 6, marginTop: 2 }}>
                  <MailIcon color={'black'} size={20} />
                </View>

                <Text style={{ fontSize: 18, fontWeight: '300', textDecorationLine: 'underline' }}>team@rev.delivery</Text>
              </View>

              <View style={{ width: 250, height: 1, borderRadius: 2, backgroundColor: '#3C3C4333' }}></View>

              {/* Phone container */}
              <View style={{ display: 'flex', flexDirection: 'row' }}>
                <Image source={phone} style={{ width: 20, height: 20, marginRight: 2 }} />
                <Text style={{ fontSize: 18, fontWeight: '300', textDecorationLine: 'underline' }}>(206)833-6358</Text>
              </View>

            </View>

          </View>
        </View>
        {/* JOIN THE TEAM */}
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            Linking.openURL('https://form.jotform.com/240597752831060')
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 'bold', marginLeft: 26 }}>Join the Team</Text>
          {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
          <View style={{ marginRight: 4 }}>
            <RightArrowIcon size={40} color={'#4B2D83'} />
          </View>
        </TouchableOpacity>
      </View>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    width: '95%',
    alignSelf: 'center',
    marginTop: 12,
    // backgroundColor: '#f2f2f2',
    flexDirection: 'column',
    // justifyContent: 'space-between',
  },
  greeting: {
    color: theme.colors.text,
    fontSize: 20,
    letterSpacing: 1,
    // marginBottom: 32
  },
  text: {
    color: theme.colors.text
  },
  textButton: {
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontSize: 15,
    fontWeight: '500'
  },
  subTitle: {
    color: theme.colors.infoText,
    letterSpacing: 1,
  },
  settingTitle: {
    color: '#000000',
    letterSpacing: 1,
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 8
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: 8,
    // borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: 'black', shadowRadius: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6
  }
})

export default Profile