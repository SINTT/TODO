import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { UserContext } from './UserContext';
import axios from 'axios';

const SettingsScreen = ({ navigation }) => {
  const { user, setUser, ip } = useContext(UserContext);

  const handleLogout = () => {
    setUser(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`${ip}/delete-user`, { data: { nickname: user.nickname } });
      if (response.data.success) {
        Alert.alert('Success', 'Учетная запись успешно удалена');
        handleLogout();
      } else {
        Alert.alert('Error', 'Не удалось удалить учетную запись');
      }
    } catch (error) {
      console.error('Ошибка при удалении учетной записи:', error);
      Alert.alert('Error', 'Не удалось удалить учетную запись');
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Подтвердите удаление',
      'Вы уверены, что хотите удалить свою учетную запись?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text>SettingsScreen</Text>
      <Button title="Logout" onPress={handleLogout} />
      <Button title="Delete Account" onPress={confirmDeleteAccount} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsScreen;
