import React, { Fragment } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Alert from "./components/layout/Alert";

// Redux
import { Provider } from "react-redux";
import store from "./store";


const App = () => (
  <Provider store={store}>
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path="/">
          <Landing />
        </Route>
        <section className="container">
          <Alert />
          <Switch>
            <Route path="/register">
              {" "}
              <Register />
            </Route>
            <Route path="/login">
              {" "}
              <Login />
            </Route>
          </Switch>
        </section>
      </Fragment>
    </Router>
  </Provider>
);

export default App;