import { NativeStackNavigationProp, createNativeStackNavigator } from '@react-navigation/native-stack'
import { theme } from '../../constants/theme'
import { HomeStackParamList, SearchStackParamList } from '../../types/navigation'
import { NavigationContainer, RouteProp, useNavigation } from '@react-navigation/native'
import Collection from '../Collection';


import Search from '../Search'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CartIcon } from '../../components/shared/Icons';
import { useNavigationContext } from '../../context/NavigationContext';
import { View, Text, Image } from 'react-native';
import { useCartContext } from '../../context/CartContext';
import logo from '../../assets/logo.png'


const SearchStack = createNativeStackNavigator<SearchStackParamList>()

const SearchStackNavigator = () => {
  const { rootNavigation } = useNavigationContext();
  const { getItemsCount } = useCartContext();
  const cartItemCount = getItemsCount();

  return (
    <NavigationContainer theme={theme} independent={true}>
      <SearchStack.Navigator>
        <SearchStack.Screen
          name='Search'
          component={Search}
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
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
            headerTitle: () => (
              <Image source={logo} style={{ width: 100, height: 50 }} resizeMode='contain' />
            )
          }}
        />
        <SearchStack.Screen
          name='Collection'
          component={Collection}
          options={({ route }: { route: RouteProp<SearchStackParamList, 'Collection'> }) => ({
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            headerTitle: '',
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
          })}
        />
      </SearchStack.Navigator>
    </NavigationContainer>
  )
}

export default SearchStackNavigator