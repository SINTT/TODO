import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import CryptoJS from 'crypto-js';
import { UserContext } from '../UserContext';


const RegistrationScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const { ip } = useContext(UserContext);

  const handleRegister = async () => {
    if (!nickname || !password || !confirmPassword || !firstName || !lastName || !patronymic) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();

      const response = await fetch(`${ip}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          patronymic: patronymic,
          role: 'user'  // Установка роли по умолчанию
        }),
      });

      const data = await response.json();

      if (data.error) {
        Alert.alert('Ошибка', data.error);
      } else {
        Alert.alert('Успех', 'Регистрация прошла успешно!');
        navigation.navigate('LoginScreen');
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

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TextInput
          style={styles.input2}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input3}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input2}
          placeholder="Patronymic"
          value={patronymic}
          onChangeText={setPatronymic}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={{backgroundColor: 'blue', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center', justifyContent: 'center'}} onPress={handleRegister}>
        <Text style={{fontSize: 18, fontWeight: '600', color: 'white'}}>Registration</Text>
      </TouchableOpacity>

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
  input2: {
    height: 40,
    flex: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  input3: {
    height: 40,
    flex: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  
});

export default RegistrationScreen;
