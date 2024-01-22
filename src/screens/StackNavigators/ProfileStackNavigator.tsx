import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { theme } from '../../constants/theme'
import { ProfileStackParamList } from '../../types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import { Image } from 'react-native'
import logo from '../../../assets/logo.png'

import Profile from '../Profile'
import PersonalInformations from '../PersonalInformations'
import ResetPassword from '../ResetPassword'
import Wishlist from '../Wishlist'
import Orders from '../Orders'

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()

const ProfileStackNavigator = () => {
  return (
    <NavigationContainer theme={theme} independent={true}>
      <ProfileStack.Navigator>
        <ProfileStack.Screen 
          name='Profile' 
          component={Profile}
          options={{ 
            headerStyle:{backgroundColor: theme.colors.background},
            title: '', 
            headerShadowVisible: false,
            headerLeft: () => (
              <Image source={logo} style={{ width: 100, height: 50 }} resizeMode="contain" />
            ),
          }} 
        />
        <ProfileStack.Screen 
          name='PersonalInformations' 
          component={PersonalInformations}
          options={{ 
            headerStyle:{backgroundColor: theme.colors.background},
            headerShadowVisible: false,
          }} 
        />
        <ProfileStack.Screen 
          name='ResetPassword' 
          component={ResetPassword}
          options={{ 
            headerStyle:{backgroundColor: theme.colors.background},
            headerShadowVisible: false,
          }} 
        />
        <ProfileStack.Screen 
          name='Wishlist' 
          component={Wishlist}
          options={{ 
            headerStyle:{backgroundColor: theme.colors.background},
            headerShadowVisible: false,
          }} 
        />
        <ProfileStack.Screen 
          name='Orders' 
          component={Orders}
          options={{ 
            headerStyle:{backgroundColor: theme.colors.background},
            headerShadowVisible: false,
          }} 
        />
      </ProfileStack.Navigator>
    </NavigationContainer>
  )
}

export default ProfileStackNavigator