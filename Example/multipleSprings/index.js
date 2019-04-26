import React, { Component, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { Easing } from 'react-native-reanimated';

const size = Dimensions.get('window');
const cols = 5;
const rows = size.height / (size.width / cols);

class Item extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      animationValue: new Animated.Value(0),
      currentValue: props.toggled,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.toggled !== this.state.currentValue) {
      const nextValue = nextProps.toggled ? 0 : 1;
      this.setState({ currentValue: nextProps.toggled });
      Animated.spring(this.state.animationValue, {
        toValue: nextValue,
        damping: 14,
        mass: 1,
        stiffness: 120,
      }).start();
    }
  }

  render() {
    const animateStyle = {
      transform: [
        {
          scale: this.state.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.75],
          }),
        },
      ],
      opacity: Animated.interpolate(this.state.animationValue, {
        inputRange: [0, 1],
        outputRange: [1, 0.5],
      }),
    };

    return (
      <Animated.View
        style={[
          {
            width: size.width / cols,
            height: size.height / rows,
            backgroundColor: this.props.index % 2 === 0 ? 'yellow' : 'aqua',
          },
          animateStyle,
        ]}
      />
    );
  }
}

export default (Example = () => {
  const [toggled, setToggled] = useState(1);

  const arr = Array.apply(null, { length: rows * cols }).map(
    Function.call,
    Number
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => setToggled(toggled === 1 ? 0 : 1)}>
      {arr.map((m, i) => (
        <Item toggled={toggled} index={i} key={i.toString()} />
      ))}
    </TouchableOpacity>
  );
});

Example.navigationOptions = {
  title: 'Multiple Springs Example',
};

const BOX_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderColor: '#F5FCFF',
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: BOX_SIZE / 2,
  },
});
