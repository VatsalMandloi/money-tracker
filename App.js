import { useState, useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";


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

export default function App() {
  const [text, setText] = useState(null);
  const [id, setId] = useState(null);
  const [desc, setDesc] = useState(null);
  const [amount, setAmount] = useState(null);
  const [accounts, setaccounts] = useState(null);
  const [acc, setacc] = useState([{ id: "1", name: "va" },
  {
    id: 4,
    name: 'non esse culpa molestiae omnis sed optio'
  },
  {
    id: 5,
    name: 'eaque aut omnis a'
  },
  {
    id: 6,
    name: 'natus impedit quibusdam illo est'
  },]);
  const [transaction, setTransaction] = useState(null);
  
  const [title, setTitle] = useState(null);
  const [tpay, setTpay] = useState(null);
  const [treceive, setTreceive] = useState(null);
  const [total, setTotal] = useState(null);
  const [date, setDate] = useState(null);
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
        "create table if not exists accounts (id integer primary key not null, name text, tpay real, treceive real);"
      );
      tx.executeSql(
        "create table if not exists tansactions(id integer primary key not null, accountid integer, desc text, date date, amount real, side int)",[], (tx, results) => {
          console.log("table created")
        }
      );
      tx.executeSql("select * from accounts", [], (tx, results) => {
        setaccounts(results.rows._array) 
      }
      
      );
    });
  }, []);

const add = (text) => {
    // is text empty?
    if (text === null || text === "") {
     
      return false;
    }
    else {
     
     db.transaction((tx) => {
      tx.executeSql(
        "insert into accounts(name, tpay, treceive) values(?, 0, 0)", [text], (tx, results) => {
          
        }
      );
      tx.executeSql("select * from accounts", [], (tx, results) => {
        setaccounts(results.rows._array)
      }
      
      );
        },
        null,
        forceUpdate,
        console.log("a")
      );
        
 
      setmodalVisibal(!modalVisible)
    }
  };

  const addTransaction = (id, desc, amount, side) => {
    var pay = 0
    var p = parseFloat(tpay)
    var r = parseFloat(treceive)
    if (id === null) {
     return false
   }
    if (desc === null || desc === "") {
      desc = "place emoji here";
    }
    if (amount === null || amount === "") {
      return false;
    }
    else {
      if (side) {
        pay = parseFloat(tpay) + parseFloat(amount)
        p=pay
        setTpay(pay)
        db.transaction(
          (tx) => {
            tx.executeSql("update accounts set tpay = ?  where id = ?", [pay, id], (tx,  result )=> {
              console.log("updatep"+id+pay)
          });
          }
        )
      } else {
        pay = parseFloat(treceive) + parseFloat(amount)
        r=pay
        setTreceive(pay);
        db.transaction(
          (tx) => {
            tx.executeSql("update accounts set treceive = ?  where id = ?", [pay, id], (tx,  result )=> {
              console.log("updater"+id+pay)
          });
          }
        )
       
      }
console.log(r+p)
      setTotal(r - p)
      
      const date = new Date().getDate();
      db.transaction(
        (tx) => {
          tx.executeSql("insert into tansactions(accountid, desc, date, amount, side) values (?, ?, ?, ?, ?)", [id, desc, date, amount, side]);
          
        }
      )
      setTranModalVisible(!tranModalVisible);
    }
  };
 

  const updateMain = (account) => {
    setId(account.id)
    setTitle(account.name)
    setTpay(account.tpay)
    setTreceive(account.treceive)
    setTotal(account.treceive-account.tpay)
    db.transaction(
      (tx) => {
        tx.executeSql("select * from transactions where accountid = ?", [account.id],
          (_, { rows }) => {
            console.log(rows)
            setTransaction(rows);
        })
      }
    )
  
  }

  const renderItem = ({ item }) => {
 
    return (
      <View>
        <Pressable
          onPress={() => { updateMain(item) }}>
          <Text>{item.name}</Text>
          </Pressable>
    </View>
    );
    
  };

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
             
                <FlatList
                  data={accounts}
                  renderItem={renderItem}
                  keyExtractor={(item) => 
                     item.id
                  }
                />
              
              
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
                            addTransaction(id, desc, amount, side);
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
                <Text style={styles.title}>{title} ⚰️</Text>
                            <View style={[styles.flexRow, styles.subpart]}>
                  <Text style={[{ color: "#ff5757" }, styles.headersub]}>- {tpay}</Text>
                  
                  <Text style={[{ color: "#7ed975" }, styles.headersub]}>+ { treceive}</Text>
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
                
                <View style={styles.flexRow}>
                  <Text style={{
                  fontSize: 18,
                paddingLeft:15,
                   
                  marginTop:5,
                  color: "white",
                }}>Net Total: </Text>
                  
                  <Text style={{
                  fontSize: 26,
                
                  color: total===0?"white":total>0?"#7ed975":"#ff5757"
                }}> {total} </Text>
                </View>

               
            
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
    fontSize:19,
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
    backgroundColor: "#fff",
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