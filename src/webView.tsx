import React, { useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View, StyleSheet, Button, BackHandler, Platform } from 'react-native';
import { webviewUri } from './WebViewUri';
import Permission from './common/Permission';
import {
  isSensorWorking,
  isStepCountingSupported,
  parseStepData,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  type ParsedStepCountData,
} from '@dongminyu/react-native-step-counter';

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

const MyWebView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [stepState, setStepState] = useState(false);
  // const [check, setCheck] = useState(false);

  const [loaded, setLoaded] = React.useState(false);
  const [supported, setSupported] = React.useState(false);
  const [granted, setGranted] = React.useState(false);
  const [sensorType, setSensorType] = React.useState<SensorName>('NONE');
  const [stepCount, setStepCount] = React.useState(0);
  const [additionalInfo, setAdditionalInfo] = React.useState<AdditionalInfo>(initState);
  const [pastData, setPastData] = React.useState<AdditionalInfo>(initState);
  const [pause, setPause] = React.useState(true);

  // 웹뷰로 메시지 전송
  const sendMessageToWeb = (message: string) => {
    console.log(stepState);
    webViewRef.current?.postMessage(message);
  };

  // WebView에서 메시지를 받았을 때의 처리
  const onWebviewMessage = (event: WebViewMessageEvent) => {
    console.log('WebView에서 메시지 수신:', event.nativeEvent.data);
  };

  // 웹뷰의 네비게이션 상태 변경시 호출
  const onNavigationStateChange = (navState: { canGoBack: boolean }) => {
    setCanGoBack(navState.canGoBack);
  };

  // 뒤로가기 버튼 핸들러 등록 및 제거
  React.useEffect(() => {
    // 웹뷰에서 뒤로가기 동작
    const handleBackButton = () => {
      if (webViewRef.current && canGoBack) {
        webViewRef.current.goBack();
        return true;
      } else {
        // 앱 종료
        return false;
      }
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [canGoBack]);

  const isPedometerSupported = () => {
    isStepCountingSupported().then(result => {
      setGranted(result.granted === true);
      setSupported(result.supported === true);
    });
  };

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

  const stopStepCounter = () => {
    stopStepCounterUpdate();
    console.log('additionalInfo =>> ', additionalInfo);
    setLoaded(false);
  };

  React.useEffect(() => {
    isPedometerSupported();
    return () => {
      stopStepCounter();
    };
  }, []);

  // 권한이 허용되었을 때 실행되는 함수
  const handlePermissionGranted = () => {
    console.log('권한이 허용되었습니다.');
  };

  return (
    <>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: webviewUri }}
          onMessage={onWebviewMessage}
          onNavigationStateChange={onNavigationStateChange}
        />
        <Permission onPermissionGranted={handlePermissionGranted} />
      </View>
      <View style={styles.bGroup}>
        <Button title="START" onPress={startStepCounter} />
        <Button title="STOP" onPress={stopStepCounter} />
      </View>
      {/* <View>
        <Button
          title="걷기 종료"
          onPress={() => {
            stopStepCounter();
            setPastData(initState);
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
      </View> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  result: {
    flex: 0.2,
  },
  bGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    display: 'flex',
    marginVertical: 8,
  },
});

export default MyWebView;
