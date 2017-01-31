import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, ListView, Keyboard, ActivityIndicator, AsyncStorage } from 'react-native';
import Header from './header';
import Footer from './footer';
import Row from './row';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    ...Platform.select({
      ios: { paddingTop: 30 }
    })
  },
  content: {
    flex: 1
  },
  seperator : {
    borderWidth: 1,
    borderColor: '#f5f5f5'
  },
  list : {
    backgroundColor: '#fff'
  },
  loading: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,.2)"
  }
})

const filterItems = (filter, items) => {
  return items.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return item.complete;
    if (filter === "ACTIVE") return !item.complete;
  })
}

class App extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      allComplete: false,
      loading: true,
      filter: "ALL",
      value: '',
      items: [],
      dataSource: ds.cloneWithRows([])
    }
    this.handleFilter = this.handleFilter.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleToggleComplete = this.handleToggleComplete.bind(this);
    this.setSource = this.setSource.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleToggleAllComplete = this.handleToggleAllComplete.bind(this);
    this.handleClearComplete = this.handleClearComplete.bind(this);
    this.handleUpdateText = this.handleUpdateText.bind(this);
    this.handleToggleEdit = this.handleToggleEdit.bind(this);
  }

  componentWillMount() {
    AsyncStorage.getItem("items").then((json) => {
      try {
        const items = JSON.parse(json);
        // once mounted loading is false
        this.setSource(items, items, { loading: false });
      } catch(e) {
        this.setState({
          loading: false
        })
      }
    })
  }

  setSource(items, itemsDatasource, otherState = {}) {
    this.setState({
      items,
      dataSource: this.state.dataSource.cloneWithRows(itemsDatasource),
      ...otherState
    })
    AsyncStorage.setItem("items", JSON.stringify(items));
  }

  handleFilter(filter) {
    this.setSource(this.state.items, filterItems(filter, this.state.items), { filter })
  }

  handleAddItem(){
    // do not add empty items to the array
    if(!this.state.value) return;
    const newItems = [
      // spread the old items into new array
      ...this.state.items,
      // add a new object
      {
        key: Date.now(),
        text: this.state.value,
        complete: false
      }
    ]
    // takes in new items and clears the text imput
    this.setSource(newItems, filterItems(this.state.filter, newItems), {value: ''})
  }

  handleToggleAllComplete() {
    const complete = !this.state.allComplete;
    const newItems = this.state.items.map((item) => ({
      ...item,
      complete
    }))
    this.setSource(newItems, filterItems(this.state.filter, newItems), { allComplete: complete })
  }

  handleUpdateText(key,text) {
    const newItems = this.state.items.map((item) => {
      if (item.key !== key) return item;
      return {
        ...item,
        text
      }
    })
    this.setSource(newItems, filterItems(this.state.filter, newItems));
  }

  handleToggleEdit(key, editing) {
    const newItems = this.state.items.map((item) => {
      if (item.key !== key) return item;
      return {
        ...item,
        editing
      }
    })
    this.setSource(newItems, filterItems(this.state.filter, newItems));
  }

  handleRemoveItem(key) {
    const newItems = this.state.items.filter((item) => {
      return item.key !== key
    })
    this.setSource(newItems, filterItems(this.state.filter, newItems))
  }

  handleClearComplete() {
    const newItems = filterItems("ACTIVE", this.state.items);
    this.setSource(newItems, filterItems(this.state.filter, newItems));
  }

  handleToggleComplete(key, complete) {
    const newItems = this.state.items.map((item) => {
      if (item.key !== key) return item;
      return {
        ...item,
        complete
      }
    })
    this.setSource(newItems, filterItems(this.state.filter, newItems));
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          value={this.state.value}
          onAddItem={this.handleAddItem}
          // passing in value of text to set state
          onChange={(value) => this.setState({value})}
          onToggleAllComplete={this.handleToggleAllComplete}
        />
        <View style={styles.content}>
          <ListView
            style={styles.list}
            enableEmptySections
            dataSource={this.state.dataSource}
            onScroll={() => Keyboard.dismiss}
            renderRow={({ key, ...value }) => {
              return (
                <Row
                  key={key}
                  onComplete={(complete) => this.handleToggleComplete(key, complete)}
                  {...value}
                  onRemove={() => this.handleRemoveItem(key)}
                  onUpdate={(text) => this.handleUpdateText(key,text)}
                  onToggleEdit={(editing) => this.handleToggleEdit(key,editing)}
                />
              )
            }}
            renderSeperator={(sectionId, rowId) => {
              return <View key={rowId} style={styles.seperator} />
            }}
          />
        </View>
        <Footer
          count={filterItems("ACTIVE", this.state.items).length}
          onFilter={this.handleFilter}
          filter={this.state.filter}
          onClearComplete={this.handleClearComplete}
        />
        {this.state.loading && <View style={styles.loading}>
          <ActivityIndicator
            animating
            size="large"
          />
        </View>}
      </View>
    );
  }
}

export default App;
