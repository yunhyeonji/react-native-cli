import React from 'react';
import { Button, Text, View } from 'react-native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import StepFun from '../stepFun';
import MyWebView from '../webView';

export type RootStackParamList = {
  Home: undefined;
  Detail: {
    id: number;
  };
  STEP: undefined;
  WebView: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

function HomeScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const onPress = () => {
    // navigation.navigate('Detail', { id: 1 });
    navigation.navigate('WebView');
  };

  return (
    <View>
      <Button title="WEB VIEW" onPress={onPress} />
    </View>
  );
}

// 수정
function DetailScreen() {
  const { params } = useRoute<DetailScreenRouteProp>();
  return (
    <View>
      <Text>Detail {params.id}</Text>
    </View>
  );
}

function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen component={HomeScreen} name="Home" />
      <Stack.Screen component={DetailScreen} name="Detail" />
      <Stack.Screen component={StepFun} name="STEP" />
      <Stack.Screen component={MyWebView} name="WebView" />
    </Stack.Navigator>
  );
}

export default RootStack;
