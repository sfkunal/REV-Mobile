import { NativeStackNavigationProp, createNativeStackNavigator } from '@react-navigation/native-stack'
import { theme } from '../../constants/theme'
import { HomeStackParamList } from '../../types/navigation'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import logo from '../../../assets/logo.png'

import Home from '../Home'
import Collection from '../Collection'
import { TouchableOpacity, Image } from 'react-native'
import { CartIcon } from '../../components/shared/Icons'
import Cart from '../Cart'
import { useNavigationContext } from '../../context/NavigationContext';


const HomeStack = createNativeStackNavigator<HomeStackParamList>()

const HomeStackNavigator = () => {
const { rootNavigation } = useNavigationContext();


  return (
    <NavigationContainer theme={theme} independent={true}>
      <HomeStack.Navigator>
        <HomeStack.Screen 
          name='Home' 
          component={Home}
          options={{
            headerLargeTitle: false,
            headerShown: true, 
            headerStyle:{backgroundColor: theme.colors.background}, 
            headerShadowVisible: false,
            headerTitle: () => (
              <Image source={logo} style={{ width: 100, height: 50 }} resizeMode="contain" />
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => rootNavigation.navigate('Cart')} style={{paddingRight: 20, paddingTop: 5}}>
                <CartIcon color="#4a307e" size={28} />
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