import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { UserContext } from './UserContext';

import HomeScreenAdmin from './HomeScreenAdmin';
import HomeScreenManager from './HomeScreenManager';
import HomeScreenUser from './HomeScreenUser';

const HomeScreen = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  console.log('Current user role:', user.role);

  switch (user.role) {
    case 'admin':
      return <HomeScreenAdmin />;
    case 'manager':
      return <HomeScreenManager />;
    default:
      return <HomeScreenUser />;
  }
};

export default HomeScreen;
