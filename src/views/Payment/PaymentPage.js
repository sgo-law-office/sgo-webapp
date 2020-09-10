import React from "react";

import { Switch, Route, withRouter } from "react-router-dom";
//import CustomerSearch from "./CustomerSearch";
//import CustomerCreate from "./CustomerDetails";
//import { Fab } from "@material-ui/core";
//import AddIcon from '@material-ui/icons/Add';

class PaymentPage extends React.Component {

  render() {
    return (
      <div>
        {/* <Switch>
          <Route path="/admin/customers/create" component={() => (<CustomerCreate create={true} editing={true} />)}></Route>
          <Route path="/admin/customers/:id" component={() => (<CustomerCreate create={false} editing={false} />)}></Route>
          <Route path="/admin/customers" component={CustomerSearch}></Route>
        </Switch> */}
      </div>
    );
  }
}

export default withRouter(PaymentPage);