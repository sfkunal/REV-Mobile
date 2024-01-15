import React from 'react';
import { Button, View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type OnboardingPhoneScreenNavigationProp = StackNavigationProp<Record<string, undefined>>;

const OnboardingPhone: React.FC<{ navigation: OnboardingPhoneScreenNavigationProp }> = ({ navigation }) => {
 return (
  <View>
    <Text>Welcome to the Phone Entry screen!</Text>
    <Button title="Next" onPress={() => navigation.navigate('Home')} />
  </View>
 );
};

export default OnboardingPhone;