import React, { Component, useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { Easing } from 'react-native-reanimated';

const size = Dimensions.get('window');
const cols = 5;
const rows = size.height / (size.width / cols);

const AnimationContext = React.createContext();

const { interpolate } = Animated;

class Item extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      animationValue: new Animated.Value(0),
      currentValue: props.toggled,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { currentValue, animationValue } = this.state;
    if (nextProps.toggled !== currentValue) {
      const { toggled } = nextProps;
      const startValue = toggled ? 1 : 0;
      const endValue = toggled ? 0 : 1;

      const nextAnimationValue = new Animated.Value(startValue);
      this.context.onAnimation({
        animationValue: nextAnimationValue,
        toValue: endValue,
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

Item.contextType = AnimationContext;

export default (Example = () => {
  const [toggled, setToggled] = useState(1);
  const animations = useRef([]);
  const arr = Array.apply(null, { length: rows * cols }).map(
    Function.call,
    Number
  );

  const onAnimation = value => {
    animations.current.push(value);
  };

  useEffect(() => {
    if (animations.current.length > 0) {
      animations.current.forEach(a => {
        Animated.spring(a.animationValue, {
          toValue: a.toValue,
          damping: 14,
          mass: 1,
          stiffness: 120,
        }).start();
      });
      animations.current = [];
    }
  });

  return (
    <AnimationContext.Provider value={{ onAnimation }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.container}
        onPress={() => setToggled(toggled === 1 ? 0 : 1)}>
        {arr.map((m, i) => (
          <Item toggled={toggled} index={i} key={i.toString()} />
        ))}
      </TouchableOpacity>
    </AnimationContext.Provider>
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
