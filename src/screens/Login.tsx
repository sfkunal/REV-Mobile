import { useEffect, useRef, useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Image, ActivityIndicator, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { useAuthContext } from '../context/AuthContext'
import logoDark from '../../assets/logo-dark.png'
import logo from '../../assets/logo.png'
import { theme } from '../constants/theme'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LoginStackParamList } from '../types/navigation'
import FillButton from '../components/shared/FillButton'
import { useNavigationContext } from '../context/NavigationContext'
import { config } from '../../config'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { EyeIcon, EyeOffIcon } from '../components/shared/Icons'

type Props = NativeStackScreenProps<LoginStackParamList, 'Login'>

const Login = ({ navigation }: Props) => {
  const { rootNavigation } = useNavigationContext()
  const scrollRef = useRef<ScrollView>()
  const { signIn } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()
  const { userToken } = useAuthContext();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const signInButton = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      await signIn(email, password)
      rootNavigation.goBack()
    } catch (error: any) {
      typeof error === 'string' && setErrorMessage(error)
    }

    setLoading(false)
  }

  const toggle = () => {
    setSecureTextEntry(!secureTextEntry);
  }

  // this will toss the user in if they have a userToken
  // there is an error if there is no path to go back to tho. Something to look into
  // this might not really be a problem in production tho
  useEffect(() => {
    if (userToken) {
      rootNavigation.goBack();
      // rootNavigation.navigate('Home')
      // navigation.navigate('Home')
    }
    console.log(userToken)
  })



  const keyboardVerticalOffset = Platform.OS === 'ios' ? 60 : 0;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Adjust the scrollTo value as needed
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // changes: enabled scroll on iOS, made it so that we scroll when we click on the input fields
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >

      <View style={{ display: 'flex', height: '100%' }}>
        {/* inner */}
        < View style={{
          padding: 24, flex: 1,
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          {/* top container */}
          <View style={{ display: 'flex', alignItems: 'center', height: 150 }}>
            <Image source={logo} resizeMode='contain' style={{ width: 100, height: 35, marginBottom: 35 }} />
            <View>
              <Text style={{ fontSize: 36, fontWeight: '900', fontStyle: 'italic', color: '#4B2D83', marginBottom: 4 }} >
                Welcome to REV!
              </Text>
              <Text style={{ fontSize: 14 }}>
                Log in or create an account to get started
              </Text>
            </View>

          </View>

          {/* input field container */}
          <View style={{ width: '90%', display: 'flex', alignItems: 'center' }}>
            {errorMessage ? (<Text style={{ color: 'red' }} numberOfLines={1}>{errorMessage}</Text>) : (<View></View>)}
            <TextInput
              placeholder='Email'
              placeholderTextColor={theme.colors.disabledText}
              keyboardType='email-address'
              style={styles.input}
              onChangeText={(text: string) => setEmail(text)}
              autoCapitalize='none'
              autoComplete="email"
              value={email}
              onFocus={() => Platform.OS == 'android' && scrollRef.current.scrollTo({ y: 60, animated: true })}
            />
            <TextInput
              placeholder='Password'
              placeholderTextColor={theme.colors.disabledText}
              keyboardType='default'
              style={[styles.input]}
              onChangeText={(text: string) => setPassword(text)}
              autoCapitalize='none'
              autoComplete="current-password"
              value={password}
              secureTextEntry={secureTextEntry}
              onFocus={() => Platform.OS == 'android' && scrollRef.current.scrollTo({ y: 60, animated: true })}
            />
            <TouchableOpacity onPress={toggle}
              style={{ width: 40, height: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 2, top: 73, }}>
              {secureTextEntry ? (<EyeOffIcon size={30} color={'black'} />) : (<EyeIcon size={30} color={'black'} />)}
            </TouchableOpacity>
            <Text
              style={{ color: '#4B2D83', fontWeight: '500', marginLeft: 4, marginTop: -4, marginBottom: 12 }}
              onPress={() => { navigation.push('ForgotPassword') }}
            >
              Forgot Password?
            </Text>
          </View>

          {/* lower button container */}
          <View style={{ marginBottom: 40 }}>
            {/* log in button */}
            <TouchableOpacity onPress={signInButton} style={{ backgroundColor: '#4B2D83', paddingHorizontal: 40, paddingVertical: 8, maxWidth: '90%', borderRadius: 20, marginTop: 28, display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                Continue as {email ? (email) : ('...')}
              </Text>

            </TouchableOpacity>
            {/* Create acctoun button */}
            <TouchableOpacity onPress={() => { navigation.push('OnboardingPhone') }}
              style={{ backgroundColor: 'black', paddingHorizontal: 80, paddingVertical: 8, maxWidth: '90%', borderRadius: 20, marginTop: 4, display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
                Create Account
              </Text>
            </TouchableOpacity>
            {/* end input field container */}



          </View>
        </View>
      </View>
    </KeyboardAvoidingView >
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // paddingTop: 32,
    // paddingBottom: 100
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
    marginBottom: 15,
    fontSize: 18,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    padding: 10,
    paddingLeft: 16,
    paddingHorizontal: 4,
    color: theme.colors.text
  },
  loginContainer: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    width: '60%',
    backgroundColor: '#4B2D83',
    alignItems: 'center',
    borderRadius: 10,
  },
  loginText: {
    color: theme.colors.background,
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: '500'
  },
  buttonContainer: {
    // position: 'absolute', // Use 'absolute' to position the buttons
    // bottom: 40, // Stick to the bottom
    // left: 0,
    // right: 0,
    // paddingBottom: 0, // Add some padding at the bottom
    alignItems: 'center', // Center the buttons horizontally
    justifyContent: 'center', // Center the buttons vertically
    flexDirection: 'column', // Stack the buttons vertically
  },
}
)