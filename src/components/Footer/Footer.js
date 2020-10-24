/*eslint-disable*/
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
// core components
import styles from "assets/jss/material-dashboard-react/components/footerStyle.js";
import { withRouter } from "react-router-dom";

const useStyles = makeStyles(styles);

export default withRouter(function Footer(props) {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.right}>
          <List className={classes.list}>
            {/* <ListItem className={classes.inlineBlock}>
              <a href="#home" className={classes.block}>
                Home
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a href="#company" className={classes.block}>
                Company
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a href="#portfolio" className={classes.block}>
                Portfolio
              </a>
            </ListItem> */}
            <ListItem className={classes.inlineBlock}>
              <a href="#" className={classes.block} onClick={(e) => { e.preventDefault(); props.history.push('/admin/help') }}>
                Ajuda
              </a>
            </ListItem>
            {/* <ListItem className={classes.inlineBlock}>
              <span>&copy; {1900 + new Date().getYear()}{" "} SGO Advogados </span>
            </ListItem> */}
          </List>
        </div>

      </div>
    </footer>
  );
})