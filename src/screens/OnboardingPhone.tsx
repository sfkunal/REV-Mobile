import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingPhone'>

const OnboardingPhone = ({ navigation, route }: Props) => {
    const { firstName, lastName } = route.params;
    console.log(firstName, lastName)
    const [phoneNumber, setPhoneNumber] = useState('');



    const handleNext = () => {
        // Handle saving the phone number
        // Then navigate to the next screen
        console.log(firstName, lastName, phoneNumber)
        navigation.navigate('OnboardingEmail', { firstName, lastName, phoneNumber });

    };

    return (
        <View>
            <Text>Enter Your Phone Number</Text>
            <TextInput
                placeholder="Phone Number"
                onChangeText={setPhoneNumber}
                value={phoneNumber}
                keyboardType="phone-pad"
            />
            <Button title="Next" onPress={handleNext} />
        </View>
    );
};

export default OnboardingPhone;