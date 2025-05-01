// App.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MarketOverviewScreen from './screens/MarketOverViewScreen';
import CoinDetailsScreen from './screens/CoinDetailsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from './types';
import BiometricGate from './components/BiometricGate';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <BiometricGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MarketOverview" component={MarketOverviewScreen} />
          <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
