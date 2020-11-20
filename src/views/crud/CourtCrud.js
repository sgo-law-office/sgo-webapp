import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import Button from "components/CustomButtons/Button.js";
import DescriptionIcon from '@material-ui/icons/Description';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { fetchCourts } from "store/actions";
import CustomInput from "components/CustomInput/CustomInput";




import Axios from "axios";
import {
  authRequestInterceptor,
  authRequestInterceptorOnError,
  authResponseInterceptor,
  authResponseInterceptorOnError
} from "auth/interceptor";
import {
  loadingRequestInterceptor,
  loadingRequestInterceptorOnError,
  loadingResponseInterceptor,
  loadingResponseInterceptorOnError
} from "components/Loading/interceptor";




const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


class CourtCrud extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dialog: {
        display: false,
        data: {
          name: "",
          notes: ""
        }
      }
    };
  }

  componentDidMount() {
    this.props.fetchCourts();
  }

  createCourt() {
    if (!this.state.dialog.data.name || this.state.dialog.data.name.trim().length === 0) {
      return;
    }

    axios.post("/api/courts", this.state.dialog.data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.status == 201) {
          this.setState({
            dialog: {
              ...this.state.dialog,
              display: false
            }
          });
          this.props.fetchCourts();
        } else {
          this.setState({

          });
        }
      })
      .catch(err => {
        this.setState({

        });
      });
  }

  removeCourt(court) {
    axios.delete("/api/courts/" + court.id, {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.status == 200) {
          this.props.fetchCourts();
        } else {
          this.setState({

          });
        }
      })
      .catch(err => {
        this.setState({

        });
      });
  }

  render() {
    return (
      <div>


        <Dialog fullWidth maxWidth="sm" open={this.state.dialog.display} onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
          <DialogTitle>Adicionar vara</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>
                <GridItem xs={12}>
                  <CustomInput labelText="Nome" formControlProps={{ fullWidth: true }}
                    inputProps={{
                      value: this.state.dialog.data.name,
                      onChange: (e) => this.setState({ dialog: { ...this.state.dialog, data: { ...this.state.dialog.data, name: e.target.value } } })
                    }} />
                </GridItem>
                <GridItem xs={12}>
                  <CustomInput labelText="Observações" formControlProps={{ fullWidth: true }} textarea
                    inputProps={{
                      rows: 5,
                      value: this.state.dialog.data.notes,
                      onChange: (e) => this.setState({ dialog: { ...this.state.dialog, data: { ...this.state.dialog.data, notes: e.target.value } } })
                    }} />
                </GridItem>
              </GridContainer>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="success" autoFocus onClick={() => this.createCourt()}>Adicionar</Button>
            <Button color="transparent" autoFocus onClick={() => { this.setState({ dialog: { ...this.state.dialog, display: false, data: { name: "", notes: "" } } }) }}>Cancelar</Button>
          </DialogActions>
        </Dialog>




        <h3>Cadastros de Varas</h3>
        <p>&nbsp;</p>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardBody>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "40%", textAlign: "center" }}>Nome</TableCell>
                      <TableCell style={{ width: "40%", textAlign: "center" }}>Observações</TableCell>
                      <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.props.courts && this.props.courts.data && this.props.courts.data.length > 0 && this.props.courts.data.map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell style={{ width: "40%" }}>{prop.name}</TableCell>
                          <TableCell style={{ width: "40%" }}>{prop.notes}</TableCell>
                          <TableCell style={{ padding: "5px 16px", textAlign: "center" }}>
                            <Tooltip title="Remover vara" arrow>
                              <span>
                                <Button justIcon round color="transparent"
                                  onClick={e => this.removeCourt(prop)}>
                                  <DeleteOutlineIcon />

                                </Button>
                              </span>
                            </Tooltip>

                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {!(this.props.courts && this.props.courts.data && this.props.courts.data.length > 0) &&
                  <div style={{ width: "100%" }}>
                    <h4 style={{ textAlign: "center" }}>Nenhuma vara encontrada.</h4>
                    <span><ArrowDownwardIcon />Clique em <span style={{ fontWeight: "bold" }}>Adicionar vara</span> para criar um novo vara.</span>
                  </div>}


              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>

        <div style={{ margin: "15px 0" }}>
          <Button onClick={e => this.props.history.push("/admin/registrations")}>Voltar</Button>
          <Button color="success" onClick={e => this.setState({ dialog: { ...this.state.dialog, display: true, data: { name: "", notes: "" } } })}>Adicionar vara</Button>
        </div>

      </div>
    );
  }
}



const mapStateToProps = state => {
  return {
    courts: state.common.data.courts
  };
}

const mapDispatchToProps = dispatch => ({
  fetchCourts: (callback) => dispatch(fetchCourts(callback, true))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(CourtCrud));