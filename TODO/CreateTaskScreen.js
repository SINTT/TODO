import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, FlatList } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import { UserContext } from './UserContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const CreateTaskScreen = () => {
  const { user, ip } = useContext(UserContext);
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('Низкий');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  

  const priorityMapping = {
    'Низкий': 'Low',
    'Средний': 'Medium',
    'Высокий': 'High',
  };


useEffect(() => {
  const fetchFilteredUsers = async () => {
    if (searchQuery.trim().length > 0) {
      try {
        const response = await axios.get(`${ip}/users`);
        if (response.data.success) {
          const usersWithRoleUser = response.data.users.filter(user => user.role === 'user');
          
          const filtered = usersWithRoleUser.filter(user =>
            `${user.lastName} ${user.firstName} ${user.patronymic}`.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          setFilteredUsers(filtered);
        } else {
          Alert.alert('Ошибка', 'Не удалось загрузить пользователей');
        }
      } catch (error) {
        console.error('Ошибка поиска пользователей:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить пользователей');
      }
    } else {
      setFilteredUsers([]);
    }
  };

  fetchFilteredUsers();
}, [searchQuery]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(`${user.lastName} ${user.firstName.charAt(0)}.${user.patronymic.charAt(0)}.`);
    setFilteredUsers([]);
  };

  const handleCreateTask = async () => {
    if (!title || !description || !dueDate || !dueTime || !selectedUser) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const formattedDueDate = `${dueDate.split('.').reverse().join('-')}T${dueTime}:00`;

    const createdBy = `${user.lastName} ${user.firstName.charAt(0)}.${user.patronymic.charAt(0)}.`;

    const assignedTo = `${selectedUser.lastName} ${selectedUser.firstName.charAt(0)}.${selectedUser.patronymic.charAt(0)}.`;

    try {
      const response = await axios.post(`${ip}/create-task`, {
        title,
        description,
        dueDate: formattedDueDate,
        priority: priorityMapping[priority],
        status: 'к выполнению',
        createdBy,      
        creatorRole: user.role,    
        assignedTo,     
      });

      if (response.data.success) {
        Alert.alert('Успех', 'Задача успешно создана');
        setTitle('');
        setDescription('');
        setDueDate('');
        setDueTime('');
        setPriority('Низкий');
        setSearchQuery('');
        setSelectedUser(null);
        navigation.goBack();
      } else {
        Alert.alert('Ошибка', 'Не удалось создать задачу');
      }
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      Alert.alert('Ошибка', 'Не удалось создать задачу');
    }
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: 'white', padding: 20 }}>
        <Text style={styles.headerText}>Создание задачи</Text>

        <Text>Для кого?:</Text>
        <TextInput
          style={styles.input}
          placeholder="ФИО"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {filteredUsers.length > 0 && (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.nickname}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleUserSelect(item)}>
                <Text style={styles.userItem}>{`${item.lastName} ${item.firstName} ${item.patronymic}`}</Text>
              </TouchableOpacity>
            )}
            style={styles.userList}
          />
        )}

        <Text>Заголовок:</Text>
        <TextInput
          style={styles.input}
          placeholder="Заголовок"
          value={title}
          onChangeText={setTitle}
        />

        <Text>Дата и время завершения:</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 5 }}>
            <MaskedTextInput
              style={styles.input}
              mask="99.99.9999"
              placeholder="ДД.ММ.ГГГГ"
              keyboardType="numeric"
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>

          <View>
            <MaskedTextInput
              style={styles.input}
              mask="99:99"
              placeholder="ЧЧ:ММ"
              keyboardType="numeric"
              value={dueTime}
              onChangeText={setDueTime}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text>Приоритет:</Text>
          <View style={styles.priorityButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'Низкий' ? styles.activePriorityButton : styles.inactivePriorityButton,
              ]}
              onPress={() => handlePriorityChange('Низкий')}
            >
              <Text style={priority === 'Низкий' ? styles.activePriorityButtonText : styles.inactivePriorityButtonText}>
                Низкий
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'Средний' ? styles.activePriorityButton : styles.inactivePriorityButton,
              ]}
              onPress={() => handlePriorityChange('Средний')}
            >
              <Text style={priority === 'Средний' ? styles.activePriorityButtonText : styles.inactivePriorityButtonText}>
                Средний
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'Высокий' ? styles.activePriorityButton : styles.inactivePriorityButton,
              ]}
              onPress={() => handlePriorityChange('Высокий')}
            >
              <Text style={priority === 'Высокий' ? styles.activePriorityButtonText : styles.inactivePriorityButtonText}>
                Высокий
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Описание"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
          <Text style={styles.createButtonText}>Создать</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  activePriorityButton: {
    backgroundColor: '#007BFF',
  },
  inactivePriorityButton: {
    backgroundColor: '#f5f5f5',
  },
  activePriorityButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactivePriorityButtonText: {
    color: '#000',
  },
  userList: {
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
    borderRadius: 5,
  },
  userItem: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});

export default CreateTaskScreen;
