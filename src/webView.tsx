import React, { useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View, StyleSheet, Button, Text } from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './screens/RootStack';
import { check } from 'react-native-permissions';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import StepFun from './stepFun';

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

const MyWebView: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WebViewScreenRouteProp>();
  const { params } = route.params || { params: null };

  const webViewRef = useRef<WebView>(null);
  const [stepState, setStepState] = useState(false);
  const [check, setCheck] = useState(false);
  const sendMessageToWeb = (message: string) => {
    console.log(stepState);
    // 웹뷰로 메시지 전송
    webViewRef.current?.postMessage(message);
  };
  useEffect(() => {
    if (params) {
      sendMessageToWeb('걸음수' + JSON.stringify(params));
      setCheck(false);
    }
  }, [params]);

  const onWebviewMessage = (event: WebViewMessageEvent) => {
    // WebView에서 메시지를 받았을 때의 처리
    console.log('WebView에서 메시지 수신:', event.nativeEvent.data);
    if (event.nativeEvent.data === 'startWalking') {
      // '걷기 시작' 메시지를 받으면 App 컴포넌트에 메시지를 전달하고 stepState를 변경
      setStepState(true);
      navigation.navigate('STEP', { webE: true });
    } else if (event.nativeEvent.data === 'stopWalking') {
      // '걷기 종료' 메시지를 받으면 App 컴포넌트에 메시지를 전달하고 stepState를 변경
      setStepState(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Button title="메시지 전송" onPress={() => sendMessageToWeb('네이티브')} />
        <WebView source={{ uri: 'http://reactwebapp.dothome.co.kr/webapp/' }} onMessage={onWebviewMessage} />
        {/* <WebView ref={webViewRef} source={{ uri: 'http://172.20.14.69:3000/webapp/' }} onMessage={onWebviewMessage} /> */}
        {/* <WebView ref={webViewRef} source={{ uri: 'http://172.20.14.69:9900' }} onMessage={onWebviewMessage} /> */}
      </View>
      <View style={styles.result}>
        {check ? (
          <StepFun />
        ) : (
          <Button
            title={'걸음수 측정을 시작합니다.'}
            onPress={() => {
              setCheck(true);
            }}
          />
        )}
      </View>
      {/* <StepFun webE={stepState} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.8,
  },
  result: {
    flex: 0.2,
  },
});

export default MyWebView;
