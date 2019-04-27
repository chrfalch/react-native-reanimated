import React, { Component, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { Easing } from 'react-native-reanimated';

const size = Dimensions.get('window');
const cols = 5;
const rows = size.height / (size.width / cols);

const {
  set,
  cond,
  startClock,
  stopClock,
  clockRunning,
  block,
  debug,
  spring,
  timing,
  Value,
  Clock,
  interpolate,
} = Animated;

function runTiming(value, dest) {
  const clock = new Clock();
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: 330,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease),
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, dest),
      startClock(clock),
    ]),
    timing(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ]);
}

function runSpring(value, dest, config) {
  const clock = new Clock();
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const defaultConfig = {
    toValue: new Value(0),

    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    ...config,
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.velocity, 0),
      set(defaultConfig.toValue, dest),
      startClock(clock),
    ]),
    spring(clock, state, defaultConfig),
    cond(state.finished, debug('stop clock', stopClock(clock))),
    state.position,
  ]);
}

class Item extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      animationValue: new Animated.Value(0),
      currentValue: props.toggled,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { currentValue } = this.state;
    if (nextProps.toggled !== currentValue) {
      const { toggled } = nextProps;
      const startValue = toggled ? 1 : 0;
      const nextValue = toggled ? 0 : 1;
      const nextAnimationValue = runTiming(startValue, nextValue, {
        damping: 14,
        mass: 1,
        stiffness: 120,
      });
      this.setState({
        currentValue: toggled,
        animationValue: nextAnimationValue,
      });
    }
  }

  render() {
    const { animationValue } = this.state;
    const animateStyle = {
      transform: [
        {
          scale: interpolate(animationValue, {
            inputRange: [0, 1],
            outputRange: [1, 0.75],
          }),
        },
      ],
      opacity: interpolate(animationValue, {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
});
