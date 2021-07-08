import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import Moment from "react-moment";
import moment from "moment";

import CustomInput from "components/CustomInput/CustomInput";
import Notification from "components/Notifications/Notification";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Hidden,
  IconButton,
} from "@material-ui/core";
import Button from "components/CustomButtons/Button";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import Tooltip from "@material-ui/core/Tooltip";

import Axios from "axios";
import {
  authRequestInterceptor,
  authRequestInterceptorOnError,
  authResponseInterceptor,
  authResponseInterceptorOnError,
} from "auth/interceptor";
import { loadingRequestInterceptor } from "components/Loading/interceptor";
import { loadingRequestInterceptorOnError } from "components/Loading/interceptor";
import { loadingResponseInterceptor } from "components/Loading/interceptor";
import { loadingResponseInterceptorOnError } from "components/Loading/interceptor";

const axios = Axios.create();
axios.interceptors.request.use(
  authRequestInterceptor,
  authRequestInterceptorOnError
);
axios.interceptors.response.use(
  authResponseInterceptor,
  authResponseInterceptorOnError
);

axios.interceptors.request.use(
  loadingRequestInterceptor,
  loadingRequestInterceptorOnError
);
axios.interceptors.response.use(
  loadingResponseInterceptor,
  loadingResponseInterceptorOnError
);

class ProcessCounterpartsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processId: this.props.processId,
      counterparts: [].concat(this.props.counterpartsData || []),

      touched: false,

      dialog: {
        display: false,
        title: "",
        message: "",
        actions: []
      },

      notification: {
        display: false,
        severity: "",
        message: "",
      },
    };
  }

  getEmptyCounterpartData() {
    return {
      name: "",
      mail: "",
      birthDate: "",
      deathDate: "",
      idCard: "",
      taxPayerIdentifier: "",
      phones: [],
      addresses: [],
      notes: ""
    };
  }


  loadProcessHistory() {
    if (this.props.loadCallback) {
      this.props.loadCallback();
    }
  }

  createProcessHistory() {
    if (this.isValidToCreate(this.state.add.data)) {
      axios.post("/api/processes/" + this.props.processId + ":history",
        { ...this.state.add.data },
        {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 201) {
            this.setState({
              add: {
                ...this.state.add,
                display: false,
              },
            });
            this.loadProcessHistory();

          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao criar registro, tente novamente.",
              },
            });
          }
        })
        .catch((err) => {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao criar registro, tente novamente.",
            },
          });
        });
    }
  }

  isValidToCreate(data) {
    if (!data.type || !data.value) {
      return false;
    }

    if (data.type === "MANUAL" && data.value === "INPUT" && data.description.trim().length === 0) {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "A descrição é obrigatório para adicionar um registro manual.",
        },
      });
      return false;
    }

    return true;
  }

  render() {
    return (
      <div>
        <Notification
          severity={this.state.notification.severity}
          message={this.state.notification.message}
          open={this.state.notification.display}
          onClose={() => {
            this.setState({
              notification: {
                ...this.state.notification,
                display: false,
                severity: "",
                message: "",
              },
            });
          }}
        />

        <Dialog
          fullWidth={this.state.dialog.fullWidth}
          maxWidth={this.state.dialog.maxWidth}
          open={this.state.dialog.display}
          onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
          <DialogTitle >{this.state.dialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.state.dialog.message}</DialogContentText>
          </DialogContent>
          {(this.state.dialog.actions && this.state.dialog.actions.length > 0) &&
            <DialogActions>
              {this.state.dialog.actions.map((e, i) => {
                return <Button key={i} color={e.color ? e.color : "transparent"} autoFocus={e.autoFocus} onClick={(ev) => { if (e.callback) { e.callback(ev); } }}>{e.text}</Button>
              })}
            </DialogActions>}
        </Dialog>


        {this.state.counterparts && this.state.counterparts.length === 0 && (
          <div style={{ width: "100%" }}>
            <h4 style={{ textAlign: "center" }}>Nenhuma parte contrária encontrada para esse processo.</h4>
            <span>
              <ArrowDownwardIcon />
              Clique em{" "} <span style={{ fontWeight: "bold" }}>Adicionar</span> para criar uma nova parte contrária no processo.
            </span>
          </div>
        )}

        {this.state.counterparts && this.state.counterparts.length > 0 && this.state.counterparts.map((el, i) => {
          return (
            <div key={i} style={{ width: "100%" }}>
              <GridContainer style={{ borderLeft: "2px solid #cacaca" }}>
                <h4 style={{ paddingLeft: "30px", marginBottom: "0", width: "100%" }}>Dados pessoais</h4>

                <GridItem xs={12} sm={12} md={6} lg={4}>
                  <CustomInput formControlProps={{ fullWidth: true }}
                    labelText="Nome"
                    inputProps={{
                      value: el.name,
                      onChange: (e) =>
                        this.setState({
                          touched: true,
                          counterparts: [
                            ...this.state.counterparts.slice(0, i),
                            {
                              ...this.state.counterparts[i],
                              name: e.target.value
                            },
                            ...this.state.counterparts.slice(i + 1),
                          ]
                        })
                    }} />
                </GridItem>

                <GridItem xs={12} sm={12} md={6} lg={4}>
                  <CustomInput formControlProps={{ fullWidth: true }}
                    labelText="E-mail"
                    inputProps={{
                      value: el.mail,
                      onChange: (e) =>
                        this.setState({
                          touched: true,
                          counterparts: [
                            ...this.state.counterparts.slice(0, i),
                            {
                              ...this.state.counterparts[i],
                              mail: e.target.value
                            },
                            ...this.state.counterparts.slice(i + 1),
                          ]
                        })
                    }} />
                </GridItem>

                <GridItem xs={12} sm={12} md={6} lg={4}>
                  <CustomInput
                    formControlProps={{ fullWidth: true }}
                    labelProps={{ shrink: true }}
                    labelText="Data de Nascimento"
                    inputProps={{
                      type: "date",
                      value: el.birthDate,
                      onChange: (e) =>
                        this.setState({
                          touched: true,
                          counterparts: [
                            ...this.state.counterparts.slice(0, i),
                            {
                              ...this.state.counterparts[i],
                              birthDate: e.target.value
                            },
                            ...this.state.counterparts.slice(i + 1),
                          ]
                        })
                    }} />
                </GridItem>

                <GridItem xs={12} sm={12} md={6} lg={4}>
                  <CustomInput formControlProps={{ fullWidth: true }}
                    labelText="CPF/CNPJ"
                    inputProps={{
                      value: el.taxPayerIdentifier,
                      onChange: (e) =>
                        this.setState({
                          touched: true,
                          counterparts: [
                            ...this.state.counterparts.slice(0, i),
                            {
                              ...this.state.counterparts[i],
                              taxPayerIdentifier: e.target.value
                            },
                            ...this.state.counterparts.slice(i + 1),
                          ]
                        })
                    }} />
                </GridItem>

                <GridItem xs={12} sm={12} md={6} lg={4}>
                  <CustomInput formControlProps={{ fullWidth: true }}
                    labelText="RG"
                    inputProps={{
                      value: el.idCard,
                      onChange: (e) =>
                        this.setState({
                          touched: true,
                          counterparts: [
                            ...this.state.counterparts.slice(0, i),
                            {
                              ...this.state.counterparts[i],
                              idCard: e.target.value
                            },
                            ...this.state.counterparts.slice(i + 1),
                          ]
                        })
                    }} />
                </GridItem>

                <GridItem xs={12} sm={12} md={6} lg={4}>
                  <CustomInput
                    formControlProps={{ fullWidth: true }}
                    labelProps={{ shrink: true }}
                    labelText="Data de Falecimento"
                    inputProps={{
                      type: "date",
                      value: el.deathDate,
                      onChange: (e) =>
                        this.setState({
                          touched: true,
                          counterparts: [
                            ...this.state.counterparts.slice(0, i),
                            {
                              ...this.state.counterparts[i],
                              deathDate: e.target.value
                            },
                            ...this.state.counterparts.slice(i + 1),
                          ]
                        })
                    }} />
                </GridItem>

                <h5 style={{ paddingLeft: "30px", marginBottom: "0", width: "100%" }}>Telefones</h5>
                {el.phones.map((phone, i) => (
                  <GridContainer>
                    <GridItem xs={12} sm={3} md={2} lg={2}>
                      <CustomInput select={true} labelText="Tipo"
                        inputProps={{
                          value: phone.type,
                          onChange: (e) => {
                            // this.setState({
                            //   data: {
                            //     ...this.state.data,
                            //     phones: [
                            //       ...this.state.data.phones.slice(0, i),
                            //       {
                            //         ...this.state.data.phones[i],
                            //         type: e.target.value
                            //       },
                            //       ...this.state.data.phones.slice(i + 1),
                            //     ]
                            //   }
                            // });
                          }
                        }}
                        formControlProps={{
                          fullWidth: true
                        }}>
                        <option value={"MOBILE"}>Celular</option>
                        <option value={"HOME"}>Residencial</option>
                        <option value={"WORK"}>Trabalho</option>
                        <option value={"OTHER"}>Outro</option>
                      </CustomInput>
                    </GridItem>

                    <GridItem xs={12} sm={9} md={5} lg={3}>
                      <CustomInput labelText="Número" formControlProps={{ fullWidth: true }}
                        inputProps={{
                          value: phone.value,
                          onChange: (e) => {

                            // this.setState({
                            //   data: {
                            //     ...this.state.data,
                            //     phones: [
                            //       ...this.state.data.phones.slice(0, i),
                            //       {
                            //         ...this.state.data.phones[i],
                            //         value: e.target.value
                            //       },
                            //       ...this.state.data.phones.slice(i + 1),
                            //     ]
                            //   }
                            // });
                          }
                        }} />
                    </GridItem>

                    <GridItem xs={12} sm={6} md={2} lg={2}>
                      <CustomInput labelText="Complemento" formControlProps={{ fullWidth: true }}
                        inputProps={{
                          value: phone.notes,
                          onChange: (e) => {
                            //   this.setState({
                            //     data: {
                            //       ...this.state.data,
                            //       phones: [
                            //         ...this.state.data.phones.slice(0, i),
                            //         {
                            //           ...this.state.data.phones[i],
                            //           notes: e.target.value
                            //         },
                            //         ...this.state.data.phones.slice(i + 1),
                            //       ]
                            //     }
                            //   });
                          }
                        }} />
                    </GridItem>

                    <GridItem xs={12} sm={6} md={2} lg={2}>
                      <CustomInput labelText="Apelido" formControlProps={{ fullWidth: true }}
                        inputProps={{
                          value: phone.alias,
                          onChange: (e) => {
                            // this.setState({
                            //   data: {
                            //     ...this.state.data,
                            //     phones: [
                            //       ...this.state.data.phones.slice(0, i),
                            //       {
                            //         ...this.state.data.phones[i],
                            //         alias: e.target.value
                            //       },
                            //       ...this.state.data.phones.slice(i + 1),
                            //     ]
                            //   }
                            // });
                          }
                        }} />
                    </GridItem>

                    <GridItem xs={12} sm={12} md={1} style={{ textAlign: "center" }}>

                      <CustomInput>
                        <Hidden only={["xs", "sm"]}>
                          <Tooltip title="Remover telefone" arrow>
                            <IconButton size="large"
                              onClick={e => {
                                // this.setState({
                                //   data: {
                                //     ...this.state.data,
                                //     phones: [
                                //       ...this.state.data.phones.slice(0, i),
                                //       ...this.state.data.phones.slice(i + 1)
                                //     ]
                                //   }
                                // });
                              }}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Hidden>
                        <Hidden only={["md", "lg", "xl"]}>
                          <Button color="danger"
                            onClick={e => {
                              // this.setState({
                              //   data: {
                              //     ...this.state.data,
                              //     phones: [
                              //       ...this.state.data.phones.slice(0, i),
                              //       ...this.state.data.phones.slice(i + 1)
                              //     ]
                              //   }
                              // });
                            }}>
                            <DeleteIcon /> Remover telefone
                          </Button>
                        </Hidden>
                      </CustomInput>


                    </GridItem>

                  </GridContainer>
                ))}

                <GridItem xs={12} sm={12} md={1} style={{ textAlign: "center" }}>
                  <CustomInput>
                    <Tooltip title="Adicionar telefone" arrow>
                      <div>
                        <Button color="primary"
                          onClick={e => this.setState({
                            touched: true,
                            counterparts: [
                              ...this.state.counterparts.slice(0, i),
                              {
                                ...this.state.counterparts[i],
                                phones: this.state.counterparts[i].phones.concat([{ type: "HOME", value: "", alias: "", notes: "" }])
                              },
                              ...this.state.counterparts.slice(i + 1),
                            ]
                          })}>
                          <AddIcon />Adicionar Telefone</Button>
                      </div>
                    </Tooltip>
                  </CustomInput>
                </GridItem>

              </GridContainer>

              <Tooltip title="Remover parte contrária" arrow>
                <IconButton size="large"
                  onClick={e =>
                    this.setState({
                      counterparts: [
                        ...this.state.counterparts.slice(0, i),
                        ...this.state.counterparts.slice(i + 1)
                      ]
                    })}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>

              {JSON.stringify(el)}

              <Divider style={{ margin: "15px 0" }} />
            </div>
          );
        })}

        <Button color="success" onClick={(e) => this.setState({ touched: true, counterparts: (this.state.counterparts || []).concat(this.getEmptyCounterpartData()) })}>
          Adicionar Parte contrária
        </Button>
        {this.state.touched && <Button color="warning" onClick={(e) => this.setState({ counterparts: (this.state.counterparts || []).concat(this.getEmptyCounterpartData()) })}>
          Salvar alterações
        </Button>}

        {this.state.touched && <Button color="" onClick={() => this.props.loadCallback()}>Cancelar alterações</Button>}

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
  };
};

export default connect(mapStateToProps)(withRouter(ProcessCounterpartsComponent));
