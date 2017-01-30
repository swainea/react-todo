import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create ({
  container: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  }
})

class Footer extends Component {
  render() {
    return (
      <View>
        <View>
          <TouchableOpacity>
            <Text>All</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default Footer;
