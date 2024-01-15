import React from 'react';
import { Button, View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../types/navigation';

type OnboardingUserScreenNavigationProp = StackNavigationProp<Record<string, undefined>>;

interface OnboardingUserProps {
  navigation: StackNavigationProp<StackParamList>; // Use the StackParamList type
 }
 
 const OnboardingUser: React.FC<OnboardingUserProps> = ({ navigation }) => {
  return (
  <View>
  <Text>Welcome to the User Info Entry screen!</Text>
  <Button title="Done" onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })} />
  </View>
  );
 };

export default OnboardingUser;