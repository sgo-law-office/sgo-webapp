import React from "react";
import { Switch, Route } from "react-router-dom";
import AttendanceDetails from "./AttendanceDetails";
import AttendanceSearch from "./AttendanceSearch";

class AttendancePage extends React.Component {

  render() {
    return (
      <div>
        <Switch>
          <Route path="/admin/attendances/create" component={() => (<AttendanceDetails create={true} editing={true} />)}></Route>
          <Route path="/admin/attendances/:id" component={() => (<AttendanceDetails create={false} editing={false} />)}></Route>
          <Route path="/admin/attendances" component={AttendanceSearch}></Route>
        </Switch>
      </div>
    );
  }
}

export default AttendancePage;