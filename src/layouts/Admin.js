import React from "react";
import { connect } from 'react-redux';

import { Switch, Route, Redirect, withRouter } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
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

  // ref to help us initialize PerfectScrollbar on windows devices
  const mainPanel = React.createRef();

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

  // initialize and destroy the PerfectScrollbar plugin
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false
      });
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("resize", resizeFunction);

    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
      window.removeEventListener("resize", resizeFunction);
    };

  }, [mainPanel]);

  return (
    <div className={classes.wrapper}>
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
                      <div className={classes.mainPanel} ref={mainPanel}>
                        <Navbar
                          routes={routes}
                          handleDrawerToggle={handleDrawerToggle}
                          logout={logout}
                          {...rest}
                        />
                        <div className={classes.content} style={{ minHeight: "calc(100vh - 224px)"}}>
                          <div className={classes.container}>{switchRoutes}</div>
                        </div>

                        <Footer />
                      </div>
                    </div>
                  );
                }

              case AuthenticationState.Unauthenticated:
                return (
                  <LoginPage login={login}></LoginPage>
                );

              case AuthenticationState.InProgress:
                return (
                  <LoginPage login={login} loading={true}></LoginPage>
                );
              default:
                return (
                  <LoginPage login={login} loading={true}></LoginPage>
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
