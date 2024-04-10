import { View, Text, ScrollView, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import { LoginStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import { BackArrow, WhiteLogo } from '../components/shared/Icons'

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
        // console.log(response.data.customerRecover.customerUserErrors)
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
      style={{ flex: 1, height: '100%' }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '95%', alignItems: 'center' }}>
          <Text style={{ fontWeight: '900', color: '#4B2D83', fontSize: 30, fontStyle: 'italic', marginBottom: 10, marginTop: 10 }}>
            Forgotten password?
          </Text>
          <Text style={{ fontWeight: '300', fontSize: 14, width: '90%' }}>
            All good! Just enter your email and check your inbox.
          </Text>
        </View>

        {errorMessage ? (
          <View style={{ height: 32, marginTop: 12 }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</Text>
          </View>
        ) : (
          <View style={{ height: 32 }}>
            <Text style={{ color: theme.colors.background }}>peco</Text>
          </View>
        )}

        <View style={{ width: '75%', display: 'flex', alignItems: 'flex-start' }}>
          <Text style={styles.inputSubTitle}>Email</Text>
          <TextInput
            placeholder='rev@delivery.com'
            placeholderTextColor={theme.colors.disabledText}
            autoCapitalize='none'
            autoCorrect={false}
            onChangeText={setEmail}
            value={email}
            style={email ? styles.input : styles.inputEmpty}
          />


          <View style={{ height: '20%' }} />
        </View>


        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ width: '100%', alignItems: 'center', display: 'flex' }}>
        {loading ? (
          <View style={{
            backgroundColor: '#4B2D83',
            width: 300,
            height: 50,
            // paddingHorizontal: 140,
            // paddingVertical: 12,
            maxWidth: '100%',
            borderRadius: 30,
            marginBottom: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
            <ActivityIndicator />
          </View>

        ) : (
          <TouchableOpacity
            onPress={resetPasswordButton}
            style={{
              backgroundColor: '#4B2D83',
              width: 300,
              height: 50,
              // paddingHorizontal: 100,
              // paddingVertical: 12,
              maxWidth: '100%',
              borderRadius: 30,
              marginBottom: 50,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
              Reset Password
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    height: '100%',
  },
  text: {
    color: theme.colors.text
  },
  input: {
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
  },
  inputSubTitle: {
    color: '#4B2D83',
    fontSize: 14,
    marginLeft: 6,
    marginBottom: 4
  },
})

export default ForgotPassword