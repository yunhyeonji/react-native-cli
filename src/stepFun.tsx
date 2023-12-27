import React from 'react';
import { Button, ImageBackground, Platform, SafeAreaView, Text, StyleSheet, View } from 'react-native';
import {
  isSensorWorking,
  isStepCountingSupported,
  parseStepData,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  type ParsedStepCountData,
} from '@dongminyu/react-native-step-counter';
import { getBodySensorPermission, getStepCounterPermission } from './permission';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './screens/RootStack';

type StepFunScreenRouteProp = RouteProp<RootStackParamList, 'STEP'>;

type SensorType<T = typeof Platform.OS> = T extends 'ios'
  ? 'CMPedometer'
  : T extends 'android'
  ? 'Step Counter' | 'Accelerometer'
  : 'NONE';

type SensorName = SensorType<Platform['OS']>;

/* Setting the initial state of the additionalInfo object. */
const initState = {
  dailyGoal: '0/10000 steps',
  stepsString: '0 steps',
  calories: '0.0 kCal',
  distance: '0.0 m',
};

type AdditionalInfo = Partial<ParsedStepCountData>;

/**
 * This module represents the root component of the app.
 * 1. It imports the necessary components and libraries.
 * 2. It defines the initial state of the additionalInfo state.
 * 3. It defines the functions that will be used in the app.
 * 4. It uses the useState hook to define the states that will be used in the app.
 * 5. It uses the useEffect hook to run the isPedometerSupported function when the component mounts.
 * 6. It uses the useEffect hook to call the startStepCounter function when the component mounts.
 * 7. It returns the JSX code for the app.
 *
 * @module App
 * @requires react
 * @requires react-native
 * @requires react-native-permissions
 * @requires react-native-svg
 * @requires react-native-reanimated
 * @requires react-native-gesture-handler
 * @requires react-native-circular-progress-indicator
 * @returns {React.ReactComponentElement} - Returns Application Component.
 * @example
 */
export default function StepFun(): JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<StepFunScreenRouteProp>();
  const { webE } = route.params || { webE: false };

  const [loaded, setLoaded] = React.useState(false);
  const [supported, setSupported] = React.useState(false);
  const [granted, setGranted] = React.useState(false);
  const [sensorType, setSensorType] = React.useState<SensorName>('NONE');
  const [stepCount, setStepCount] = React.useState(0);
  const [additionalInfo, setAdditionalInfo] = React.useState<AdditionalInfo>(initState);
  const [pastData, setPastData] = React.useState<AdditionalInfo>(initState);
  const [pause, setPause] = React.useState(false);

  /**
   * Get user's motion permission and check pedometer is available.
   * This function checks if the step counting is supported by the device
   * and if the user has granted the app the permission to use it.
   * It sets the state variables 'granted' and 'supported' accordingly.
   */
  const isPedometerSupported = () => {
    isStepCountingSupported().then(result => {
      setGranted(result.granted === true);
      setSupported(result.supported === true);
    });
  };

  /**
   * It starts the step counter and sets the sensor type, step count, and additional info.
   * The function startStepCounter is called when the user clicks the "Start" button.
   * It starts the step counter.
   */
  const startStepCounter = () => {
    console.log('pastData =>> ', pastData);
    startStepCounterUpdate(new Date(), data => {
      setSensorType(data.counterType as SensorName);
      console.log(data);
      const parsedData = parseStepData(data);
      parsedData.steps += pastData?.steps ? pastData?.steps : 0;
      parsedData.calories = (parsedData.steps * 0.045).toFixed(3).toString() + 'kCal';
      parsedData.distance = (parsedData.steps * 0.762).toFixed(3).toString() + 'm';
      setAdditionalInfo({
        ...parsedData,
      });
    });
    console.log(additionalInfo);
    setLoaded(true);
  };

  /**
   * It sets the state of the additionalInfo object to its initial state, stops the step counter update,
   * and sets the loaded state to false.
   * This function is used to stop the step counter.
   */
  const stopStepCounter = () => {
    // setAdditionalInfo(initState);
    stopStepCounterUpdate();
    console.log('additionalInfo =>> ', additionalInfo);
    setLoaded(false);
  };

  /**
   * If the sensor is working, stop it. If it's not working,
   * Get permission for the other sensor and start it.
   * This function is used to force the use of another sensor.
   */
  const forceUseAnotherSensor = () => {
    if (isSensorWorking) {
      stopStepCounter();
    } else {
      if (sensorType === 'Step Counter') {
        getBodySensorPermission().then(setGranted);
      } else {
        getStepCounterPermission().then(setGranted);
      }
    }
    startStepCounter();
  };

  /**
   * A hook that runs when the component mounts. It calls the isPedometerSupported function
   * and returns a function that stops the step counter.
   * This effect runs when the component is first mounted
   * and then runs again when the `count` variable changes.
   */
  React.useEffect(() => {
    isPedometerSupported();
    return () => {
      stopStepCounter();
    };
  }, []);

  /**
   * A hook that runs when the component mounts.
   * It calls the isPedometerSupported function and returns a
   * function that stops the step counter.
   */
  React.useEffect(() => {
    // console.debug(`🚀 stepCounter ${supported ? '' : 'not'} supported`);
    // console.debug(`🚀 user ${granted ? 'granted' : 'denied'} stepCounter`);
    if (supported && granted) {
      startStepCounter();
    } else {
      stopStepCounter();
    }
  }, [granted, supported]);

  return (
    <>
      <View style={styles.container}>
        <Text>걸음수 : {additionalInfo.steps === undefined ? '0 steps' : additionalInfo.steps + ' steps'} </Text>
        <Text>걸은 거리 : {additionalInfo.distance === '0 m' ? '' : additionalInfo.distance}</Text>
        <Text>소모된 칼로리 : {additionalInfo.calories === '0 kCal' ? '' : additionalInfo.calories}</Text>
      </View>
      <View style={styles.button}>
        <Button
          title="걷기 종료"
          onPress={() => {
            stopStepCounter();
            setPastData(initState);
            navigation.navigate('WebView', { params: additionalInfo });
          }}
        />
        {pause ? (
          <Button
            title="다시 걷기"
            onPress={() => {
              setPause(false);
              startStepCounter();
            }}
          />
        ) : (
          <Button
            title="걷기 일시정지"
            onPress={() => {
              setPause(true);
              stopStepCounter();
              setPastData(additionalInfo);
            }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'light-blue',
  },
  indicator: {
    marginTop: 10,
    marginBottom: 20,
  },
  bGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    display: 'flex',
    marginVertical: 8,
  },
  backgroundImage: {
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
