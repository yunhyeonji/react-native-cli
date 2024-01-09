import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
import MyWebView from './src/webView';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
