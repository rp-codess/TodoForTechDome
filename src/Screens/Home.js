import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Btn from '../components/Btn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';

import {rh, rw} from '../components/commonFunctions ';

const Home = props => {
  const [name, setName] = useState('User');
  const route = useRoute();
  const isRefresh = route?.params?.isRefresh;
  const [userEmail, setUserEmail] = useState('User');
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const theme = useSelector(state => state.theme);
  const languageRedux = useSelector(state => state.language.language);

  const getData = async () => {
    AsyncStorage.getItem('users')
      .then(res => {
        return JSON.parse(res);
      })
      .then(resM => {
        AsyncStorage.getItem('loggedUser')
          .then(ele => {
            return JSON.parse(ele);
          })
          .then(res => {
            let d = resM.filter(ele => {
              return ele.email == res[0].email;
            });
            setData(d[0].currentTodo);
            console.log(d[0].currentTodo);
          });
      });
  };

  useEffect(() => {
    isRefresh ? getData() : null;
  }, []);
  const isExpired = expiryDate => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return now > expiry;
  };
  const deleteTodo = index => {
    // Remove the todo item from the data array
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);

    // Update AsyncStorage to persist the changes
    AsyncStorage.getItem('users')
      .then(res => {
        const users = JSON.parse(res);
        const loggedUser = users.find(user => user.email === userEmail);
        if (loggedUser) {
          loggedUser.currentTodo = updatedData;
          AsyncStorage.setItem('users', JSON.stringify(users));
        }
      })
      .catch(error => {
        console.error('Error deleting todo: ', error);
      });
  };
  const completeTodo = index => {
    // Update the isCompleted property of the todo item
    const updatedData = [...data];
    updatedData[index].isCompleted = !updatedData[index].isCompleted;
    setData(updatedData);

    // Update AsyncStorage to persist the changes
    AsyncStorage.getItem('users')
      .then(res => {
        const users = JSON.parse(res);
        const loggedUser = users.find(user => user.email === userEmail);
        if (loggedUser) {
          loggedUser.currentTodo = updatedData;
          AsyncStorage.setItem('users', JSON.stringify(users));
        }
      })
      .catch(error => {
        console.error('Error completing todo: ', error);
      });
  };

  useEffect(() => {
    AsyncStorage.getItem('loggedUser').then(p => {
      let user = JSON.parse(p);
      let n = user[0].name;
      setName(n);
      setUserEmail(user[0].email);
    });
    setTimeout(() => {
      getData();
    }, 1500);
  }, []);

  return (
    <View style={style.main}>
      <View style={style.HeaderView}>
        <Text style={style.txt}>Hello, {name}</Text>
        <TouchableOpacity
          onPress={() => {
            let k = 'k';
            AsyncStorage.setItem('loggedUser', JSON.stringify(k)).then(() => {
              props.navigation.navigate('Splash2');
            });
          }}>
          <Image style={style.img} source={require('../Images/logout.png')} />
        </TouchableOpacity>
      </View>

      <View style={style.HeadingView}>
        <View style={style.logo}>
          <Text style={style.h1}>Todo App</Text>
        </View>
      </View>
      <ScrollView>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            // backgroundColor: 'red',
            paddingHorizontal: rw(12),
            marginBottom: rh(14),
          }}>
          <Btn
            onPress={() =>
              navigation.navigate('AddTodo', {userEmail: userEmail})
            }
            title={'Add Todo'}
            width="42%"
            color={theme.textColor == 'white' ? 'black' : 'white'}
            bgColor={theme.secondaryColor}
          />
          <Btn
            onPress={() => navigation.navigate('AddTodo')}
            title={'Completed Todos'}
            width="42%"
            color={theme.textColor == 'white' ? 'black' : 'white'}
            bgColor={theme.secondaryColor}
          />
        </View>

        <ScrollView>
          {data?.map((ele, i) => {
            const expired = isExpired(ele.expiry);
            return (
              <View
                style={[style.todo, {borderColor: 'black', borderWidth: 2}]}>
                <Text
                  style={[
                    style.h1,
                    {
                      color: expired ? 'red' : theme.textColor,
                      textDecorationLine: ele?.isCompleted
                        ? 'line-through'
                        : 'none',
                    },
                  ]}>
                  {ele.title}
                  {expired && (
                    <Text style={{fontSize: 18}}> {'(Expired)'} </Text>
                  )}
                </Text>
                <Text style={[style.h2, {color: theme.textColor}]}>
                  {ele?.desc}
                </Text>
                <Text>Expiry : {ele?.expiry}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}>
                  <Btn
                    onPress={() => {
                      navigation.navigate('EditTodo');
                    }}
                    title={'Edit'}
                    width="28%"
                    color={theme.textColor == 'white' ? 'black' : 'white'}
                    bgColor={theme.secondaryColor}
                    height={35}
                    mt={10}
                  />
                  <Btn
                    onPress={() => {
                      deleteTodo(i);
                    }}
                    title={'Delete'}
                    width="28%"
                    color={theme.textColor == 'white' ? 'black' : 'white'}
                    bgColor={theme.secondaryColor}
                    height={35}
                    mt={10}
                  />
                  <Btn
                    onPress={() => {
                      completeTodo(i);
                    }}
                    title={ele?.isCompleted ? 'UnComplete' : 'Complete'}
                    width="28%"
                    color={theme.textColor == 'white' ? 'black' : 'white'}
                    bgColor={theme.secondaryColor}
                    height={35}
                    mt={10}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default Home;

const style = StyleSheet.create({
  todo: {
    width: '90%',
    margin: 'auto',
    paddingHorizontal: rw(12),
    paddingVertical: rh(14),
    gap: rh(6),
    borderRadius: rh(8),
    marginBottom: rh(18),
  },
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  txt: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: '700',
    color: 'black',
  },
  HeaderView: {
    marginTop: rh(30),
    height: rh(70),
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: rw(20),
    alignItems: 'center',
    flexDirection: 'row',
  },
  img: {
    height: rh(40),
    width: rh(40),
  },
  HeadingView: {
    paddingHorizontal: rw(20),
    marginTop: rh(14),
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    paddingBottom: rh(10),
  },
  h2: {
    fontSize: 22,
  },
  h1: {
    fontSize: 40,
    fontWeight: '700',
  },
  logo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImg: {
    height: rh(40),
    width: rh(40),
  },
});
