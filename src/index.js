import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { store } from "store/store";

// core components
import Admin from "layouts/Admin.js";

import "assets/css/material-dashboard-react.css?v=1.9.0";
import { LinearProgress } from "@material-ui/core";

ReactDOM.render(
  <BrowserRouter>
    <LinearProgress className="loading-progress-bar" variant="indeterminate" />
    <Provider store={store}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Redirect from="/" to="/admin/home" />
      </Switch>
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);
