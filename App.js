import { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { FlatList } from "react-native-web";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

// function Items({accounts, onPressItem }) {
//   const [items, setItems] = useState(accounts);

//   useEffect(() => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         'select * from accounts;',
//         (_, { rows: { _array } }) => setItems(_array)
//       );
//     });
//   }, []);

  

//   if (items === null || items.length === 0) {
//     return null;
//   }

//   return (
//     <View style={styles.sectionContainer}>
//       {items.map(({ id, name }) => (
//         <TouchableOpacity
//           key={id}
//           onPress={() => onPressItem && onPressItem(id)}
//           style={{
//             backgroundColor:"#fff",
//             borderColor: "#000",
//             borderWidth: 1,
//             padding: 8,
//           }}
//         >
//           <Text>{name}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

export default function App() {
  const [text, setText] = useState(null);
  const [id, setId] = useState(null);
  const [desc, setDesc] = useState(null);
  const [amount, setAmount] = useState(null);
  const [accounts, setaccounts] = useState(null);
  const [title, setTitle] = useState(null);
  const [tpay, setTpay] = useState(null);
  const [treceive, setTreceive] = useState(null);
  const [total, setTotal] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [modalVisible, setmodalVisibal] = useState(false);
  const [tranModalVisible, setTranModalVisible] = useState(false);
  const [side, setSide] = useState(null);
  const [color, setColor] = useState(null);
  const pay = 1;
  const receive = 0;

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists accounts (id integer primary key not null, name text, tpay real, treceive real, total real);"
      );
      tx.executeSql(
        "create table if not exists tansactions(id integer primary key not null, accountid integer, desc text, date date, amount real, side int)"
      )
    });
  }, []);

  const add = (text) => {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }
    else {

      db.transaction(
        (tx) => {
          tx.executeSql("insert into accounts (done, name, tpay, treceive,total) values (0, ?, 0, 0, 0)", [text]);
          tx.executeSql("select * from accounts", [], (_, { rows }) =>
            console.log(JSON.stringify(rows)),
            setaccounts(rows)
          );
        },
        null,
        forceUpdate
      );
      setmodalVisibal(!modalVisible)
    }
  };

  const addTransaction = (desc, amount, side) => {
    if (amount === null || amount === "") {
      return false;
    }
    else {
      const date = new Date().getDate();
      db.transaction(
        (tx) => {
          tx.executeSql("insert into transactions(accountid, desc, date, amount, side) values (?, ?, ?, ?, ?)", [id, desc, date, amount, side]);
        }
      )
      setTranModalVisible(!tranModalVisible);
    }
  };
 

  const updateMain = (id) => {
    setId(id);
    
  }


  return (
    <View style={styles.container}>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite is not supported on web!
          </Text>
        </View>
      ) : (
          <>
            <View  style={styles.flexColumn}> 
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => {
                  setmodalVisibal(!modalVisible);
          }} 
         
          >

        <View style={[styles.centreModal, styles.flexColumn]}>
                <View style={styles.modal}>  
            <Text>Add Account</Text>
            <TextInput
                      onChangeText={(text) => setText(text)
                      }
              onSubmitEditing={() => {
                add(text);
                setText(null);
              }}
              placeholder="Enter name to recognize"
                      style={styles.input}
                    
              value={text}
                  />
                  <View style={styles.flexRow}>
                    <Pressable
                      onPress={() => {
                        setmodalVisibal(!modalVisible);
                        setText(null);
                        }}
                      style={[styles.modalBtn, styles.modalClose]}>
                        {({ pressed }) => (<Text style={{
                          color: pressed ? "#ffbd59" : "grey",
                          fontSize: 16,
                          marginRight:25, }}>Close</Text>)}
                      </Pressable>
                      
                    <Pressable
                        onPress={() => {
                          add(text);
                          setText(null);}}
                        style={({ pressed }) => [{backgroundColor:pressed?"darkorange":"#ffbd59"},styles.modalBtn, styles.modalAdd]}
                      >
                <Text style={{color:"white"}}>Add 🤗</Text>
              </Pressable>
                  </View>
                </View>
                </View>
              </Modal>
              
        
         
              
           {/* <ScrollView style={styles.listArea}>
            <Items
              key={`forceupdate-todo-${forceUpdateId}`}
             
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`select * from transaction where id = ?;`, [
                      id,
                    ]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
          
              </ScrollView>  */}
            
              <Pressable
          onPress={() => {
            setmodalVisibal(!modalVisible);
                }}
              style={({ pressed }) => [{backgroundColor:pressed?"darkorange":"#ffbd59"},styles.addBtn]}>
                <Text style={[styles.addBtnText,
                {color:"white"}]}> + </Text>
        </Pressable>
            </View>
            

           <View style={[styles.main, styles.flexColumn]}> 
            <Modal

              visible={tranModalVisible}
              animationType="slide"
              onRequestClose={() => {
                setTranModalVisible(!tranModalVisible);
              }} 
              transparent={true}
              >

                <View style={[styles.centreModal, styles.flexColumn]}>
                <View style={styles.modal}>  
                      <Text>Add {side?"Payment":"Receiving" } Details</Text>
                  <View style={styles.flexColumn}>
                  <TextInput
                  onChangeText={(desc) => setDesc(desc)}
                  onSubmitEditing={() => {
                    
                    setDesc(null);
                  }}
                  placeholder="Enter Description to remember"
                  style={styles.input}
                  value={desc}
                                  />
                <TextInput
                  onChangeText={(amount) => setAmount(amount)}
                  onSubmitEditing={() => {
                  
                    setAmount(null);
                  }}
                  placeholder="Enter Amount"
                  style={styles.input}
                        value={amount}
                    keyboardType={"numeric"}
                      />
                    </View>
                      <View style={styles.flexRow}>
                        <Pressable
                          onPress={() => {
                            setTranModalVisible(!tranModalVisible);
                            setAmount(null);
                            setDesc(null);
                          }}
                        style={ [styles.modalBtn, styles.modalClose]}>
                         {({ pressed }) => (<Text style={{
                          color: pressed ? "#ffbd59" : "grey",
                          fontSize: 16,
                          marginRight:25, }}>Close</Text>)}
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            addTransaction(desc, amount, side);
                            setAmount(null);
                            setDesc(null);}}
                        style={({ pressed }) => [{backgroundColor:pressed?"darkorange":"#ffbd59"},styles.modalBtn, styles.modalAdd]}
                        >
                    <Text style={{color:"white"}}>Add 💸</Text>
                  </Pressable>
                      </View>
                    </View>
                    </View>
                            </Modal>
                          

                          <View style={[styles.mainHeader, styles.flexColumn]}>
                <Text style={styles.title}>Title:{title}</Text>
                            <View style={[styles.flexRow, styles.subpart]}>
                  <Text style={[{ color: "#ff5757" }, styles.headersub]}>To pay:{tpay}</Text>
                  
                  <Text style={[{ color: "#7ed975" }, styles.headersub]}>To receive: { treceive}</Text>
                            </View>
                            </View>
                            
                          <View style={[styles.chat, styles.flexColumn]}>
                <Text>CHat area</Text>
              
                <View style={ side ?styles.chatRight:styles.chatLeft}>
                  <Text>date</Text>
                  <Text>desc</Text>
                  <Text>amount</Text>

                            </View>

                            </View>
                            
              <View style={[styles.mainBottom, styles.flexColumn]}>
                
                <Text style={{
                  fontSize: 18,
                  paddingHorizontal: 5,
                  margin: 5,
                  color:"white",
               }}>Net Total: {total} </Text>
                          <View style={styles.flexRow}>

                                <Pressable
                                onPress={() => {
                                    setTranModalVisible(!tranModalVisible);    
                                    setSide(pay);        
                    }}
                    style={({ pressed })=>[{
                      backgroundColor:pressed?"red":"#ff5757",
                   }, styles.Btn]}>
                              <Text style={{ color:"white"}}>📤 Pay</Text>
                                </Pressable>
                                
                                <Pressable
                                onPress={() => {
                                  setTranModalVisible(!tranModalVisible);    
                                    setSide(receive); 
                    }}
                    style={({ pressed })=>[{
                      backgroundColor:pressed?"green":"#7ed975",
                   }, styles.Btn]}>
                              <Text style={{ color:"white"}}>📥 Receive</Text>
                          </Pressable>
                            </View>
                            </View>


              </View>
        </>
      )}

    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  main: {
    flex:1,
    
   
  },
  
  mainHeader: {
    flex: 1,
    backgroundColor: "#545454",
    justifyContent: "space-evenly",
    alignItems: "center",
    
  },

  title: {
    fontSize: 22,
    color:"white",
    justifyContent:"space-evenly"
},

  headersub: {
    fontSize:16,
    margin: 5,
    padding: 5,
   
  },

  subpart: {
    justifyContent: "center",
    alignItems:"center"
},

  chat: {
    height: 100,
    flex: 4,
    backgroundColor:"#fff"
  },

  mainBottom: {
    flex:1,
 
    backgroundColor: "#545454",
    justifyContent: "space-evenly",
 
    
  },

  Btn: {
    padding: 10,
    margin: 10,
    paddingHorizontal: 20,
    flex:1,
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 4,

  },

  container: {
    backgroundColor: "#000",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    flexDirection: "row",
    
  },

  addBtn: {  
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 50,
    height: 50,
    width: 50,
    marginHorizontal: 15,

  },

  addBtnText: {
    fontSize: 35,
    textAlign: "center",
    justifyContent: "center",
    flex: 1,
    color:"darkslategrey"
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  flexRow: {
    flexDirection: "row",
  },

  flexColumn: {
  flexDirection:"column",
  },

  centreModal:{
  flex: 1,
  justifyContent: "center",
    textAlign: "center",
  },

  modal: {
    margin: 40,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
},

  input: {
    borderColor: "#000",
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 15,
    padding:8,
    width:210
  },

  modalBtn: {
    margin: 5,
    padding:8,
},

  modalClose: {
   
  },
  
  modalAdd: {
    paddingHorizontal: 20,
    borderRadius:4,
  },

  listArea: {
    backgroundColor: "#f0f0f0",
    width: 70,
    paddingTop: 16,
  },

  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },

  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});