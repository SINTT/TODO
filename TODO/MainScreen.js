import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';

import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: 'white' },
          tabBarActiveTintColor: 'black',
        }}>
        <Tab.Screen
          name="Главная"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./shapes/tab-icons/home-ico.png')}
                style={{ width: 24, height: 24, tintColor: focused ? 'black' : 'gray' }}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Настройки"
          component={SettingsScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./shapes/tab-icons/settings-ico.png')}
                style={{ width: 24, height: 24, tintColor: focused ? 'black' : 'gray' }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default MainScreen;
