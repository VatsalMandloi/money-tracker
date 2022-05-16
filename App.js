import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
  

  <View>
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
            </View>


 <View>Main</View>
      <Text>Open up App.js to start working on your app!</Text>
         <StatusBar 
        animated= 'true'
        backgroundColor='#ff5757'
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
