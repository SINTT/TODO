import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, RefreshControl, SafeAreaView, Image, ActionSheetIOS, Alert, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from './UserContext';
import { format } from 'date-fns';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { RadioButton, Text as PaperText, Button } from 'react-native-paper';


const HomeScreenManager = () => {
  const { user, ip } = useContext(UserContext);
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const initials = `${user.firstName.charAt(0)}.${user.patronymic.charAt(0)}.`;

  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;
  const { width: screenWidth } = Dimensions.get('window');


  const [sortOption, setSortOption] = useState('dueSoon');
  const [pendingSortOption, setPendingSortOption] = useState('dueSoon');


const bottomSheetRef = useRef(null);
  const toggleBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
    }
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


  const sortTasks = (tasks, option) => {
    switch (option) {
      case 'dueSoon':
        return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'newest':
        return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'priority':
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      default:
        return tasks;
    }
  };

  const loadTasks = async () => {
    try {
      const response = await axios.get(`${ip}/tasks`);
      if (response.data.success) {
        const sortedTasks = sortTasks(response.data.tasks, sortOption);
        setTasks(sortedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };


useEffect(() => {
  loadTasks();
}, [sortOption]);

const onRefresh = React.useCallback(() => {
  setRefreshing(true);
  loadTasks();
  setRefreshing(false);
}, [sortOption]);

const today = new Date();

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
          <Text style={{ fontSize: 14, marginTop: 5 }}>{description}</Text>
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

const activeTasks = tasks.filter(task => task.status !== 'готово' && new Date(task.dueDate) >= today && task.title.toLowerCase().includes(searchQuery.toLowerCase()));
const archiveTasks = tasks.filter(task => task.status === 'готово' || new Date(task.dueDate) < today && task.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderBackdrop = props => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
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

          </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTaskScreen')}
        >
          <Image source={require('./shapes/add-ico.png')} style={styles.addIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по задач..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Контейнер с кнопками */}
      <View style={{ width: '100%', padding: 10, flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => scrollToPage(1)} style={[styles.pageButton, { backgroundColor: currentPage === 1 ? 'white' : 'transparent' }]}>
          <Text style={[styles.pageButtonText, currentPage === 1 ? styles.activeButtonText : styles.inactiveButtonText]}>Задачи</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToPage(2)} style={[styles.pageButton, { backgroundColor: currentPage === 2 ? 'white' : 'transparent' }]}>
          <Text style={[styles.pageButtonText, currentPage === 2 ? styles.activeButtonText : styles.inactiveButtonText]}>Архив</Text>
        </TouchableOpacity>

        <View style={{flex: 1}}/>

        <TouchableOpacity style={{ backgroundColor: 'white', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10, alignSelf: 'flex-end' }} onPress={toggleBottomSheet}>
          <Image source={require('./shapes/sort-ico.png')} style={{ height: 28, width: 28 }} />
        </TouchableOpacity>       
      </View>

      {/* ScrollView для страниц */}
      <View style={{ flex: 1, borderRadius: 10 }}>
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
          }}>

          {/* Содержимое слайдера */}
          <View style={{ width: screenWidth - 20, borderRadius: 10, marginHorizontal: 10 }}>
            <FlatList
              data={activeTasks}
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

          <View style={{ width: screenWidth - 20, borderRadius: 10, marginHorizontal: 10 }}>
            <FlatList
              data={archiveTasks}
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



      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['45%']}
        backgroundComponent={({ style }) => (
          <View style={[style, { backgroundColor: 'white', borderRadius: 12 }]} />
        )}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={{ backgroundColor: 'white', padding: 20, height: '100%' }}>
          <View style={{ flex: 1 }}>
            <PaperText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Сортировка</PaperText>
            <RadioButton.Group onValueChange={newValue => setPendingSortOption(newValue)} value={pendingSortOption}>
              <TouchableOpacity style={styles.radioButtonContainer} onPress={() => setPendingSortOption('dueSoon')}>
                <RadioButton value="dueSoon" />
                <PaperText>Скоро истечет срок</PaperText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioButtonContainer} onPress={() => setPendingSortOption('newest')}>
                <RadioButton value="newest" />
                <PaperText>Сначала новое</PaperText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioButtonContainer} onPress={() => setPendingSortOption('oldest')}>
                <RadioButton value="oldest" />
                <PaperText>Сначала старое</PaperText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioButtonContainer} onPress={() => setPendingSortOption('priority')}>
                <RadioButton value="priority" />
                <PaperText>По приоритету</PaperText>
              </TouchableOpacity>
            </RadioButton.Group>
            <Button mode="contained" onPress={() => { setSortOption(pendingSortOption); bottomSheetRef.current.close(); }} style={{ marginTop: 20 }}>
              Применить
            </Button>
          </View>
        </View>
      </BottomSheet>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  addIcon: { width: '100%', height: '100%' },
  searchContainer: {
    padding: 10,
    paddingTop: 0,
    backgroundColor: 'white',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  taskListContainer: {
    flex: 1,
  },
  taskItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

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

export default HomeScreenManager;
