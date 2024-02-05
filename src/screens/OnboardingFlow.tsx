// OnboardingFlow.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingName from './OnboardingName';
import OnboardingPhone from './OnboardingPhone';
import OnboardingEmail from './OnboardingEmail';

// Define the type for the parameters each screen expects
type OnboardingParams = {
 OnboardingName: undefined;
 OnboardingPhone: { firstName: string; lastName: string };
 OnboardingEmail: { phoneNumber: string };
 // Add other screens and their parameters here
};

// Create the stack navigator with the defined types
const OnboardingFlowStack = createNativeStackNavigator<OnboardingParams>();

export default function OnboardingFlow() {
 return (
    <OnboardingFlowStack.Navigator initialRouteName="OnboardingName">
      <OnboardingFlowStack.Screen name="OnboardingName" component={OnboardingName} />
      <OnboardingFlowStack.Screen name="OnboardingPhone" component={OnboardingPhone} />
      <OnboardingFlowStack.Screen name="OnboardingEmail" component={OnboardingEmail} />
    </OnboardingFlowStack.Navigator>
 );
}