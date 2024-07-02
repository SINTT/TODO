import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { UserContext } from './UserContext';
import axios from 'axios';
import { format } from 'date-fns';

const TaskScreen = ({ route, navigation }) => {
  const { user, ip } = useContext(UserContext);
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`${ip}/tasks/${taskId}`);
        if (response.data.success) {
          setTask(response.data.task);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`${ip}/tasks/${taskId}`, { status: newStatus });
      if (response.data.success) {
        setTask({ ...task, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCompleteTask = () => {
    Alert.alert(
      'Завершение задачи',
      'Вам удалось выполнить задачу?',
      [
        {
          text: 'Нет',
          onPress: () => handleStatusChange('к выполнению'),
          style: 'cancel',
        },
        { text: 'Да', onPress: () => handleStatusChange('готово') },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={{flexDirection: 'row', borderWidth: 1, padding: 5, borderRadius: 5, alignSelf: 'flex-start'}}>
          <Text style={{fontSize: 14}}>Создан: </Text>
          <Text style={{fontSize: 14}}>{format(new Date(task.createdAt), 'dd.MM.yyyy')} | </Text>
          <Text style={{fontSize: 14}}>{format(new Date(task.createdAt), 'HH:mm')}</Text>
        </View>
      </View>


      <View style={{flexDirection: 'row', marginTop: 50, justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={{width: 34, height: 34, backgroundColor: 'lightgray', borderRadius: 18, marginRight: 5}}>
            <Image source={require('./shapes/avatar-ico.png')} style={{width: '100%', height: '100%'}} />
          </TouchableOpacity>

          <View>
            <Text style={{fontSize: 16, fontWeight: '600'}}>{task.createdBy}</Text>
            <Text style={{color: 'gray'}}>{task.creatorRole}</Text>
          </View>
        </View>

        <View style={{paddingVertical: 5, paddingHorizontal: 10, marginVertical: 5, borderWidth: 1, borderRadius: 5, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
        backgroundColor: task.priority === 'Low' ? 'rgba(35, 255, 0, 0.5)' : task.priority === 'Medium' ? 'rgba(250, 255, 0, 0.5)' : task.priority === 'High' ? 'rgba(255, 0, 0, 0.5)' : 'white'
        }}>
          <Text>{task.priority}</Text>
        </View>

      </View>

      <View style={{backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, padding: 10, marginTop: 5}}>
        <View style={{}}>
          <Text style={{ textAlign: 'justify' }}>{task.description}</Text>
        </View>

        <View style={{flexDirection: 'row', alignSelf: 'flex-end', marginTop: 10}}>
          <Text style={{fontSize: 14, color: 'gray'}}>Выполнить до: </Text>
          <Text style={{fontSize: 14, color: 'gray'}}>{format(new Date(task.dueDate), 'dd.MM.yyyy')} | </Text>
          <Text style={{fontSize: 14, color: 'gray'}}>{format(new Date(task.dueDate), 'HH:mm')}</Text>
        </View>
        
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{alignSelf: 'flex-start', padding: 10, marginVertical: 5}}>
            <Text>Статус: {task.status}</Text>
        </View>

        {task.status === 'к выполнению' && (
          <TouchableOpacity onPress={() => handleStatusChange('выполняется')} style={{backgroundColor: 'blue', alignSelf: 'flex-end', padding: 10, borderRadius: 5, marginVertical: 5, width: 150, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: 'white'}}>Начать выполнение</Text>
          </TouchableOpacity>
        )}

        {task.status === 'выполняется' && (
          <TouchableOpacity onPress={handleCompleteTask} style={{backgroundColor: 'rgba(0,0,0,0.05)', alignSelf: 'flex-end', padding: 10, borderRadius: 5, marginVertical: 5, width: 150, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: 'red'}}>Завершить</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TaskScreen;
