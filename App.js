import { useState, useEffect } from "react";
import {
  Platform,
  
  StyleSheet,
  Text,
  TextInput,
  ,
  View,
  Modal,
  Pressable,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

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
function Items({ done: doneHeading, onPressItem }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from accounts where done = ?;`,
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  const heading = doneHeading ? "Completed" : "Todo";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, name }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#000",
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" }}>{name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [text, setText] = useState(null);
  const [id, setId] = useState(null);
  const [desc, setDesc] = useState(null);
  const [amount, setAmount] = useState(null);
  const [title, setTitle] = useState(null);
  const [tpay, setTpay] = useState(null);
  const [treceive, setTreceive] = useState(null);
  const [total, setTotal] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [modalVisible, setmodalVisibal] = useState(false);
  const [tranModalVisible, setTranModalVisible] = useState(false);
  const [side, setSide] = useState(null);
  const pay = 1;
  const receive = 0;

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists accounts (id integer primary key not null,done int, name text, tpay real, treceive real, total real);"
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
            console.log(JSON.stringify(rows))
          );
        },
        null,
        forceUpdate
      );
    setmodalVisibal(!modalVisible)}
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

          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => {
            setmodalVisibal(!modalVisible);
          }} 
          transparent={true}
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
                      <Text>Close</Text>
                      </Pressable>
                      
                    <Pressable
                        onPress={() => {
                          add(text);
                          setText(null);}}
                        style={[styles.modalBtn, styles.modalAdd]}
                      >
                <Text>Add</Text>
              </Pressable>
                  </View>
                </View>
                </View>
              </Modal>
              
          <ScrollView style={styles.listArea}>
            <Items
              key={`forceupdate-todo-${forceUpdateId}`}
              done={false}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`update accounts set done = 1 where id = ?;`, [
                      id,
                    ]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
            <Items
              done
              key={`forceupdate-done-${forceUpdateId}`}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`delete from accounts where id = ?;`, [id]);
                  },
                  null,
                  forceUpdate,
                  updateMain(id),
                )
              }
            />
              </ScrollView>
              <Pressable
          onPress={() => {
            setmodalVisibal(!modalVisible);
                }}
              style={styles.addBtn}>
          <Text style={styles.addBtnText}> + </Text>
        </Pressable>
            </View>
            

            {id === null ? (<View>
              <Text>CHoose an account to continue</Text>
           </View>):( <View>
              
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
                      />
                    </View>
                      <View style={styles.flexRow}>
                        <Pressable
                          onPress={() => {
                            setTranModalVisible(!tranModalVisible);
                            setAmount(null);
                            setDesc(null);
                          }}
                          style={[styles.modalBtn, styles.modalClose]}>
                          <Text>Close</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            addTransaction(desc, amount, side);
                            setAmount(null);
                            setDesc(null);}}
                          style={[styles.modalBtn, styles.modalAdd]}
                        >
                    <Text>Add</Text>
                  </Pressable>
                      </View>
                    </View>
                    </View>
                            </Modal>
                          

                          <View>
                            <Text>Title</Text>
                            <View style={styles.flexRow}>
                              <Text>Tpay</Text>
                              <Text>Treceive</Text>
                            </View>
                            </View>
                            
                          <View>
                            <Text>CHat area</Text>
                            </View>
                            
                          <View>
                            <Text>Total: </Text>
                          <View style={styles.flexRow}>

                                <Pressable
                                onPress={() => {
                                    setTranModalVisible(!tranModalVisible);    
                                    setSide(pay);        
                          }}>
                              <Text>Pay</Text>
                                </Pressable>
                                
                                <Pressable
                                onPress={() => {
                                  setTranModalVisible(!tranModalVisible);    
                                    setSide(receive); 
                          }}>
                              <Text>Receive</Text>
                          </Pressable>
                            </View>
                            </View>


              </View>)}
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
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    flexDirection: "row"
  },

  addBtn: {  
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 50,
    height: 50,
    width: 50,
    backgroundColor: "#ff5757",
    
  },

  addBtnText: {
    fontSize: 35,
    textAlign: "center",
    justifyContent: "center",
    flex:1,
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
    borderColor: "#4630eb",
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
    backgroundColor: "#ff5757",
    borderRadius:4,
  },

  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
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
