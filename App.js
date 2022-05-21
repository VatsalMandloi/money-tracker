import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Modal, Pressable, FlatList } from 'react-native';
import { useState } from 'react';
import * as SQLite from 'expo-sqlite';

export default function App() {

  const [modalVisible, setmodalVisibal] = useState(false);
  const [account, setAccount] = useState('');

  const db = SQLite.openDatabase("database.db");

  const handleSubmit = () => {
   
  }
  return (
    <View style={styles.container}>
     
      <View style={styles.sidenav}>
       
        <View>
          <FlatList>
            data={Accounts}
            keyExtractor={account => account._id.toString()}
            renderItem={({ account }) => (
             
              <View>
                <Text>{account.Account} </Text>
              </View>
              
            )}

          </FlatList>
        </View>
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => {
            setmodalVisibal(!modalVisible);
          }} 
          transparent={true}
          >
          <View>
            <Text>Add Account</Text>
            <TextInput
              placeholder='Enter Account name'
              value={account}
              onChangeText={setAccount}
            />
            <View>
              <Pressable
                onPress={() => {
                  setmodalVisibal(!modalVisible);
                }}
              >
                <Text>Close</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
              >
                <Text>Add</Text>
              </Pressable>
            </View>
            
         </View>
          
        </Modal>
        <Pressable
          onPress={() => {
            setmodalVisibal(!modalVisible);
        }}>
          <Text>+</Text>
        </Pressable>
     </View>

      

      <View style={styles.main}>
       
      </View>
     
      <Text>Open up App.js to start working on your </Text>
     
      <StatusBar 
        backgroundColor='#ff6961'
        barStyle='dark-content'
        
      />
    </View>  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
