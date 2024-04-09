import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthContext } from './src/context/AuthContext'
import { CartContext } from './src/context/CartContext'
import { NavigationContext } from './src/context/NavigationContext'
import { WishlistContext } from './src/context/WishlistContext'
import MainNavigator from './src/screens/MainNavigator'
import NetInfo from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import noNetworkCloud from './src/assets/storm-cloud.png'
import { colorScheme, hasHomeIndicator, theme } from './src/constants/theme'
import { StatusBar } from 'expo-status-bar'
// import { fetchStoreStatus, storefrontApiClient } from './src/utils/storefrontApiClient'; // Import the storefrontApiClient
import logo from './src/assets/logo.png'
import { config } from './config'
import { storefrontApiClient } from './src/utils/storefrontApiClient'
import * as Font from 'expo-font';
import { useFonts } from 'expo-font'

import FontAwesome from '@expo/vector-icons/FontAwesome'



export default function App() {
  const [isConnected, setIsConnected] = useState(true)

  const [isClosed, setIsClosed] = useState<Boolean>(false)
  const [isLoading, setIsLoading] = useState<Boolean>(false)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        setIsConnected(state.isConnected)
      }
    })

    return () => unsubscribe()
  }, [])

  // let [fontsLoaded] = useFonts({
  //   'Rubik-Regular': require('./src/assets/fonts/Rubik-Regular.ttf'),
  //   'Rubik-Bold': require('./src/assets/fonts/Rubik-Bold.ttf'),
  //   'Inter': require('./src/assets/fonts/Inter-Regular.ttf')
  // })

  // if (!fontsLoaded) {
  //   return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //     <ActivityIndicator />
  //     <Text>
  //       Fonts are loading
  //     </Text>
  //   </View>
  // }



  // const loadFonts = async () => {
  //   await Font.loadAsync({
  //     'Rubik-Regular': require('./src/assets/fonts/Rubik-Regular.ttf'),
  //     'Rubik-Bold': require('./src/assets/fonts/Rubik-Bold.ttf'),
  //   })
  //   setFontsLoaded(true);
  // };

  // useEffect(() => {
  //   loadFonts();
  // }, [])

  // const checkIfStoreIsPasswordProtected = async () => {
  //   const query = `
  //   {
  //     shop {
  //       name
  //       passwordEnabled
  //     }
  //   }`;

  //   try {
  //     const data: any = await storefrontApiClient(query);
  //     console.log('THIS IS MY SUPER COOL NEW DATA', data);
  //     if (data.shop.passwordEnabled) {
  //       console.log('password protected')
  //     } else {
  //       console.log('not password protected')
  //     }
  //   } catch (e) {
  //     console.log(e)

  //   }
  // }

  // useEffect(() => {
  //   checkIfStoreIsPasswordProtected();
  // }, [])






  // if we are loading to get the query, this is the loading display
  // same with if we are loading the fonts
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>)
  }


  // if we are closed, this is what is displayed
  // PUT THE RESULT FROM THE QUERY HERE
  if (false) {
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

// export const fonts = StyleSheet.create({
//   rubik: {
//     fontFamily: 'Rubik-Regular'
//   },
//   rubikBold: {
//     fontFamily: 'Rubik-Bold'
//   },
//   inter: {
//     fontFamily: 'Inter-Regular'
//   }
// })


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
