import React from "react";
import { connect } from 'react-redux';

import { Switch, Route, Redirect, withRouter } from "react-router-dom";
// creates a beautiful scrollbar

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";

import bgImage from "assets/img/sidebar-2.jpg";

import { AzureAD, AuthenticationState } from 'react-aad-msal';
import { authProvider } from '../auth/auth-provider';

import LoginPage from '../views/Login/LoginPage';
import logo from "assets/img/sgo/sgo-logo-max.png";
import { store } from "store/store";
import Setup from "views/Setup/Setup";

import { fetchGraphUserData, fetchAccount } from "store/actions";
import GeneralNotification from "../components/Notifications/GeneralNotification";

let ps;
let ack;

const switchRoutes = (
  <Switch>
    <Redirect from="/admin" exact to="/admin/home" />

    {routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      return null;
    })}

  </Switch>
);

const useStyles = makeStyles(styles);

function Admin({ ...rest }) {

  // styles
  const classes = useStyles();

  // states and functions
  const [image] = React.useState(bgImage);
  const [color] = React.useState("blue");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };


  return (
    <div className={classes.wrapper}>

      <GeneralNotification />

      <AzureAD provider={authProvider} reduxStore={store}>
        {
          ({ login, logout, authenticationState, error, accountInfo }) => {
            switch (authenticationState) {

              case AuthenticationState.Authenticated:
                if (rest.jwt && !rest.account) {
                  if (!ack) {
                    rest.getAccount(() => {
                      rest.fetchGraphUserData();
                    });
                    ack = true;
                  }
                  if (rest.graph.account) {
                    return (<Setup></Setup>);
                  }
                } else {
                  return (
                    <div>
                      <Sidebar
                        routes={routes}
                        logoText={"SGO Advogados"}
                        // logo={logo}
                        image={image}
                        handleDrawerToggle={handleDrawerToggle}
                        open={mobileOpen}
                        color={color}
                        {...rest}
                      />
                      <div className={classes.mainPanel}>
                        <Navbar
                          routes={routes}
                          handleDrawerToggle={handleDrawerToggle}
                          logout={logout}
                          {...rest}
                        />
                        <div className={classes.content} style={{ minHeight: "calc(100vh - 224px)" }}>
                          <div className={classes.container}>{switchRoutes}</div>
                        </div>

                        <Footer />
                      </div>
                    </div>
                  );
                }
                return <img style={{ height: "60px" }} src="/load-small.gif" alt="Carregando..." />;

              case AuthenticationState.Unauthenticated:
                return (
                  <LoginPage login={login}>Unauthenticated</LoginPage>
                );

              case AuthenticationState.InProgress:
                return (
                  <LoginPage login={login} loading={true}>InProgress</LoginPage>
                );
              default:
                return (
                  <LoginPage login={login} loading={true}>Default</LoginPage>
                );
            }
          }
        }
      </AzureAD>
    </div>
  );
}


const mapStateToProps = state => {
  return {
    jwt: state.jwt,
    account: state.account,
    graph: {
      account: state.graph.account
    }
  };
}

const mapDispatchToProps = dispatch => ({
  fetchGraphUserData: () => dispatch(fetchGraphUserData()),
  getAccount: (fallback) => dispatch(fetchAccount(fallback))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(Admin));
