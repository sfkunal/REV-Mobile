import { View, Text, ScrollView, TextInput, StyleSheet, ActivityIndicator, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import logoDark from '../../assets/logo-dark.png'
import logo from '../../assets/logo.png'
import { theme } from '../constants/theme'
import { LoginStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import FillButton from '../components/shared/FillButton'
import { config } from '../../config'
import { BackArrow, BackArrowIcon, WhiteLogo } from '../components/shared/Icons'

export type Props = NativeStackScreenProps<LoginStackParamList, 'ForgotPassword'>





const ForgotPassword = ({ navigation }: Props) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

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

  const resetPasswordButton = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // await sendPasswordResetEmail(auth, email)
      const query = `mutation recoverCustomerAccount($email: String!) {
        customerRecover(email: $email) {
          customerUserErrors {
            code
            field
            message
          }
        }
      }`

      const variables = { email }

      const response: any = await storefrontApiClient(query, variables)

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }

      if (response.data.customerRecover.customerUserErrors.length != 0) {
        console.log(response.data.customerRecover.customerUserErrors)
        throw response.data.customerRecover.customerUserErrors[0].message
      }

      navigation.push('ForgotPasswordEmailSent')
    } catch (error: any) {
      typeof error === 'string' && setErrorMessage(error)
    }

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{ flex: 1, }}
    >
      <View style={styles.container} >
        <View style={{ width: '95%', alignItems: 'center' }}>
          <Text style={{ fontWeight: '900', color: '#4B2D83', fontSize: 38, fontStyle: 'italic', marginBottom: 10, marginTop: 10 }}>
            Forgot your password?
          </Text>
          <Text style={{ fontWeight: '300', fontSize: 14, width: '75%' }} >
            All good! Enter your email and check your inbox to reset your password.
          </Text>
        </View>


        {errorMessage ?
          <View style={{ height: 32, marginTop: 12 }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</Text>
          </View> :
          <View style={{ height: 32 }}><Text style={{ color: theme.colors.background }}>peco</Text></View>
        }

        <View style={{ width: '75%', display: 'flex', alignItems: 'flex-start' }}>
          <Text style={styles.inputSubTitle}>
            Email
          </Text>
          <TextInput
            // placeholder="First Name"
            placeholderTextColor={theme.colors.disabledText}
            onChangeText={setEmail}
            value={email}
            style={email ? (styles.input) : (styles.inputEmpty)}
          />
          <View style={{ height: '20%' }} />
        </View>


        {loading ?
          <ActivityIndicator /> :
          <TouchableOpacity onPress={resetPasswordButton} style={{
            backgroundColor: '#4B2D83', paddingHorizontal: 40, paddingVertical: 8, maxWidth: '90%', borderRadius: 20,
            marginTop: 0,
            display: 'flex', justifyContent: 'center', flexDirection: 'row',
          }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
              Reset Password
            </Text>
          </TouchableOpacity>
          // <TouchableOpacity style={styles.buttonContainer} onPress={resetPasswordButton}>
          //   <Text style={styles.buttonText}>Reset Password</Text>
          // </TouchableOpacity>
        }

        {/* <Text
          style={{ color: theme.colors.primary, fontWeight: '500', marginLeft: 4, marginTop: 64, fontSize: 16 }}
          onPress={() => { navigation.navigate('Login') }}
        >
          Go Back
        </Text> */}

      </View>
    </KeyboardAvoidingView >
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // paddingTop: 32,
  },
  text: {
    color: theme.colors.text
  },
  image: {
    width: config.logoWidth,
    height: config.logoWidth * config.logoSizeRatio,
    marginBottom: 48,
  },
  input: {
    // marginTop: 15,
    fontSize: 18,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    padding: 10,
    paddingLeft: 16,
    paddingHorizontal: 4,
    color: theme.colors.text,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: '#4B2D83',
    // marginBottom: 12,
  },
  inputEmpty: {
    fontSize: 18,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    padding: 10,
    paddingLeft: 16,
    paddingHorizontal: 4,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: '#4B2D83',
    // marginBottom: 12,
  },
  buttonContainer: {
    // paddingVertical: 6,
    // paddingHorizontal: 20,
    width: '60%',
    backgroundColor: '#4B2D83',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: '500'
  },
  inputSubTitle: {
    color: '#4B2D83',
    fontSize: 14,
    marginLeft: 6,
    marginBottom: 4
  },
}
)

export default ForgotPassword