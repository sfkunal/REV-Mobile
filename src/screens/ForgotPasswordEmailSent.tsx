import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native'
import { theme } from '../constants/theme'
import { LoginStackParamList } from '../types/navigation'
import logoDark from '../assets/logo-dark.png'
import logo from '../assets/logo.png'
import { config } from '../../config'
import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { BackArrow, WhiteLogo } from '../components/shared/Icons'

export type Props = NativeStackScreenProps<LoginStackParamList, 'ForgotPasswordEmailSent'>

const ForgotPasswordEmailSent = ({ navigation }: Props) => {

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: -20 }}>
          <BackArrow
            color={'#4B2D83'}
            size={20}
          />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <WhiteLogo />
      )
    });
  })
  return (

    <View style={styles.container} >
      {/* <Image source={theme.dark == true ? logoDark : logo} style={styles.image} /> */}
      <View style={{ display: 'flex', width: '90%', height: 100, justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
        <Text style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 40 }}>
          Email sent!
        </Text>
        <Text style={styles.text}>Check your email inbox to reset your password. Make sure to check the spam or junk folder too </Text>

      </View>



      {/* <Text
          style={{ color: theme.colors.primary, fontWeight: '500', marginLeft: 4, marginTop: 64, fontSize: 16 }}
          onPress={() => { navigation.navigate('Login') }}
        >
          Back to Login
        </Text> */}

      <TouchableOpacity onPress={() => { navigation.navigate('Login') }}
        style={{ backgroundColor: '#4B2D83', paddingHorizontal: 80, paddingVertical: 12, maxWidth: '100%', borderRadius: 30, marginTop: 28, display: 'flex', justifyContent: 'center', flexDirection: 'row', marginBottom: 75 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }} numberOfLines={1}>
          Back to Login
        </Text>
      </TouchableOpacity>

    </View>

  )
}

export default ForgotPasswordEmailSent

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    paddingTop: 32,
    justifyContent: 'space-between',
  },
  text: {
    paddingHorizontal: 32,
    fontSize: 16,
    textAlign: 'left',
    fontWeight: '300'
  },
  image: {
    width: config.logoWidth,
    height: config.logoWidth * config.logoSizeRatio,
    marginBottom: 96,
  },
}
)