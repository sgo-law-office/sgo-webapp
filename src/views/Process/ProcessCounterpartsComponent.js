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

  saveChanges(overrideData) {
    axios.put("/api/processes/" + this.props.processId + "/counterparts", (overrideData ? overrideData : this.state.counterparts),
      {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          if (this.props.loadCallback) {
            this.props.loadCallback();
          }

        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao salvar alterações, tente novamente.",
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
            message: "Falha ao salvar alterações, tente novamente.",
          },
        });
      });
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

        <div style={{ margin: "10px 20px" }}>

          {this.state.counterparts && this.state.counterparts.length > 0 && this.state.counterparts.map((el, i) => {
            return (
              <div key={i} style={{ width: "100%" }}>
                <GridContainer style={{ borderLeft: "2px solid #cacaca" }}>
                  <h4 style={{ paddingLeft: "30px", marginBottom: "0", width: "100%" }}>Dados pessoais

                    <div style={{ float: "right" }}>
                      <Tooltip title="Remover parte contrária" arrow>
                        <IconButton size="large"
                          onClick={e =>
                            this.setState({
                              dialog: {
                                title: "Deseja continuar?",
                                fullWidth: false,
                                display: true,
                                message: "Não é possível desfazer essa ação, deseja continuar com a remoção da parte contrária?",
                                actions: [
                                  {
                                    text: "Cancelar",
                                    color: "transparent",
                                    autoFocus: true,
                                    callback: () => {
                                      this.setState({
                                        dialog: {
                                          ...this.state.dialog,
                                          display: false,
                                        },
                                      });
                                    },
                                  },
                                  {
                                    text: "Estou ciente e quero continuar",
                                    color: "danger",
                                    callback: () => {
                                      this.setState({
                                        dialog: {
                                          ...this.state.dialog,
                                          display: false,
                                        },

                                        counterparts: [
                                          ...this.state.counterparts.slice(0, i),
                                          ...this.state.counterparts.slice(i + 1)
                                        ]
                                      })
                                      this.saveChanges([
                                        ...this.state.counterparts.slice(0, i),
                                        ...this.state.counterparts.slice(i + 1)
                                      ]);
                                    },
                                  },
                                ],
                              },
                            })
                          }>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </h4>

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
                  {el.phones.map((phone, j) => (
                    <div style={{ width: "100%", display: "flex", flexWrap: "wrap", boxSizing: "border-box" }}>
                      <GridItem xs={12} sm={3} md={2} lg={2}>
                        <CustomInput select={true} labelText="Tipo"
                          inputProps={{
                            value: phone.type,
                            onChange: (e) => {
                              this.setState({
                                touched: true,
                                counterparts: [
                                  ...this.state.counterparts.slice(0, i),
                                  {
                                    ...this.state.counterparts[i],
                                    phones: [
                                      ...this.state.counterparts[i].phones.slice(0, j),
                                      {
                                        ...this.state.counterparts[i].phones[j],
                                        type: e.target.value
                                      },
                                      ...this.state.counterparts[i].phones.slice(j + 1),
                                    ]
                                  },
                                  ...this.state.counterparts.slice(i + 1),
                                ]
                              })
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
                              this.setState({
                                touched: true,
                                counterparts: [
                                  ...this.state.counterparts.slice(0, i),
                                  {
                                    ...this.state.counterparts[i],
                                    phones: [
                                      ...this.state.counterparts[i].phones.slice(0, j),
                                      {
                                        ...this.state.counterparts[i].phones[j],
                                        value: e.target.value
                                      },
                                      ...this.state.counterparts[i].phones.slice(j + 1),
                                    ]
                                  },
                                  ...this.state.counterparts.slice(i + 1),
                                ]
                              })
                            }
                          }} />
                      </GridItem>

                      <GridItem xs={12} sm={6} md={2} lg={2}>
                        <CustomInput labelText="Complemento" formControlProps={{ fullWidth: true }}
                          inputProps={{
                            value: phone.notes,
                            onChange: (e) => {
                              this.setState({
                                touched: true,
                                counterparts: [
                                  ...this.state.counterparts.slice(0, i),
                                  {
                                    ...this.state.counterparts[i],
                                    phones: [
                                      ...this.state.counterparts[i].phones.slice(0, j),
                                      {
                                        ...this.state.counterparts[i].phones[j],
                                        notes: e.target.value
                                      },
                                      ...this.state.counterparts[i].phones.slice(j + 1),
                                    ]
                                  },
                                  ...this.state.counterparts.slice(i + 1),
                                ]
                              })
                            }
                          }} />
                      </GridItem>

                      <GridItem xs={12} sm={6} md={2} lg={2}>
                        <CustomInput labelText="Apelido" formControlProps={{ fullWidth: true }}
                          inputProps={{
                            value: phone.alias,
                            onChange: (e) => {
                              this.setState({
                                touched: true,
                                counterparts: [
                                  ...this.state.counterparts.slice(0, i),
                                  {
                                    ...this.state.counterparts[i],
                                    phones: [
                                      ...this.state.counterparts[i].phones.slice(0, j),
                                      {
                                        ...this.state.counterparts[i].phones[j],
                                        alias: e.target.value
                                      },
                                      ...this.state.counterparts[i].phones.slice(j + 1),
                                    ]
                                  },
                                  ...this.state.counterparts.slice(i + 1),
                                ]
                              })
                            }
                          }} />
                      </GridItem>

                      <GridItem xs={12} sm={12} md={1} style={{ textAlign: "center" }}>

                        <CustomInput>
                          <Hidden only={["xs", "sm"]}>
                            <Tooltip title="Remover telefone" arrow>
                              <IconButton size="large"
                                onClick={e => {
                                  this.setState({
                                    touched: true,
                                    counterparts: [
                                      ...this.state.counterparts.slice(0, i),
                                      {
                                        ...this.state.counterparts[i],
                                        phones: [
                                          ...this.state.counterparts[i].phones.slice(0, j),
                                          ...this.state.counterparts[i].phones.slice(j + 1)
                                        ]
                                      },
                                      ...this.state.counterparts.slice(i + 1),
                                    ]
                                  })
                                }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Hidden>
                          <Hidden only={["md", "lg", "xl"]}>
                            <Button color="danger"
                              onClick={e => {
                                this.setState({
                                  touched: true,
                                  counterparts: [
                                    ...this.state.counterparts.slice(0, i),
                                    {
                                      ...this.state.counterparts[i],
                                      phones: [
                                        ...this.state.counterparts[i].phones.slice(0, j),
                                        ...this.state.counterparts[i].phones.slice(j + 1)
                                      ]
                                    },
                                    ...this.state.counterparts.slice(i + 1),
                                  ]
                                });
                              }}>
                              <DeleteIcon /> Remover telefone
                            </Button>
                          </Hidden>
                        </CustomInput>

                      </GridItem>
                    </div>
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


                  <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
                    <CustomInput textarea formControlProps={{ fullWidth: true }} labelProps={{shrink: true}} labelText="Observações"
                      inputProps={{
                        rows: 4,
                        value: el.notes,
                        onChange: (e) =>
                          this.setState({
                            touched: true,
                            counterparts: [
                              ...this.state.counterparts.slice(0, i),
                              {
                                ...this.state.counterparts[i],
                                notes: e.target.value
                              },
                              ...this.state.counterparts.slice(i + 1),
                            ]
                          })
                      }} />
                  </GridItem>

                </GridContainer>

                <Divider style={{ margin: "15px 0" }} />
              </div>
            );
          })}

        </div>
        <Button color="success" onClick={(e) => this.setState({ touched: true, counterparts: (this.state.counterparts || []).concat(this.getEmptyCounterpartData()) })}>
          Adicionar Parte contrária
        </Button>
        {this.state.touched && <Button color="warning" onClick={(e) => this.saveChanges()}>
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
