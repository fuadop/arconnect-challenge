import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Login from './pages/Login';
import Todo from './pages/Todo';
import './App.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Todo} />
        <Route exact path="/login" component={Login} />
      </Switch>
    </Router>
  );
}

export default App;
