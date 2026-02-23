import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import GamePage from './GamePage';
import AdminPage from './AdminPage';
import ProfilePage from './ProfilePage';
import Shop from './Shop';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/game" component={GamePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/shop" component={Shop} />
      </Switch>
    </Router>
  );
};

export default App;