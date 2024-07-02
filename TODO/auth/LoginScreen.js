import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import CryptoJS from 'crypto-js';
import { UserContext } from '../UserContext';

const LoginScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, ip } = useContext(UserContext);

  const handleLogin = async () => {
    if (!nickname || !password) {
      Alert.alert('Ошибка', 'Введите имя пользователя и пароль');
      return;
    }

    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();

      const response = await fetch(`${ip}/login?nickname=${nickname}&password=${hashedPassword}`);
      const data = await response.json();

      if (data.error) {
        Alert.alert('Ошибка', data.error);
      } else {
        console.log('Received data:', data);
        Alert.alert('Успех', 'Вход выполнен успешно!');
        setUser({
          nickname: data.nickname,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          patronymic: data.patronymic,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainScreen' }],
        });
      }
    } catch (err) {
      console.error('Ошибка:', err);
      Alert.alert('Ошибка', 'Что-то пошло не так. Пожалуйста, попробуйте еще раз.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nickname"
        value={nickname}
        onChangeText={setNickname}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end'}}>

        <TouchableOpacity style={{paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', justifyContent: 'center'}} onPress={() => navigation.navigate('RegistrationScreen')}>
          <Text style={{fontSize: 18, fontWeight: '600', color: 'blue'}}>Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{backgroundColor: 'blue', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10, alignItems: 'center', justifyContent: 'center'}} onPress={handleLogin}>
          <Text style={{fontSize: 18, fontWeight: '600', color: 'white'}}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default LoginScreen;
