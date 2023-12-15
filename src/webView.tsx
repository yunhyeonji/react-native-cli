import React, { useRef, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View, StyleSheet, Button, Text } from 'react-native';
import App, { test } from './App';

const MyWebView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [stepState, setStepState] = useState(false);
  const sendMessageToWeb = (message: string) => {
    console.log(stepState);
    // 웹뷰로 메시지 전송
    webViewRef.current?.postMessage(message);
  };

  const onWebviewMessage = (event: WebViewMessageEvent) => {
    // WebView에서 메시지를 받았을 때의 처리
    console.log('WebView에서 메시지 수신:', event.nativeEvent.data);
    if (event.nativeEvent.data === 'startWalking') {
      // '걷기 시작' 메시지를 받으면 App 컴포넌트에 메시지를 전달하고 stepState를 변경
      setStepState(true);
    } else if (event.nativeEvent.data === 'stopWalking') {
      // '걷기 종료' 메시지를 받으면 App 컴포넌트에 메시지를 전달하고 stepState를 변경
      setStepState(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text>{test}</Text>
        <Button title="메시지 전송" onPress={() => sendMessageToWeb('네이티브')} />
        {/* <WebView source={{ uri: 'http://reactwebapp.dothome.co.kr/webapp/' }} onMessage={onWebviewMessage} /> */}
        <WebView ref={webViewRef} source={{ uri: 'http://172.20.14.69:3000/webapp/' }} onMessage={onWebviewMessage} />
      </View>
      <App webE={stepState} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
  },
});

export default MyWebView;
