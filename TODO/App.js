import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './UserContext';

import SplashScreen from './auth/SplashScreen';
import LoginScreen from './auth/LoginScreen';
import RegistrationScreen from './auth/RegistrationScreen';
import MainScreen from './MainScreen';
import CreateTaskScreen from './CreateTaskScreen';
import TaskScreen from './TaskScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Задержка на 1 секунду для SplashScreen
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: true }} />
          <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} options={{ headerShown: true }} />
          <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} options={{ headerShown: true }} />
          <Stack.Screen name="TaskScreen" component={TaskScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
