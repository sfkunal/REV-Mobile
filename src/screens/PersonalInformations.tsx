import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import * as SecureStore from 'expo-secure-store'
import { useAuthContext } from '../context/AuthContext'
import { storefrontApiClient } from '../utils/storefrontApiClient'
import FillButton from '../components/shared/FillButton'
import { ProfileStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { BackArrow, BackArrowIcon } from '../components/shared/Icons'

type Props = NativeStackScreenProps<ProfileStackParamList, 'PersonalInformations'>

const PersonalInformations = ({ navigation }: Props) => {
  const { userToken, dispatch } = useAuthContext()
  const [email, setEmail] = useState(userToken.customer?.email || '')
  const [firstName, setFirstName] = useState(userToken.customer?.firstName || '')
  const [lastName, setLastName] = useState(userToken.customer?.lastName || '')
  const [phone, setPhone] = useState(userToken.customer?.phone || '')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [succesMessage, setSuccesMessage] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState(userToken.customer?.phone || '')

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.screenTitle}>Personal</Text>
      ),
      headerLeft: () => (
        <>
          {Platform.OS == 'ios' ?
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: -16 }}>
              <BackArrow
                color={'#4B2D83'}
                size={20}

              />
            </TouchableOpacity>

            :
            null
          }
        </>
      ),
    })
  }, [])

  // formats the phone number to be in the format of (XXX)XXX-XXXX
  const handlePhoneNumberChange = (value) => {
    const cleanedNumber = value.replace(/\D/g, '')
    // clean the phone number
    // replace all non-numbers with nothing. Now we have a string of just numbers
    let formattedNumber = '';

    // if length (0,3] => (XXX)
    if (cleanedNumber.length > 0) {
      formattedNumber = `(${cleanedNumber.slice(0, 3)}`
    }
    if (cleanedNumber.length >= 4) {
      formattedNumber += `) ${cleanedNumber.slice(3, 6)}`;
    }
    if (cleanedNumber.length >= 7) {
      formattedNumber += `-${cleanedNumber.slice(6, 10)}`;
    }
    console.log(phoneToE164(cleanedNumber))
    setPhone(formattedNumber)
  }

  const phoneToE164 = (number) => {
    return `+1${number}`
  }


  const changeInfo = async () => {
    setLoading(true)
    setErrorMessage(null)
    setSuccesMessage(null)

    if (firstName == '') {
      setErrorMessage("First Name field shouldn't be empty")
      setLoading(false)
      return
    }

    if (lastName == '') {
      setErrorMessage("Last Name field shouldn't be empty")
      setLoading(false)
      return
    }

    if (!email.includes('@') && !email.includes('.')) {
      console.log(email)
      setErrorMessage('Enter a valid email.')
      setLoading(false)
      return
    }

    try {
      // await updateEmail(user!, user!.email! )
      // await updateProfile(auth.currentUser!, {displayName: name})
      // await setDoc(doc(db, 'users', user?.uid! ), {email, name})

      const query = `mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            id
            firstName
            lastName
            acceptsMarketing
            email
            phone
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }`

      const phoneNumberE164 = phoneToE164(phone.replace(/\D/g, ''));

      const variables = phoneNumberE164 != "+1" ? {
        customerAccessToken: userToken.accessToken,
        customer: {
          lastName,
          firstName,
          phone: phoneNumberE164,
          email
        }
      } :
        {
          customerAccessToken: userToken.accessToken,
          customer: {
            lastName,
            firstName,
            email
          }
        }

      const response: any = await storefrontApiClient(query, variables)

      if (response.errors && response.errors.length != 0) {
        throw response.errors[0].message
      }

      if (response.data.customerUpdate.customerUserErrors.length != 0) {
        console.log(response.data.customerUpdate.customerUserErrors)
        throw response.data.customerUpdate.customerUserErrors[0].message
      }

      var newToken = userToken
      newToken.customer = response.data.customerUpdate.customer

      SecureStore.setItemAsync('userToken', JSON.stringify(newToken))
      dispatch({ type: 'RESTORE_TOKEN', token: newToken });


      setSuccesMessage('Your personal information has been updated successfully.')
    } catch (error: any) {
      typeof error == 'string' && setErrorMessage(error)
    }

    setLoading(false)
  }


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{ flex: 1, }}
    >

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', marginTop: 20 }}>
          <View style={styles.rowContainer}>
            <Text style={styles.subtitle}>First Name</Text>
            <TextInput
              textAlign='right'
              placeholder='First Name'
              placeholderTextColor={theme.colors.disabledText}
              // style={firstName ? (styles.input) : (styles.inputEmpty)}
              onChangeText={text => setFirstName(text)}
              autoCapitalize={'words'}
              value={firstName}
              maxLength={25}
            />
          </View>


          {/* line separator */}
          <View style={{ height: 1, borderRadius: 30, width: '100%', backgroundColor: '#E5E5E5', alignSelf: 'center' }} />

          <View style={styles.rowContainer}>
            <Text style={styles.subtitle}>Last Name</Text>
            <TextInput
              textAlign='right'
              placeholder='Last Name'
              placeholderTextColor={theme.colors.disabledText}
              // style={lastName ? (styles.input) : (styles.inputEmpty)}
              onChangeText={text => setLastName(text)}
              autoCapitalize={'words'}
              value={lastName}
              maxLength={25}
            />
          </View>


          {/* line separator */}
          <View style={{ height: 1, borderRadius: 30, width: '100%', backgroundColor: '#E5E5E5', alignSelf: 'center' }} />

          <View style={styles.rowContainer}>
            <Text style={styles.subtitle}>Phone</Text>
            <TextInput
              textAlign='right'
              // placeholder='Phone'
              textContentType='telephoneNumber'
              placeholderTextColor={theme.colors.disabledText}
              // style={phone ? (styles.input) : (styles.inputEmpty)}
              autoComplete='tel'
              onChangeText={handlePhoneNumberChange}
              value={phone}
              keyboardType="phone-pad"
              placeholder='(555) 555-5555'
            />
          </View>


          {/* line separator */}
          <View style={{ height: 1, borderRadius: 30, width: '100%', backgroundColor: '#E5E5E5', alignSelf: 'center' }} />

          <View style={styles.rowContainer}>
            <Text style={styles.subtitle}>Email</Text>
            <TextInput
              textAlign='right'
              placeholder='Email'
              textContentType='emailAddress'
              placeholderTextColor={theme.colors.disabledText}
              // style={email ? (styles.input) : (styles.inputEmpty)}
              // style={[styles.input, { marginBottom: 8 }]}
              onChangeText={text => setEmail(text)}
              autoCapitalize={'none'}
              value={email}
              maxLength={35}
            />
          </View>

        </View>

        {errorMessage ?
          <View style={{ height: 32, marginTop: 6 }}>
            <Text style={{ color: 'red' }}>{errorMessage}</Text>
          </View> :
          <View style={{ height: 38 }}><Text style={{ color: theme.colors.background }}></Text></View>
        }

        <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
          {loading ?

            <View style={{ backgroundColor: '#4B2D83', paddingHorizontal: 100, paddingVertical: 12, maxWidth: '90%', borderRadius: 20, marginTop: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color='white' />
            </View>

            :
            <>
              {
                succesMessage ?
                  <Text style={styles.succesMessage}>{succesMessage}</Text> :
                  // <FillButton 
                  //   title='CHANGE PERSONAL INFORMATIONS'
                  //   onPress={changeInfo}
                  // />
                  // <TouchableOpacity style={styles.buttonContainer} onPress={changeInfo}>
                  //   <Text style={styles.buttonText}>Change Personal Information</Text>
                  // </TouchableOpacity>
                  <TouchableOpacity onPress={changeInfo}
                    style={{ backgroundColor: '#4B2D83', paddingHorizontal: 100, paddingVertical: 12, maxWidth: '90%', borderRadius: 20, marginTop: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }} numberOfLines={1}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
              }

            </>
          }
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    width: '100%',
    shadowColor: 'black',
    shadowRadius: 2.5,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
  },
  name: {
    color: theme.colors.infoText,
    fontSize: 18
  },
  subtitle: {
    // color: '#4B2D83',
    color: 'black',
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '500',
    // marginTop: 20,
    marginLeft: 4
  },
  settingTitle: {
    color: theme.colors.text,
    fontSize: 18,
    paddingLeft: 12
  },
  settingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  border: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
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
  succesMessage: {
    marginTop: 6,
    color: '#4B2D83',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  screenTitle: {
    fontWeight: '800',
    fontSize: 24,
    color: '#4B2D83',
  },
  buttonContainer: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    width: '80%',
    backgroundColor: '#4B2D83',
    alignItems: 'center',
    borderRadius: 10,
    // marginTop: '10%',
    alignSelf: 'center',
    marginTop: 0,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '500'
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  }
})

export default PersonalInformations