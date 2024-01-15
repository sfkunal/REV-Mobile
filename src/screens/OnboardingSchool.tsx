import React from 'react';
import { Button, View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type OnboardingSchoolScreenNavigationProp = StackNavigationProp<Record<string, undefined>>;

const OnboardingSchool: React.FC<{ navigation: OnboardingSchoolScreenNavigationProp }> = ({ navigation }) => {
 return (
  <View>
    <Text>Welcome to the Select School screen!</Text>
    <Button title="Next" onPress={() => navigation.navigate('OnboardingPhone')} />
  </View>
 );
};

export default OnboardingSchool;