import { AppRegistry } from 'react-native';
import App from './src/App';
import MyWebView from './src/webView';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => MyWebView);
