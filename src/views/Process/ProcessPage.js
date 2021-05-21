import React from "react";
import { Switch, Route } from "react-router-dom";
import ProcessCreate from "./ProcessCreate";
import ProcessDetails from "./ProcessDetails";
import ProcessSearch from "./ProcessSearch";

class ProcessPage extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/admin/processes/create" component={ProcessCreate} ></Route>
          <Route path="/admin/processes/:id" component={ProcessDetails} ></Route>
          <Route path="/admin/processes" component={ProcessSearch}></Route>
        </Switch>
      </div>
    );
  }
}

export default ProcessPage;
