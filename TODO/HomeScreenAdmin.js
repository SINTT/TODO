import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActionSheetIOS, StyleSheet, Alert, SafeAreaView, Image, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from './UserContext';
import axios from 'axios';
import { format } from 'date-fns';

const HomeScreenAdmin = () => {
  const navigation = useNavigation();
  const { user, ip } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;
  const { width: screenWidth } = Dimensions.get('window');

  const initials = `${user.firstName.charAt(0)}.${user.patronymic.charAt(0)}.`;



  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${ip}/users`);
      if (response.data.success) {
        const filteredUsers = response.data.users.filter(u => u.nickname !== user.nickname);
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить пользователей');
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить пользователей');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user.nickname]);

  useEffect(() => {
    setFilteredUsers(
      users.filter((u) => 
        `${u.lastName} ${u.firstName} ${u.patronymic}`.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, users]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const updateUserRole = async (nickname, newRole) => {
    try {
      const response = await axios.post(`${ip}/update-role`, { nickname, role: newRole });
      if (response.data.success) {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.nickname === nickname ? { ...u, role: newRole } : u
          )
        );
        Alert.alert('Успех', 'Роль пользователя успешно обновлена');
      } else {
        Alert.alert('Ошибка', 'Не удалось обновить роль пользователя');
      }
    } catch (error) {
      console.error('Ошибка обновления роли пользователя:', error);
      Alert.alert('Ошибка', 'Не удалось обновить роль пользователя');
    }
  };

  const handleLongPress = (nickname, currentRole) => {
    const options = currentRole === 'user' ? ['Сделать менеджером', 'Отмена'] : ['Сделать пользователем', 'Отмена'];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          const newRole = currentRole === 'user' ? 'manager' : 'user';
          updateUserRole(nickname, newRole);
        }
      }
    );
  };

  const UserItem = ({ user }) => {
    const initials = `${user.firstName.charAt(0)}.${user.patronymic.charAt(0)}.`;
    return (
      <TouchableOpacity
        style={styles.userItem}
        onLongPress={() => handleLongPress(user.nickname, user.role)}
      >

        <View style={styles.avatar}>
          <Image source={require('./shapes/avatar-ico.png')} style={styles.avatarImage} />
        </View>

        <View>
          <Text style={styles.userNickname}>{`${user.lastName} ${initials}`}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

    const loadTasks = async () => {
      try {
        const response = await axios.get(`${ip}/tasks`);
        if (response.data.success) {
          const sortedTasks = response.data.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setTasks(sortedTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };  
  
    useEffect(() => {
      loadTasks();
    }, []);
  
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      loadTasks();
      setRefreshing(false);
    }, []);
  
    const deleteTask = async (taskId) => {
      try {
        const response = await axios.delete(`${ip}/tasks/${taskId}`);
        if (response.data.success) {
          Alert.alert('Успех', 'Задача удалена успешно!');
          loadTasks();
        } else {
          Alert.alert('Ошибка', response.data.error);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        Alert.alert('Ошибка', 'Не удалось удалить задачу');
      }
    };
  
    const showActionSheet = (taskId) => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Удалить'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            deleteTask(taskId);
          }
        }
      );
    };

    const scrollToPage = (pageNumber) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: screenWidth * (pageNumber - 1),
          animated: true,
        });
        setCurrentPage(pageNumber);
      }
    };  
  
  const TaskItemLarge = ({ id, title, description, priority, createdBy, creatorRole, createdAt, dueDate, status }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onLongPress={() => showActionSheet(id)}
    >
      <View style={{flex: 1}}>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={{ borderRadius: 14, height: 28, width: 28, backgroundColor: 'lightgray', marginRight: 5 }}>
            <Image source={require('./shapes/avatar-ico.png')} style={styles.avatarImage} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>{createdBy}</Text>
            <Text style={{ fontSize: 12, color: 'gray' }}>{creatorRole}</Text>
          </View>

          <View style={{flex: 1}}/>
          <Text style={{ fontSize: 12, marginTop: 5, fontStyle: 'italic' }}>
            Опубликовано: {format(new Date(createdAt), 'dd.MM.yyyy HH:mm')}
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
        <View style={{borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 10, paddingVertical: 5, paddingBottom: 10, marginVertical: 5}}>
          <Text style={{ fontSize: 14, marginTop: 5, marginBottom: 5 }}>{description}</Text>
        </View>

        <View style={{flexDirection: 'row'}}>
          <View style={{ paddingVertical: 5, paddingHorizontal: 10, marginVertical: 5, borderWidth: 1, borderRadius: 5, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start',
          backgroundColor: priority === 'Low' ? 'rgba(35, 255, 0, 0.5)' : priority === 'Medium' ? 'rgba(250, 255, 0, 0.5)' : priority === 'High' ? 'rgba(255, 0, 0, 0.5)' : 'white'}}>
            <Text>{priority}</Text>
          </View>

          <View style={{ paddingVertical: 5, paddingHorizontal: 10, marginVertical: 5, marginLeft: 5, borderWidth: 1, borderRadius: 5,
            alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', flexDirection: 'row' }}>
            <Text>{format(new Date(dueDate), 'dd.MM.yyyy')} | </Text>
            <Text>{format(new Date(dueDate), 'HH:mm')}</Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 14 }}>Статус: {status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
    // Фильтрация задач по заголовку
    const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.avatar}>
            <Image source={require('./shapes/avatar-ico.png')} style={styles.avatarImage} />
          </TouchableOpacity>
          <View>
            <Text style={styles.nickname}>{`${user.lastName} ${initials}`}</Text>
            <Text style={styles.role}>{user.role}</Text>
          </View>

          <View style={{flex: 1}}/>

          <TouchableOpacity
            style={{width: 38, height: 38}}
            onPress={() => navigation.navigate('CreateTaskScreen')}
          >
            <Image source={require('./shapes/add-ico.png')} style={{width: '100%', height: '100%'}} />
          </TouchableOpacity>

        </View>
      </View>

      <View style={{padding: 10, paddingTop: 0, backgroundColor: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Контейнер с кнопками */}
      <View style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: 'white', flexDirection: 'row', padding: 10, paddingTop: 0, alignItems: 'center' }}>
        <ScrollView horizontal>
          <TouchableOpacity onPress={() => scrollToPage(1)} style={[styles.pageButton, { borderWidth: currentPage === 1 ? '1' : '0' }]}>
            <Text style={[styles.pageButtonText, currentPage === 1 ? styles.activeButtonText : styles.inactiveButtonText]}>Пользователи</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToPage(2)} style={[styles.pageButton, { borderWidth: currentPage === 2 ? '1' : '0' }]}>
            <Text style={[styles.pageButtonText, currentPage === 2 ? styles.activeButtonText : styles.inactiveButtonText]}>Задачи</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ScrollView для страниц */}
      <View style={{ flex: 1, borderRadius: 12 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const currentPageNumber = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            ) + 1;
            setCurrentPage(currentPageNumber);
          }}
        >

          {/* Содержимое слайдера */}
          <View style={{ width: screenWidth - 20, marginVertical: 10, borderRadius: 12, marginHorizontal: 10 }}>

            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.nickname}
              renderItem={({ item }) => <UserItem user={item} />}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />

          </View>

          <View style={{ width: screenWidth - 20, marginTop: 10, borderRadius: 12, marginHorizontal: 10 }}>
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TaskItemLarge
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  createdBy={item.createdBy}
                  creatorRole={item.creatorRole}
                  createdAt={item.createdAt}
                  dueDate={item.dueDate}
                  status={item.status}
                />
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>

        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  userItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
  },
  userNickname: {
    fontSize: 16,
  },
  userRole: {
    fontSize: 14,
    color: '#888',
  },
  header: {
    padding: 10,
    width: '100%',
    height: 72,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'lightgray',
    height: 34,
    width: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  avatarImage: { height: '100%', width: '100%' },
  nickname: { fontSize: 18, fontWeight: '800' },
  role: { fontSize: 12, color: 'gray' },
  addButton: {
    height: 34,
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskTitle: { fontSize: 16 },

  pageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
  },
  pageButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeButtonText: {
    color: 'black',
  },
  inactiveButtonText: {
    color: 'rgba(0, 0, 0, 0.2)',
  },

});

export default HomeScreenAdmin;
