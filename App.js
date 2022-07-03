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
  Alert,
  StatusBar,
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

export default function App() {
  const [text, setText] = useState(null);
  const [id, setId] = useState(null);
  const [desc, setDesc] = useState(null);
  const [amount, setAmount] = useState(null);
  const [accounts, setaccounts] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [title, setTitle] = useState("👻");
  const [tpay, setTpay] = useState(null);
  const [treceive, setTreceive] = useState(null);
  const [total, setTotal] = useState(null);
  const [date, setDate] = useState(null);
  const [modalVisible, setmodalVisibal] = useState(false);
  const [tranModalVisible, setTranModalVisible] = useState(false);
  const [side, setSide] = useState(null);
  const [selectedID, setSelID] = useState(null);
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
        "insert into accounts(name, tpay, treceive) values(?, 0, 0)", [text]);
      tx.executeSql("select * from accounts", [], (tx, results) => {
        setaccounts(results.rows._array)
      }
      
      );
        },
        
        
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
            tx.executeSql("update accounts set tpay = ?  where id = ?", [pay, id]);
          }
        )
      } else {
        pay = parseFloat(treceive) + parseFloat(amount)
        r=pay
        setTreceive(pay);
        db.transaction(
          (tx) => {
            tx.executeSql("update accounts set treceive = ?  where id = ?", [pay, id]);
          }
        )
       
      }

      setTotal(r - p)
      
      const date = new Date().getDate();
      db.transaction(
        (tx) => {
          tx.executeSql("insert into tansactions(accountid, desc, date, amount, side) values (?, ?, ?, ?, ?)", [id, desc, date, amount, side]);
         
          
          dbTran(id)
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
    dbTran(account.id)
    setSelID(account.id)
  }


  const dbTran = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from tansactions where accountid = ?", [id],
          (tx,results ) => {
            
            setTransactions(results.rows._array);
        })
      }
    )
}

  const renderItem = ({ item }) => {
    return (
      <View>
        <Pressable
          onPress={() => { updateMain(item) }}
        
          style={ [styles.avatar,{borderColor:(item.id===selectedID)?"#FF8157":"#0000",borderWidth:1}]}>
          <Text style={styles.avatarTitle}>{item.name}</Text>
          </Pressable>
    </View>
    );
  };

  const chat = ({ item }) => {
    return (
      <View style={[ item.side?styles.pchat: styles.rchat, styles.chatCard, styles.flexRow ]}>
        <View style={styles.flexColumn}>
        <Text style={styles.chatdesc}>{item.desc}</Text>
        <Text style={styles.chatdesc}>{ item.date}</Text>
       </View> 
        <Text style={styles.chatam}>{ item.amount}</Text>

                </View>
    );
  };

  const initialState = () => {
    setId(null)
    setTitle("👻")
    setTotal(null)
    setTpay(null)
    setTreceive(null)
    setTransactions(null)
  }
