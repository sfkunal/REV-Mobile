import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthContext } from './src/context/AuthContext'
import { CartContext } from './src/context/CartContext'
import { NavigationContext } from './src/context/NavigationContext'
import { WishlistContext } from './src/context/WishlistContext'
import MainNavigator from './src/screens/MainNavigator'
import NetInfo from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import noNetworkCloud from './assets/storm-cloud.png'
import { colorScheme, hasHomeIndicator, theme } from './src/constants/theme'
import { StatusBar } from 'expo-status-bar'
import { storefrontApiClient } from './src/utils/storefrontApiClient'; // Import the storefrontApiClient
import logo from './assets/logo.png'



export default function App() {
  const [isConnected, setIsConnected] = useState(true)

  const [isClosed, setIsClosed] = useState<Boolean>(false)
  const [isLoading, setIsLoading] = useState<Boolean>(true)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        setIsConnected(state.isConnected)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        // const query = `query {
        //   shop {
        //     publiclyAvailable
        //   }
        // }`;

        // const response: any = await storefrontApiClient(query);

        // if (response.errors && response.errors.length !== 0) {
        //   throw response.errors[0].message;
        // }

        // const isStoreClosed = response.data.shop.passwordEnabled;
        // console.log(response.data)
        // setIsClosed(isStoreClosed);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreStatus();
  })


  // if we are loading to get the query, this is the loading display
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>)
  }

  // if we are closed, this is what is displayed
  if (isClosed) {
    return (
      <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', marginTop: 100, marginBottom: 250 }}>
        {/* logo */}
        <View style={{ width: 250, height: 50 }}>
          <Image source={logo} style={{ width: '100%', height: '100%', resizeMode: 'contain', }} />
        </View>

        {/* text */}
        <View>
          <Text style={{ fontSize: 36, fontWeight: '700', marginBottom: 12 }}>
            We're Closed
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '500' }}>
            See you next time!
          </Text>
        </View>

        {/* hours */}
        <View style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          height: 130,
          width: '80%',
          marginBottom: 24,
          // borderWidth: 1,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          shadowColor: 'black', shadowRadius: 1,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6
        }}>
          <View style={{ display: 'flex', marginLeft: 12, marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#4B2D83' }}>
              Store Hours
            </Text>
            <View style={{ marginLeft: 8, marginTop: 16, flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '300' }}>Sunday - Thursday: 11AM - 12AM</Text>
              <View style={{ width: 250, height: 1, borderRadius: 2, backgroundColor: '#3C3C4333' }}></View>
              <Text style={{ fontSize: 18, fontWeight: '300', }}>Friday - Saturday: 11AM - 1AM</Text>
            </View>

          </View>
        </View>
      </View>
    )
  }

  // if we are open, the app will run and compile as 'normal'
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContext>
        <WishlistContext>
          <CartContext>
            <NavigationContext>
              <View style={{ backgroundColor: theme.colors.background, flex: 1, paddingBottom: hasHomeIndicator ? 30 : 0 }}>
                {isConnected ?
                  <MainNavigator /> :
                  <View style={styles.container}>
                    <Image source={noNetworkCloud} style={styles.image} />
                    <Text style={styles.title}>Oops!</Text>
                    <Text style={styles.text}>No internet connection found. Check your internet connection and try again.</Text>
                  </View>
                }
              </View>
              <StatusBar style={colorScheme == 'light' ? 'light' : 'light'} />
            </NavigationContext>
          </CartContext>
        </WishlistContext>
      </AuthContext>
    </GestureHandlerRootView>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14
  },
  text: {
    letterSpacing: 1.5,
    color: theme.colors.text,
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center'
  },
  title: {
    fontSize: 32,
    letterSpacing: 2,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 48
  },
  image: {
    width: 120,
    height: 120 * 0.974
  }
})
