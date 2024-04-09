import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { theme } from '../../constants/theme'
import { ProfileStackParamList } from '../../types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import { Image, View, Text } from 'react-native'
import logo from '../../assets/logo.png'

import Profile from '../Profile'
import PersonalInformations from '../PersonalInformations'
import ResetPassword from '../ResetPassword'
import Wishlist from '../Wishlist'
import Orders from '../Orders'
import { BackArrow, BackArrowIcon, CartIcon, GearIcon } from '../../components/shared/Icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigationContext } from '../../context/NavigationContext'
import { useCartContext } from '../../context/CartContext'
import SettingsPage from '../SettingsPage'

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()

const ProfileStackNavigator = () => {
  const { rootNavigation } = useNavigationContext();
  const { getItemsCount } = useCartContext();
  const cartItemCount = getItemsCount();
  return (
    <NavigationContainer theme={theme} independent={true}>
      <ProfileStack.Navigator>
        <ProfileStack.Screen
          name='Profile'
          component={Profile}
          options={({ navigation }) => ({
            headerStyle: { backgroundColor: theme.colors.background },
            title: '',
            headerShadowVisible: false,
            headerLeft: () => (
              // <Image source={logo} style={{ width: 100, height: 50 }} resizeMode="contain" />
              <TouchableOpacity
                onPress={() => navigation.navigate('SettingsPage')}
              // HERE I WANT TO NAVIGATE TO SETTINGS PAGE
              >
                <GearIcon size={36} color={"#4B2D83"} />
              </TouchableOpacity>
            ),
            headerTitle: () => (
              <Image source={logo} style={{ width: 100, height: 50, paddingTop: 5 }} resizeMode="contain" />
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

          })}
        />
        <ProfileStack.Screen
          name='PersonalInformations'
          component={PersonalInformations}
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
          }}
        />
        <ProfileStack.Screen
          name='ResetPassword'
          component={ResetPassword}
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
          }}
        />
        <ProfileStack.Screen
          name='Wishlist'
          component={Wishlist}
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
          }}
        />
        <ProfileStack.Screen
          name='Orders'
          component={Orders}
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
          }}
        />

        <ProfileStack.Screen
          name='SettingsPage'
          component={SettingsPage}

          options={({ navigation }) => ({
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            headerTitle: () => (
              <Image source={logo} style={{ width: 100, height: 50 }} resizeMode="contain" />
            ),
            headerLeft: () => (
              // PUT THE BACK ICON HERE
              // 
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} hitSlop={{ bottom: 5, top: 5, left: 5, right: 5 }}>
                <BackArrow size={30} color="#4a307e" />
              </TouchableOpacity>
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
            )
          })}
        />
      </ProfileStack.Navigator>
    </NavigationContainer>
  )
}

export default ProfileStackNavigator