const  delAccount=(id)=>{
  
  db.transaction(
    (tx) => {
      tx.executeSql(`delete from accounts where id = ?;`, [id]);
      tx.executeSql(`delete from tansactions where accountid = ?;`, [id]);
      tx.executeSql("select * from accounts;", [], (tx, results) => {
        setaccounts(results.rows._array),
        initialState();
      }
      
      );
      console.log("a")
    },

  );

}
  const delAlert = (id,title) =>
    Alert.alert(
      "We miss you " + title+"!! 😭",
      "All transactions will be deleted!!",
      [
        {
          text: "cancel",
          style: "cancel"
        },
        {
          text: "Let it go!!",
          onPress: () => {
           delAccount(id)
          }
        },
        
      ]
    )
  


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
            <View style={[styles.flexColumn, styles.sidenav]}> 
            
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
            <Text style={styles.modaltitle}>Add Account</Text>
            <TextInput
                      onChangeText={(text) => setText(text)
                      }
              onSubmitEditing={() => {
                add(text);
                setText(null);
              }}
              placeholder="Enter name to recognize!!"
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
                          color: pressed ? "#FF8157" : "darkgrey",
                          fontSize: 16,
                          marginRight:25, }}>Close</Text>)}
                      </Pressable>
                      
                    <Pressable
                        onPress={() => {
                          add(text);
                          setText(null);}}
                        style={({ pressed }) => [{backgroundColor:pressed?"#CF8066":"#FF8157"},styles.modalBtn, styles.modalAdd]}
                      >
                <Text style={{color:"#EDEDEE"}}>Add 🤗</Text>
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
              
              
              <Pressable
          onPress={() => {
            setmodalVisibal(!modalVisible);
                }}
              style={({ pressed }) => [{backgroundColor:pressed?"#FF8157":"#0000"},styles.addBtn]}>
                {({ pressed }) =>(<Text style={[styles.addBtnText,
                { color: pressed?"#101820FF":"#FF8157" }]}> + </Text>)}
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
                      <Text style={styles.modaltitle}>Add {side?"Payment":"Receiving" } Details</Text>
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
                         color: pressed ? "#FF8157" : "darkgrey",
                          fontSize: 16,
                          marginRight:25, }}>Close</Text>)}
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            addTransaction(id, desc, amount, side);
                            setAmount(null);
                            setDesc(null);}}
                        style={({ pressed }) => [{backgroundColor:pressed?"#CF8066":"#FF8157"},styles.modalBtn, styles.modalAdd]}
                        >
                    <Text style={{color:"#EDEDEE"}}>Add 💸</Text>
                  </Pressable>
                      </View>
                    </View>
                    </View>
                            </Modal>
                          

                          <View style={[styles.mainHeader, styles.flexColumn]}>
                <View style={[styles.flexRow]}>
                  <View style={{flex:3,alignItems:"center"}}>
                  <Text style={[styles.title]}>{title}
                  </Text>
                  </View>
                 
                  
                  <View style={{ justifyContent: "flex-end", flex: 1 }}
                 >
                    <Pressable
                      onPress={() => {
                        delAlert(id,title)
                      }}
                       disabled={id === null?true:false}
                      style={({pressed})=>[styles.delBtn,{backgroundColor:pressed?"#ff5757":"#0000"}]}>
                      {({ pressed })=>( <Text style={[{ color:pressed?"white":"#ff5757" }]}>Delete</Text>)}
                     
                    </Pressable>
                  </View>
                
                </View> 

                            <View style={[styles.flexRow, styles.subpart]}>
                  <Text style={[{ color: "#ff5757" }, styles.headersub]}>- {tpay}</Text>
                  
                  <Text style={[{ color: "#7ed975" }, styles.headersub]}>+ { treceive}</Text>
                            </View>
                            </View>
                            
                          <View style={[styles.chat, styles.flexColumn]}>
               
                <FlatList
                  data={transactions}
                  renderItem={chat}
                  keyExtractor={(item)=>item.id}
                        />
              

                            </View>
                            
              <View style={[styles.mainBottom, styles.flexColumn]}>
                
                <View style={[styles.flexRow,{ marginTop:5}]}>
                  <Text style={{
                  fontSize: 16,
                paddingLeft:15,
             marginTop:2,
                  color: "#B9B9BA",
                }}>Net Total: </Text>
                  
                  <Text style={{
                  fontSize: 19,
                
                  color: total===0?"#CACBCB":total>0?"#41BF5B":"#ff5757"
                }}> {total} </Text>
                </View>

                          <View style={styles.flexRow}>

                  <Pressable
                    disabled={id === null?true:false}
                                onPress={() => {
                                    setTranModalVisible(!tranModalVisible);    
                                    setSide(pay);        
                    }}
                    style={({ pressed })=>[{
                      backgroundColor: pressed ? "#ff5757" : "#0000",
                      borderColor: "#ff5757",
                      borderWidth:1,
                    }, styles.Btn]}>
                    {({ pressed })=>(<Text style={{ color:pressed?"white":"#ff5757"}}>Pay</Text>)}
                                </Pressable>
                                
                  <Pressable
                    disabled={id === null?true:false}
                                onPress={() => {
                                  setTranModalVisible(!tranModalVisible);    
                                    setSide(receive); 
                    }}
                    style={({ pressed })=>[{
                      backgroundColor: pressed ? "#41BF5B" : "#0000",
                      borderColor: "#41BF5B",
                      borderWidth:1,
                   }, styles.Btn]}>
                             {({ pressed })=>(<Text style={{ color:pressed?"white":"#41BF5B"}}>Receive</Text>)}
                          </Pressable>
                            </View>
                            </View>


              </View>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex:1,
  },
  sidenav: {
    backgroundColor: "#101820FF",
    alignItems: "center",
    paddingTop:25,
  },
  avatar: {
    backgroundColor:"#2A3036",
    width: 50,
    height:50,
    padding: 5,
    margin: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent:"center",
  },

  avatarTitle: {
    color: "#CACBCB",
    fontSize:14,
  },

  mainHeader: {
    flex: 1,
    backgroundColor: "#1E252C",
    justifyContent: "space-evenly",
    alignItems: "center",
    
  },
  
  title: {
    fontSize: 22,
    color:"#CACBCB",
    justifyContent:"space-evenly"
},

  delBtn:{
      borderColor: "#ff5757",
      borderWidth: 1,
      borderRadius: 4,
        padding: 4,
      marginRight:4,
      alignItems: "center",  
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
    flex: 4,
    backgroundColor:"#2A3036"
  },

  pchat:{
    alignSelf:"flex-start"
    
  },
  
  rchat: {
    alignSelf:"flex-end"
  },
  chatCard: {
    backgroundColor: "#363C41",
    margin: 4,
    padding: 6,
    borderRadius: 15,
    justifyContent: "space-between",
    maxWidth: 210,
    
  },
  chatdesc:{
    fontSize: 14,
    color: "#CACBCB",
    marginHorizontal: 5,
    paddingHorizontal: 5,
    flexWrap: "wrap",
    maxWidth:120,
  },
  chatam: {
    fontSize: 18,
    color: "#CACBCB",
    alignSelf: "center",
    marginHorizontal: 5,
    paddingHorizontal: 5,
    paddingLeft:15,
    borderLeftWidth: 1,
    borderLeftColor:"grey"
  },
  mainBottom: {
    flex:1,
    backgroundColor: "#1E252C",
    justifyContent: "space-evenly",
  },

  Btn: {
    padding: 10,
    margin: 10,
    paddingHorizontal: 20,
    flex:1,
    
    alignItems: "center",
    borderRadius: 4,
  },

  modaltitle: {
  color:"#DCDCDC"
  },
  
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    flexDirection: "row",
    
  },

  addBtn: {  
    justifyContent: "center",
    alignItems: "center",
    alignSelf:"flex-end",
    borderRadius: 50,
    height: 50,
    width: 50,
    margin: 15,
    borderColor: "#FF8157",
    borderWidth: 1,
    marginBottom: 28,
   
    paddingBottom:10,
  },

  addBtnText: {
    fontSize: 35,
  fontWeight:"200",
    color: "darkslategrey",
    
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
    backgroundColor: "#5B5E60",
    borderRadius: 20,
    padding: 30,
    borderColor: "#DCDCDC",
    borderWidth:1,
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
    backgroundColor:"#DCDCDC",
    borderColor: "white",
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

});

