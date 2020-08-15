import * as React from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Title,
  Checkbox,
  Divider,
  DataTable,
  Button,
} from 'react-native-paper';
import Modal from 'react-native-modal';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      buttonClick: false,
      total: 0,
      hours: 0,
      per_hours: 0,
      isModalVisible: false,
      url: '',
      primary: '#006aff',
      message: 'Loading ...',
      loading: true,
    };
  }
  fetchData = async () => {
    // const url = await AsyncStorage.getItem('url');
    // let url = 'https://ctserver.workpc.online/mitesh_demo/data.php';

    let url = this.state.url;
    if (!url) {
      this.setState({
        isModalVisible: true,
      });
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
      .then((response) => response.json())
      .then(({result}) => {
        var listing = {};
        const newFile = result.map((item) => {
          return {
            ...listing,
            id: item.id,
            checked: false,
            name: item.name,
            timesheet_cost: item.timesheet_cost,
            work: '',
          };
        });
        this.setState({
          list: Object.values(newFile),
          url: url,
          loading: false,
          buttonClick: false,
        });
      })
      .catch((err) => {
        this.setState({
          isModalVisible: true,
          buttonClick: false,
          list: [],
          url: url,
          message: 'Api Url has no data !!!',
        });
      });
  };

  async componentDidMount() {
    this.fetchData();
  }
  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };
  render() {
    const handleChange = (value, id) => {
      let items = [...this.state.list];
      let item = {...items[id]};
      item.work = value;
      items[id] = item;
      this.setState({list: items, buttonClick: false});
    };
    const handleCheked = (id) => {
      let items = [...this.state.list];
      let item = {...items[id]};
      item.checked = !item.checked;
      items[id] = item;
      this.setState({list: items, buttonClick: false});
    };
    const handleButton = () => {
      let total = 0;
      let hour = 0;
      let per_hours = 0;
      let ifChecked = false;
      this.state.list.length > 0
        ? this.state.list.map((item, i) => {
            if (item.checked) {
              ifChecked = true;
              total =
                total + parseInt(item.timesheet_cost) * parseInt(item.work);
              hour = hour + parseInt(item.work);
              per_hours = per_hours + parseInt(item.timesheet_cost);
            }
          })
        : null;

      if (ifChecked) {
        this.setState({
          buttonClick: true,
          total: total,
          hours: hour,
          per_hours: per_hours,
        });
      } else {
        Alert.alert('Please check a checkbox');
      }
    };
    const saveURL = async () => {
      let url = this.state.url;
      // if (url !== '') await AsyncStorage.setItem('url', url);
      try {
        await AsyncStorage.setItem('myUrl', url);
      } catch (error) {
        // Error saving data
      }

      this.fetchData();
      this.setState({
        isModalVisible: false,
      });
    };

    return (
      <>
        <Modal isVisible={this.state.isModalVisible}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 20,
              paddingBottom: 20,
            }}>
            <TextInput
              label="Enter Api URL"
              mode="outlined"
              value={this.state.url}
              onChangeText={(e) => this.setState({url: e})}
              theme={{
                colors: {
                  primary: this.state.primary,
                },
              }}
            />
            <View
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <Button
                onPress={this.toggleModal}
                mode="outlined"
                theme={{
                  colors: {
                    primary: this.state.primary,
                  },
                }}>
                Cancle
              </Button>
              <Button
                mode="outlined"
                onPress={() => saveURL()}
                theme={{
                  colors: {
                    primary: this.state.primary,
                  },
                }}>
                Save
              </Button>
            </View>
          </View>
        </Modal>
        <Appbar.Header
          theme={{
            colors: {
              primary: this.state.primary,
            },
          }}>
          <Appbar.Content title="Cost Estimation" />
          <Appbar.Action
            icon="settings"
            onPress={() => {
              this.setState({isModalVisible: true});
            }}
          />
        </Appbar.Header>
        <ScrollView style={{margin: 13}}>
          {this.state.list.length > 0 ? (
            <View>
              <View style={{marginTop: 8}}>
                <Title style={{fontSize: 27, fontFamily: 'roboto-regular'}}>
                  Employees
                </Title>
              </View>
              <FlatList
                data={this.state.list}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.container} key={index}>
                      <Checkbox
                        color="#006aff"
                        status={item.checked ? 'checked' : 'unchecked'}
                        onPress={() => {
                          handleCheked(index);
                        }}
                      />
                      <View style={{marginLeft: 30}}>
                        <Text
                          style={{fontSize: 20, fontFamily: 'roboto-regular'}}
                          onPress={() => {
                            handleCheked(index);
                          }}>
                          {item.name}
                        </Text>
                        <Text
                          style={{fontSize: 14, fontFamily: 'roboto-regular'}}
                          onPress={() => {
                            handleCheked(index);
                          }}>
                          ₹ {item.timesheet_cost} / hour
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                        }}>
                        <TextInput
                          label="Hours"
                          mode="outlined"
                          style={{width: 90}}
                          value={item.work ? item.work : ''}
                          keyboardType="number-pad"
                          onChangeText={(e) => handleChange(e, index)}
                          disabled={item.checked ? false : true}
                          theme={{
                            colors: {
                              primary: this.state.primary,
                            },
                          }}
                        />
                      </View>
                    </View>
                  );
                }}
                keyExtractor={(item) => item.id}
                onRefresh={() => this.fetchData()}
                refreshing={this.state.loading}
              />
              <Button
                style={{
                  marginTop: 10,
                  width: 180,
                  marginLeft: 'auto',
                }}
                icon="calculator"
                mode="contained"
                type="outlined"
                onPress={() => handleButton()}
                theme={{
                  colors: {
                    primary: this.state.primary,
                  },
                }}>
                Calculate
              </Button>
              <Divider style={{marginTop: 20}} />
              <Divider />
              <Divider />
            </View>
          ) : (
            <>
              <ActivityIndicator size="large" color="#006aff" />
              <Text>{this.state.message} </Text>
            </>
          )}

          {this.state.buttonClick ? (
            <View>
              <Title style={{fontSize: 25, textAlign: 'center', marginTop: 10}}>
                <Text style={{fontFamily: 'roboto-bold'}}>
                  Estimation Result
                </Text>
              </Title>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>
                    <Text style={{fontFamily: 'roboto-regular'}}>Name</Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={{fontFamily: 'roboto-regular'}}>Per Hour</Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={{fontFamily: 'roboto-regular'}}> Hours</Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={{fontFamily: 'roboto-regular'}}>
                      Sub Total
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>
                {this.state.list.length > 0
                  ? this.state.list.map((item, i) => {
                      if (item.checked) {
                        return (
                          <DataTable.Row key={item.id}>
                            <DataTable.Cell>
                              <Text style={{fontFamily: 'roboto-regular'}}>
                                {item.name}
                              </Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                              <Text style={{fontFamily: 'roboto-regular'}}>
                                {item.timesheet_cost}
                              </Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                              <Text style={{fontFamily: 'roboto-regular'}}>
                                {item.work}
                              </Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                              <Text style={{fontFamily: 'roboto-regular'}}>
                                {item.work * item.timesheet_cost}
                              </Text>
                            </DataTable.Cell>
                          </DataTable.Row>
                        );
                      }
                    })
                  : null}
                <Divider />
                <Divider />
                <DataTable.Row>
                  <DataTable.Cell>
                    <Text style={styles.tableRow}>TOTAL</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableRow}>{this.state.per_hours}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableRow}>{this.state.hours}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableRow}>{this.state.total}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
                <DataTable.Row>
                  <DataTable.Cell>
                    <Text style={styles.tableRow}>Total Days</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableRow}>
                      {parseInt((this.state.hours / 8).toFixed(0))} Days
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </View>
          ) : null}
        </ScrollView>
      </>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  tableRow: {
    fontSize: 15,
    fontFamily: 'roboto-bold',
  },
});

export default App;
