import React from "react";
import { withRouter } from "react-router-dom";
import Button from "components/CustomButtons/Button.js";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";
import Moment from "react-moment";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@material-ui/core";
import Notification from "components/Notifications/Notification";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import ClearIcon from '@material-ui/icons/Clear';


import Axios from "axios";
import {
  authRequestInterceptor,
  authRequestInterceptorOnError,
  authResponseInterceptor,
  authResponseInterceptorOnError,
} from "auth/interceptor";
import {
  loadingRequestInterceptor,
  loadingRequestInterceptorOnError,
  loadingResponseInterceptor,
  loadingResponseInterceptorOnError,
} from "components/Loading/interceptor";

import ContractReportPrint from "./ContractReportPrint";

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

class ContractReportComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reports: {
        loading: true,
        err: false,

        data: {
          limit: 10,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          reports: [],
        },
      },

      add: {
        display: false,
        data: {
          id: null,
          contractId: this.props.contract.id,
          type: "REPORT",
          title: "",
          description: "",
        },
      },

      notification: {
        display: false,
        message: "",
        severity: "",
      },

      dialog: {
        display: false,
        title: "",
        message: "",
        actions: [],
      },
    };
  }


  componentDidMount() {
    this.searchReports();
  }

  searchReports(
    offset = 0,
    limit = 10,
    sortBy = "created_at",
    sortDirection = "desc"
  ) {
    this.setState({
      reports: {
        ...this.state.reports,
        loading: true,
        err: false,
      },
    });

    const params = {
      offset: offset,
      limit: limit,
      sortBy: sortBy,
      sortDirection: sortDirection,
    };

    axios
      .get("/api/contracts/" + this.props.contract.id + "/reports", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        this.setState({
          reports: {
            ...this.state.reports,
            loading: false,
            err: false,
            data: {
              ...this.state.reports.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: res.data.total,
              reports: res.data.data || [],
            }
          },
        });
        if (this.props.callback) {
          this.props.callback({ total: res.data.total });
        }
      })
      .catch((err) => {
        this.setState({
          reports: {
            ...this.state.reports,
            loading: false,
            err: true,
          },
        });
      });
  }

  createReport() {
    if (this.isValidToCreate(this.state.add.data)) {
      axios
        .post("/api/contracts/" + this.props.contract.id + "/reports", { ...this.state.add.data, }, {
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
              notification: {
                ...this.state.notification,
                display: true,
                severity: "success",
                message: "Relato criado com sucesso.",
              },
            });
            this.searchReports();

            if (this.props.newReportAddedCallback) {
              this.props.newReportAddedCallback(res.data);
            }
          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao criar relato, tente novamente.",
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
              message: "Falha ao criar relato, tente novamente.",
            },
          });
        });
    }
  }

  isValidToCreate(data) {
    if (data.id) {
      return false;
    }
    return this.isValidToEdit(data);
  }

  updateReport() {
    if (this.isValidToEdit(this.state.add.data)) {
      axios
        .put("/api/contracts/" + this.props.contract.id + "/reports/" + this.state.add.data.id, { ...this.state.add.data, }, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200) {
            this.setState({
              add: {
                ...this.state.add,
                display: false,
              },
              notification: {
                ...this.state.notification,
                display: true,
                severity: "success",
                message: "Relato atualizado com sucesso.",
              },
            });
            this.searchReports();

            if (this.props.newReportAddedCallback) {
              this.props.newReportAddedCallback(res.data);
            }
          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao atualizar relato, tente novamente.",
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
              message: "Falha ao atualizar relato, tente novamente.",
            },
          });
        });
    }
  }

  isValidToEdit(data) {
    if (!this.props.contract.id || !data.type || !data.title || !data.description) {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "Todos os campos de um relato são obrigatórios.",
        },
      });
      return false;
    }

    return true;
  }


  removeReport(reportId) {
    axios.delete("/api/contracts/" + this.props.contract.id + "/reports/" + reportId)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            add: {
              ...this.state.add,
              display: false,
            },
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Relato removido com sucesso.",
            },
          });
          this.searchReports();

          if (this.props.newReportAddedCallback) {
            this.props.newReportAddedCallback(res.data);
          }
        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao remover relato, tente novamente.",
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
            message: "Falha ao remover relato, tente novamente.",
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
          onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }); }}>
          <DialogTitle>{this.state.dialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.state.dialog.message}</DialogContentText>
          </DialogContent>
          {this.state.dialog.actions && this.state.dialog.actions.length > 0 && (
            <DialogActions>
              {this.state.dialog.actions.map((e, i) => {
                return (
                  <Button
                    key={i}
                    color={e.color ? e.color : "transparent"}
                    autoFocus={e.autoFocus}
                    onClick={(ev) => {
                      if (e.callback) {
                        e.callback(ev);
                      }
                    }}>
                    {e.text}
                  </Button>
                );
              })}
            </DialogActions>
          )}
        </Dialog>



        <Dialog open={this.state.add.display} fullWidth maxWidth="md" onClose={() => { this.setState({ add: { ...this.state.add, display: false } }); }} >
          <DialogTitle>{!this.state.add.data.id ? "Adicionar" : "Alterar"} relato</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>
                <GridItem sm={12}>
                  <CustomInput select labelText="Tipo de registro" formControlProps={{ fullWidth: true }} labelProps={{ style: { fontSize: "1.2rem", lineHeight: "0" }, }}
                    inputProps={{
                      onChange: (e) =>
                        this.setState({
                          add: {
                            ...this.state.add,
                            data: {
                              ...this.state.add.data,
                              type: e.target.value,
                            },
                          },
                        }),
                      value: this.state.add.data.type,
                    }}>
                    <option value="REPORT">Relato</option>
                  </CustomInput>
                </GridItem>

                <GridItem xs={12}>
                  <CustomInput labelText="Título" formControlProps={{ fullWidth: true }} labelProps={{ shrink: true, style: { fontSize: "1.2rem", lineHeight: "0" }, }}
                    inputProps={{
                      onChange: (e) =>
                        this.setState({
                          add: {
                            ...this.state.add,
                            data: {
                              ...this.state.add.data,
                              title: e.target.value,
                            },
                          },
                        }),
                      value: this.state.add.data.title,
                    }}
                  />
                </GridItem>

                <GridItem xs={12}>
                  <CustomInput textarea labelText="Descrição" labelProps={{ shrink: true, style: { fontSize: "1.2rem", lineHeight: "0" }, }} formControlProps={{ fullWidth: true }}
                    inputProps={{
                      rows: 8,
                      onChange: (e) =>
                        this.setState({
                          add: {
                            ...this.state.add,
                            data: {
                              ...this.state.add.data,
                              description: e.target.value,
                            },
                          },
                        }),
                      value: this.state.add.data.description,
                    }}
                  />
                </GridItem>
              </GridContainer>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {!this.state.add.data.id && <Button color="success" style={{ float: "left" }} onClick={() => { this.createReport(); }} >Criar relato</Button>}
            {this.state.add.data.id && <Button color="warning" style={{ float: "left" }} onClick={() => { this.updateReport(); }} >Atualizar relato</Button>}
            <Button color="transparent" autoFocus onClick={() => { this.setState({ add: { ...this.state.add, display: false } }); }}>Cancelar</Button>
          </DialogActions>
        </Dialog>




        <GridContainer>

          <GridItem xs={12} sm={6} md={12} lg={12}>

            {this.state.reports.err && <div style={{ textAlign: "center" }}>
              <h4>Não foi possível carregar os relatos do contrato.</h4>
              <Button color="primary" onClick={e => this.searchReports()}>Tentar novamente</Button>
            </div>}

            {this.state.reports.loading &&
              <h1 style={{ textAlign: "center", position: "absolute", width: "100%", height: "100%" }}>
                <img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." />
              </h1>}

            {!this.state.reports.err && !this.state.reports.loading &&
              <div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: "center" }}>Tipo</TableCell>
                      <TableCell style={{ textAlign: "center" }}>Título</TableCell>
                      <TableCell style={{ textAlign: "center" }}>Criado em</TableCell>
                      <TableCell style={{ textAlign: "center" }}>Criado por</TableCell>
                      <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>

                    {this.state.reports.data.reports && this.state.reports.data.reports.length > 0 && this.state.reports.data.reports.map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell style={{ textAlign: "center" }}>{{ "REPORT": "Relato" }[prop.type]} </TableCell>
                          <TableCell style={{ width: "50%" }}>{prop.title}</TableCell>
                          <TableCell style={{ textAlign: "center" }}><Moment date={prop.createdAt} format="DD/MM/YYYY" /></TableCell>
                          <TableCell>{prop.createdByName}</TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            <Tooltip title="Detalhes" arrow>
                              <span>
                                <Button justIcon round color="transparent" onClick={e => this.setState({
                                  add: {
                                    ...this.state.add,
                                    display: true,
                                    data: {
                                      ...this.state.add.data,
                                      ...prop
                                    },
                                  },
                                })}>
                                  <DescriptionOutlinedIcon />
                                </Button>
                              </span>
                            </Tooltip>

                            <ContractReportPrint content={{ contract: this.props.contract, report: prop }} />

                            <Tooltip title="Remover" arrow>
                              <span>
                                <Button justIcon round color="transparent" onClick={(e) => this.setState({
                                  dialog: {
                                    title: "Deseja remover o relato?",
                                    fullWidth: false,
                                    display: true,
                                    message: "Cuidado! Os dados serão perdidos caso o relato não tenha sido impresso.",
                                    actions: [
                                      {
                                        text: "Cancelar",
                                        color: "transparent",
                                        autoFocus: true,
                                        callback: () => {
                                          this.setState({
                                            dialog: {
                                              ...this.state.dialog,
                                              display: false
                                            }
                                          })
                                        }
                                      },
                                      {
                                        text: "Estou ciente e quero continuar",
                                        color: "danger",
                                        callback: () => {
                                          this.removeReport(prop.id);
                                          this.setState({
                                            dialog: {
                                              ...this.state.dialog,
                                              display: false
                                            }
                                          });
                                        }
                                      }
                                    ]
                                  }
                                })}>
                                  <ClearIcon />
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {this.state.reports.data.reports && this.state.reports.data.reports.length === 0 && <h5 style={{ textAlign: "center" }}>Nenhum relato encontrado.</h5>}
              </div>}
          </GridItem>

          <GridItem xs={12} sm={6} md={12} lg={12}>
            <Button color="success" onClick={e => this.setState({
              add: {
                ...this.state.add,
                display: true,
                data: {
                  id: null,
                  type: "REPORT",
                  title: "",
                  description: "",
                },
              },
            })}>Adicionar relato</Button>
          </GridItem>

        </GridContainer>
      </div >);
  }
}

export default withRouter(ContractReportComponent);
