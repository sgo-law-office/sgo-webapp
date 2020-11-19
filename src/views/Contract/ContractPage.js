import React from "react";
import { Switch, Route } from "react-router-dom";
import ContractDetails from "./ContractDetails";
import ContractSearch from "./ContractSearch";


class ContractPage extends React.Component {

  render() {
    return (
      <div>
        <Switch>
          <Route path="/admin/contracts/create" component={() => (<ContractDetails />)}></Route>
          <Route path="/admin/contracts/:id" component={() => (<ContractDetails />)}></Route>
          <Route path="/admin/contracts" component={ContractSearch}></Route>
        </Switch>
      </div>
    );
  }
}

export default ContractPage;