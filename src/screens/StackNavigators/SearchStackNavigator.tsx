import { NativeStackNavigationProp, createNativeStackNavigator } from '@react-navigation/native-stack'
import { theme } from '../../constants/theme'
import { HomeStackParamList, SearchStackParamList } from '../../types/navigation'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import Collection from '../Collection';


import Search from '../Search'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CartIcon } from '../../components/shared/Icons';
import { useNavigationContext } from '../../context/NavigationContext';

const SearchStack = createNativeStackNavigator<SearchStackParamList>()

const SearchStackNavigator = () => {
  const { rootNavigation } = useNavigationContext();

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
              <TouchableOpacity onPress={() => rootNavigation.navigate('Cart')} style={{paddingRight: 20, paddingTop: 5}}>
                <CartIcon color="#4a307e" size={28} />
              </TouchableOpacity>
            ),
          }}
        />
        <SearchStack.Screen
          name='Collection'
          component={Collection}
          options={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            headerTitle: '',
            headerRight: () => (
              <TouchableOpacity onPress={() => rootNavigation.navigate('Cart')} style={{paddingRight: 20, paddingTop: 5}}>
                <CartIcon color="#4a307e" size={28} />
              </TouchableOpacity>
            ),
          }}
        />
      </SearchStack.Navigator>
    </NavigationContainer>
  )
}

export default SearchStackNavigator