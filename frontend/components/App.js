import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import 'semantic-ui-css/semantic.min.css';
import '../css/base.scss';
import ToggleSwitch from './ToggleSwitch';


export default function App() {
  return (
    <Router>
      <Switch>
        <Route path='/:termId/:query'>
          <Results />
        </Route>
        <Route path='/:termId?'>
          <ToggleSwitch />
        </Route>
      </Switch>
      <Route
        path='/'
        render={ ({ location }) => {
          if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
          }
          return null;
        } }
      />
    </Router>
  );
}
