import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import PersonIcon from '@material-ui/icons/Person';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import avatar from "assets/img/faces/marc.jpg";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { connect } from "react-redux";


const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

const useStyles = makeStyles(styles);

function UserProfile(props) {
  const classes = useStyles();
  return (
    <div>
      <GridContainer>
        {/* <GridItem xs={12} sm={12} md={8}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Edit Profile</h4>
              <p className={classes.cardCategoryWhite}>Complete your profile</p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={5}>
                  <CustomInput
                    labelText="Company (disabled)"
                    id="company-disabled"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      disabled: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    labelText="Username"
                    id="username"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Email address"
                    id="email-address"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    labelText="First Name"
                    id="first-name"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    labelText="Last Name"
                    id="last-name"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="City"
                    id="city"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Country"
                    id="country"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Postal Code"
                    id="postal-code"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <InputLabel style={{ color: "#AAAAAA" }}>About me</InputLabel>
                  <CustomInput
                    labelText="Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo."
                    id="about-me"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      multiline: true,
                      rows: 5
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter>
              <Button color="primary">Update Profile</Button>
            </CardFooter>
          </Card>
        </GridItem> */}
        <GridItem md={12} lg={3}></GridItem>
        <GridItem xs={12} sm={12} md={12} lg={6}>
          <Card profile>
            <CardAvatar profile style={{backgroundColor: "white"}}>
              <PersonIcon style={{
                  width: "130px",
                  height: "130px",
                  opacity: "0.8",
                  padding: "22px 0 0 0",
                  backgroundColor: "#eeeeee"
                }}/>
            </CardAvatar>
            <CardBody profile>
              <h4 className={classes.cardTitle}>{props.account.name}</h4>
              <h6 className={classes.cardCategory}>{props.account.mail}</h6>
              <div className={classes.description}>
                
                <GridContainer>
                  
                  <GridItem sm={6} style={{textAlign: "right"}}>
                    <p>Unidade</p>
                  </GridItem>

                  <GridItem sm={6} style={{textAlign: "left", fontWeight: "bold"}}>
                    <p>{props.account.companyName}</p>
                  </GridItem>

                  <GridItem sm={6} style={{textAlign: "right"}}>
                    <p>Departamento</p>
                  </GridItem>

                  <GridItem sm={6} style={{textAlign: "left", fontWeight: "bold"}}>
                    <p>{props.account.department}</p>
                  </GridItem>

                  {/* <GridItem sm={6}>
                    <CustomInput
                      labelText="Unidade"
                      id="company"
                      inputProps={{
                        value: "teste",
                        readonly: true
                      }}
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                  
                  <GridItem sm={6}>
                    <CustomInput
                      labelText="Departamento"
                      id="department"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem> */}

                </GridContainer>
              </div>
              {/* <Button color="primary" round>
                Follow
              </Button> */}
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}


const mapStateToProps = state => {
  return {
      account: state.account
  };
}


export default connect(mapStateToProps)(UserProfile);
