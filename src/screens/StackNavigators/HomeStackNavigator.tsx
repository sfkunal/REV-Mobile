import { NativeStackNavigationProp, createNativeStackNavigator } from '@react-navigation/native-stack'
import { theme } from '../../constants/theme'
import { HomeStackParamList } from '../../types/navigation'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import logo from '../../assets/logo.png'

import Home from '../Home'
import Collection from '../Collection'
import { TouchableOpacity, Image, View, Text } from 'react-native'
import { CartIcon, GearIcon } from '../../components/shared/Icons'
import Cart from '../Cart'
import { useNavigationContext } from '../../context/NavigationContext';
import { useCartContext } from '../../context/CartContext'


const HomeStack = createNativeStackNavigator<HomeStackParamList>()

const HomeStackNavigator = () => {
  const { rootNavigation } = useNavigationContext();
  const { getItemsCount } = useCartContext();
  const cartItemCount = getItemsCount();


  return (
    <NavigationContainer theme={theme} independent={true}>
      <HomeStack.Navigator>
        <HomeStack.Screen
          name='Home'
          component={Home}
          options={{
            headerLargeTitle: false,
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
            headerTitle: () => <Image source={logo} style={{ width: 100, height: 50 }} resizeMode="contain" />,
            headerLeft: () => (
              ''
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => rootNavigation.navigate('Cart')} style={{ paddingRight: 20, paddingTop: 5 }}>
                <View>
                  <CartIcon color="#4a307e" size={24} />
                  {cartItemCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      right: 18,
                      bottom: -7,
                      backgroundColor: '#4a307e',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'white'
                    }}>
                      <Text style={{
                        color: 'white',
                        // fontSize: 10,
                        fontWeight: 'bold'
                      }}>
                        {cartItemCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <HomeStack.Screen
          name='Collection'
          component={Collection}
          options={{
            headerTitle: '',
            headerShadowVisible: false,
            headerTransparent: true
          }}
        />
      </HomeStack.Navigator>
    </NavigationContainer>
  )
}

export default HomeStackNavigator