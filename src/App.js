import React, { Component } from "react";
import "./App.css";
import Login from "./components/login-page";
import NewUser from "./components/new_user";
import { BrowserRouter, Switch, Route } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/new_user" exact component={NewUser} />
            <Route path="" exact />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
