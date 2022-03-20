import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Dashboard from './Screens/DashboardScreen';
import ChatScreen from './Screens/ChatScreen';
import Login from './Screens/LoginScreen';
import SignUp from './Screens/SignUpScreen';

const AuthStack = createStackNavigator(
  {
    Login: Login,
    SignUp: SignUp,
  },
  {
    headerMode: 'none',
    initialRouteName: 'Login',
  },
);
const DashboardStack = createStackNavigator(
  {
    Dashboard: Dashboard,
    Chat:ChatScreen
  },
  {
    headerMode: 'none',
    initialRouteName: 'Dashboard',
  },
);

const App = createSwitchNavigator(
  {
    Auth: AuthStack,
    Dashboard: DashboardStack,
  },
  {
    initialRouteName: 'Auth',
  },
);

export default createAppContainer(App);
