import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingEmail'>


const OnboardingEmail = ({navigation, route}: Props) => {
const { firstName, lastName, phoneNumber } = route.params;
console.log(firstName, lastName, phoneNumber)
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
//  const navigation = useNavigation();
 const { rootNavigation } = useNavigationContext()


 const handleNext = () => {
    // Handle saving the email and password
    // Then navigate to the next screen or finalize the onboarding process
    // navigation.navigate('FinalScreen'); // Replace 'FinalScreen' with the actual name of the final screen
    rootNavigation.goBack()
 };

 return (
    <View>
      <Text>Enter Your Email and Password</Text>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        secureTextEntry
      />
      <Button title="Next" onPress={handleNext} />
    </View>
 );
};

export default OnboardingEmail;