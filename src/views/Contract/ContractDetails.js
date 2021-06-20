import React from "react";
import { withRouter } from "react-router-dom";
import Button from "components/CustomButtons/Button.js";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";
import Moment from "react-moment";
import CardBody from "components/Card/CardBody";
import Card from "components/Card/Card";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import Notification from "components/Notifications/Notification";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import CheckIcon from '@material-ui/icons/Check';
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
import { fetchCompanies } from "store/actions";
import { connect } from "react-redux";

import moment from "moment";
import ContractReportComponent from "./ContractReportComponent";

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

class ContractDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: {
        value: 0,
      },

      notFound: false,
      data: this.getInitialDataState(),

      processes: {
        loading: true,
        err: false,

        data: {
          limit: 10,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          processes: [],
        },
      },


      processesSearch: {
        display: false,
        loading: true,
        err: false,
        data: {
          limit: 10,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          processes: [],
        }
      },

      reports: {
        init: false,
        data: {
          total: 0
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

  getInitialDataState() {
    return {
      id: null,
      companyId: null,
      status: "",
      attendanceId: null,

      customerId: null,
      customerName: "",
      customerBirthDate: null,

      lawyerId: null,
      lawyerName: "",

      folderId: null,
      folderCode: "",

      createdByName: "",
      lastUpdatedByName: "",

      createdAt: null,
      createdBy: null,
      lastUpdatedAt: null,
      lastUpdatedBy: null,
    };
  }

  componentDidMount() {
    this.props.fetchCompanies();
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      this.loadContract();
    }
  }

  loadContract() {
    axios
      .get("/api/contracts/" + this.props.match.params.id + ":summary", {
        headers: {
          Accept: "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            data: {
              ...res.data,
            },
          });
          this.searchProcesses();
        } else {
          this.setState({
            notFound: true,
          });
        }
      })
      .catch((err) => {
        this.setState({
          notFound: true,
        });
      });
  }

  toggleStatus() {
    if (!this.state.data.id) return;

    axios
      .patch(
        "/api/contracts/" +
        this.state.data.id +
        "/status/" +
        (this.state.data.status === "CURRENT" ? "FILED" : "CURRENT"),
        {
          headers: {
            Accept: "application/json",
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            data: {
              ...this.state.data,
              ...res.data,
            },
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Alterações salvas com sucesso.",
            },
          });
          this.loadContract();
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

  searchProcesses(
    offset = 0,
    limit = 10,
    sortBy = "created_at",
    sortDirection = "desc"
  ) {
    this.setState({
      processes: {
        ...this.state.processes,
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
      .get("/api/contracts/" + this.state.data.id + "/processes", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        this.setState({
          processes: {
            ...this.state.processes,
            loading: false,
            err: false,
            data: {
              ...this.state.processes.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: res.data.total,
              processes: res.data.data || [],
            },
          },
        });
      })
      .catch((err) => {
        this.setState({
          processes: {
            ...this.state.processes,
            loading: false,
            err: true,
          },
        });
      });
  }

  removeAttendanceId() {
    axios
      .delete("/api/contracts/" + this.state.data.id + ":attendance")
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Vínculo com atendimento removido com sucesso.",
            },
          });
          this.loadContract();

        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao remover vínculo com atendimento, tente novamente.",
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
            message: "Falha ao remover vínculo com atendimento, tente novamente.",
          },
        });
      });
  }


  searchProcessesToAttach(
    offset = 0,
    limit = 10,
    sortBy = "created_at",
    sortDirection = "desc"
  ) {

    const params = {
      offset: offset,
      limit: limit,
      sortBy: sortBy,
      sortDirection: sortDirection,
      customerId: this.state.data.customerId
    };

    axios
      .get("/api/processes", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        // Remove processes that are already attached (this.state.processes)
        const sanitizedResults = res.data.data.filter(el => !this.state.processes.data.processes.map(p => p.id).includes(el.id));

        this.setState({
          processesSearch: {
            ...this.state.processesSearch,
            loading: false,
            err: false,
            data: {
              ...this.state.processesSearch.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: sanitizedResults.length,
              processes: sanitizedResults || [],
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          processesSearch: {
            ...this.state.processesSearch,
            loading: false,
            err: true,
          },
        });
      });
  }

  attachToProcess(processId) {
    axios.patch("/api/contracts/" + this.state.data.id + "/attach-process", { processId: processId },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        }
      })
      .then((res) => {
        this.setState({
          processesSearch: {
            ...this.state.processesSearch,
            display: false
          },
          notification: {
            ...this.state.notification,
            display: true,
            severity: "success",
            message: "Processo vinculado com sucesso.",
          }
        });
        this.searchProcesses();
      })
      .catch((err) => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "error",
            message: "Falha ao vincular processo, tente novamente.",
          }
        });
      });
  }


  detachProcess(processId) {
    axios.patch("/api/contracts/" + this.state.data.id + "/detach-process", { processId: processId },
      {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Alterações salvas com sucesso.",
            },
          });
          this.searchProcesses();
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
          onClose={() => {
            this.setState({ dialog: { ...this.state.dialog, display: false } });
          }}
        >
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
                    }}
                  >
                    {e.text}
                  </Button>
                );
              })}
            </DialogActions>
          )}
        </Dialog>


        <Dialog fullWidth maxWidth="lg" open={this.state.processesSearch.display} onClose={() => { this.setState({ processesSearch: { ...this.state.processesSearch, display: false } }); }} >
          <DialogTitle>Vincular Processo</DialogTitle>
          <DialogContent>
            <DialogContentText>Selecione na tabela abaixo qual processo você deseja vincular a esse contrato. Os processos exibidos abaixo poderão tem vinculo com outros contratos.</DialogContentText>

            <GridContainer>
              <GridItem xs={12} sm={6} md={12} lg={12}>
                {this.state.processesSearch.err && (
                  <div style={{ textAlign: "center" }}>
                    <h4>Não foi possível carregar os processos.</h4>
                    <Button color="primary" onClick={(e) => this.searchProcessesToAttach()}>Tentar novamente</Button>
                  </div>
                )}

                {this.state.processesSearch.loading && (
                  <h1 style={{ textAlign: "center", position: "absolute", width: "100%", height: "100%", }}>
                    <img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." />
                  </h1>
                )}

                {!this.state.processesSearch.err &&
                  !this.state.processesSearch.loading && (
                    <div>
                      <Table>
                        <TableHead>
                          <TableRow>

                            <TableCell style={{ textAlign: "center" }}>Unidade</TableCell>
                            <TableCell style={{ textAlign: "center" }}>Nº do processo</TableCell>

                            <TableCell style={{ textAlign: "center" }}>Nome do advogado
                              <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }}>
                                <a href="#">
                                  {(this.state.processesSearch.data.sortBy !== "lawyer_name" || this.state.processesSearch.data.sortDirection === "desc") && (
                                    <ArrowDropDownIcon color={this.state.processesSearch.data.sortBy === "name" ? "" : "disabled"}
                                      onClick={(e) => { this.searchProcessesToAttach(undefined, undefined, "lawyer_name", "asc"); }}
                                    />
                                  )}

                                  {this.state.processesSearch.data.sortBy === "lawyer_name" && this.state.processesSearch.data.sortDirection === "asc" && (
                                    <ArrowDropUpIcon color={this.state.processesSearch.data.sortBy === "name" ? "" : "disabled"}
                                      onClick={(e) => { this.searchProcessesToAttach(undefined, undefined, "lawyer_name", "desc"); }}
                                    />
                                  )}
                                </a>
                              </div>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>Status</TableCell>

                            <TableCell style={{ textAlign: "center" }}>Criado em
                              <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }}>
                                <a href="#">
                                  {(this.state.processesSearch.data.sortBy !== "created_at" || this.state.processesSearch.data.sortDirection === "desc") && (
                                    <ArrowDropDownIcon color={this.state.processesSearch.data.sortBy === "created_at" ? "" : "disabled"}
                                      onClick={(e) => { this.searchProcessesToAttach(undefined, undefined, "created_at", "asc"); }}
                                    />
                                  )}

                                  {this.state.processesSearch.data.sortBy === "created_at" && this.state.processesSearch.data.sortDirection === "asc" && (
                                    <ArrowDropUpIcon color={this.state.processesSearch.data.sortBy === "created_at" ? "" : "disabled"}
                                      onClick={(e) => { this.searchProcessesToAttach(undefined, undefined, "created_at", "desc"); }}
                                    />
                                  )}
                                </a>
                              </div>
                            </TableCell>

                            <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {this.state.processesSearch.data.processes && this.state.processesSearch.data.processes.length > 0 && this.state.processesSearch.data.processes.map(
                            (prop, key) => {
                              return (
                                <TableRow key={key}>
                                  <TableCell>
                                    {(prop.companyId && this.props.companies &&
                                      (this.props.companies.filter((e) => e.id === prop.companyId)[0] || {}).name) || ""}
                                  </TableCell>
                                  <TableCell>{prop.code}</TableCell>
                                  <TableCell>{prop.lawyerName}</TableCell>
                                  <TableCell style={{ textAlign: "center", }}>
                                    {{
                                      OPEN: "Em andamento",
                                      CONCLUDED: "Concluído",
                                    }[prop.status]}
                                  </TableCell>

                                  <TableCell style={{ textAlign: "center", }}><Moment date={prop.createdAt} format="DD/MM/YYYY" /></TableCell>

                                  <TableCell style={{ textAlign: "center", }}>
                                    <Tooltip title="Detalhes" arrow>
                                      <span>
                                        <Button justIcon round color="transparent" onClick={(e) => this.props.history.push("/admin/processes/" + prop.id)}>
                                          <DescriptionOutlinedIcon />
                                        </Button>
                                      </span>
                                    </Tooltip>

                                    <Tooltip title="Selecionar" arrow>
                                      <span>
                                        <Button justIcon round color="transparent" onClick={(e) => this.attachToProcess(prop.id)}>
                                          <CheckIcon />
                                        </Button>
                                      </span>
                                    </Tooltip>

                                  </TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                      {this.state.processesSearch.data.processes && this.state.processesSearch.data.processes.length === 0 && <h5 style={{ textAlign: "center" }}>Nenhum processo encontrado.</h5>}
                    </div>)}

                <GridContainer>
                  <GridItem sm={12} style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex" }}>
                      <Tooltip title="Início" arrow>
                        <div>
                          <Button justIcon round color="transparent" disabled={this.state.processesSearch.data.offset === 0}
                            onClick={(e) => this.searchProcesses(0)}>
                            <SkipPreviousIcon />
                          </Button>
                        </div>
                      </Tooltip>
                      <Tooltip title="Anterior" arrow>
                        <div>
                          <Button justIcon round color="transparent" disabled={this.state.processesSearch.data.offset === 0}
                            onClick={(e) => this.searchProcesses(this.state.processesSearch.data.offset - this.state.processesSearch.data.limit)}>
                            <NavigateBeforeIcon />
                          </Button>
                        </div>
                      </Tooltip>

                      <p>Exibindo{" "} {Math.min(this.state.processesSearch.data.total, this.state.processesSearch.data.offset + this.state.processesSearch.data.limit)}{" "} de {this.state.processesSearch.data.total}</p>

                      <Tooltip title="Próxima" arrow>
                        <div>
                          <Button justIcon round color="transparent" disabled={this.state.processesSearch.data.offset + this.state.processesSearch.data.limit >= this.state.processesSearch.data.total}
                            onClick={(e) => this.searchProcesses(this.state.processesSearch.data.offset + this.state.processesSearch.data.limit)} >
                            <NavigateNextIcon />
                          </Button>
                        </div>
                      </Tooltip>

                      <Tooltip title="Última" arrow>
                        <div>
                          <Button justIcon round color="transparent" disabled={this.state.processesSearch.data.offset + this.state.processesSearch.data.limit >= this.state.processesSearch.data.total}
                            onClick={(e) => this.searchProcesses(this.state.processesSearch.data.total - this.state.processesSearch.data.limit)}>
                            <SkipNextIcon />
                          </Button>
                        </div>
                      </Tooltip>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>


          </DialogContent>
          <DialogActions>
            <Button color="transparent" autoFocus onClick={(ev) => this.setState({ processesSearch: { ...this.state.processesSearch, display: false } })}>Cancelar</Button>
          </DialogActions>
        </Dialog>


        {this.state.notFound && (
          <GridContainer>
            <GridItem
              sm={12}
              style={{ textAlign: "center", marginTop: "50px" }}
            >
              <h2>Não foi possível encontrar o contrato</h2>
              <Button
                onClick={(e) => this.props.history.push("/admin/contracts")}
              >
                Voltar
              </Button>
            </GridItem>
          </GridContainer>
        )}

        {!this.state.notFound && (
          <div>
            <Card>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Cliente</span>
                      <Tooltip arrow title="Detalhes do cliente">
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            this.props.history.push(
                              "/admin/customers/" + this.state.data.customerId
                            );
                          }}
                          style={{
                            cursor: "pointer",
                            fontSize: "1.5em",
                            marginLeft: "10px",
                          }}
                        >
                          {this.state.data.customerName}
                          <small>
                            <ElderTooltip
                              birthDate={this.state.data.customerBirthDate}
                            />
                          </small>
                        </span>
                      </Tooltip>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Status</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {
                          {
                            CURRENT: "Vigente",
                            FILED: "Arquivado",
                          }[this.state.data.status]
                        }
                      </span>
                      {this.state.data.id && (
                        <Button
                          color={this.state.data.status === "CURRENT" ? "danger" : "warning"}
                          style={{
                            padding: "8px 10px",
                            marginLeft: "10px",
                            marginTop: "-4px",
                            marginBottom: "-5px",
                            opacity: "0.8"
                          }}
                          onClick={(e) => {
                            this.setState({
                              dialog: {
                                title: "Deseja continuar?",
                                fullWidth: false,
                                display: true,
                                message:
                                  this.state.data.status === "CURRENT"
                                    ? "Cuidado! Um contrato arquivado não estará disponível para ações em outras partes do sistema."
                                    : "Contratos abertas estarão disponíveis para ações em outras parte do sistema.",
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
                                      this.toggleStatus();
                                      this.setState({
                                        dialog: {
                                          ...this.state.dialog,
                                          display: false,
                                        },
                                      });
                                    },
                                  },
                                ],
                              },
                            });
                          }}
                        >
                          {this.state.data.status === "CURRENT"
                            ? "Arquivar Contrato"
                            : "Reabrir Contrato"}
                        </Button>
                      )}
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Cód. Pasta</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        <a
                          href={"/admin/folders/" + this.state.data.folderId}
                          onClick={(e) => {
                            e.preventDefault();
                            this.props.history.push(
                              "/admin/folders/" + this.state.data.folderId
                            );
                          }}
                        >
                          {this.state.data.folderCode}
                        </a>
                      </span>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Unidade</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {(this.state.data.companyId &&
                          this.props.companies &&
                          (
                            this.props.companies.filter(
                              (e) => e.id === this.state.data.companyId
                            )[0] || {}
                          ).name) ||
                          ""}
                      </span>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Advogado Resp.</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.lawyerName}
                      </span>
                    </CustomInput>
                  </GridItem>

                </GridContainer>

                <GridContainer>

                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      {!this.state.data.attendanceId && (
                        <span>
                          Nenhum atendimento vinculado à esse contrato. <a href={'/admin/attendances?customerId=' + this.state.data.customerId + "&customerName=" + this.state.data.customerName}
                            onClick={e => {
                              e.preventDefault();
                              this.props.history.push('/admin/attendances?customerId=' + this.state.data.customerId + "&customerName=" + this.state.data.customerName);
                            }}>Clique aqui para ver atendimentos do cliente.</a>
                        </span>)}

                      {this.state.data.attendanceId && <span>

                        <a href={"/admin/attendances/" + this.state.data.attendanceId}
                          onClick={(e) => { e.preventDefault(); this.props.history.push("/admin/attendances/" + this.state.data.attendanceId) }}>
                          Ir para Atendimento vinculado
                        </a>
                        <span style={{ margin: "0 6px" }}>|</span>
                        <a href="#" onClick={(e) => this.setState({
                          dialog: {
                            title: "Deseja continuar?",
                            fullWidth: false,
                            display: true,
                            message: "Um vínculo de atendimento ao contrato facilita nas buscas, o vínculo poderá ser refeito posteriormente.",
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
                                  this.removeAttendanceId();
                                  this.setState({
                                    dialog: {
                                      ...this.state.dialog,
                                      display: false,
                                    },
                                  });
                                },
                              },
                            ],
                          },
                        })}>Remover vínculo</a>
                      </span>}
                    </CustomInput>

                  </GridItem>

                </GridContainer>

                <GridContainer>

                  <GridItem xs={12} sm={12} md={12} lg={12} style={{ marginTop: "15px" }}>
                    <Divider fullWidth />
                  </GridItem>


                  <GridItem xs={12} sm={12} md={6} lg={3}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Criado em</span>
                      <Tooltip arrow title={moment(this.state.data.createdAt).format("DD/MM/YYYY HH:mm")} >
                        <span style={{ fontWeight: "bold", marginLeft: "10px" }} >
                          <Moment date={this.state.data.createdAt} format="DD [de] MMMM [de] YYYY" />
                        </span>
                      </Tooltip>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={3}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Criado por</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.createdByName}
                      </span>
                    </CustomInput>
                  </GridItem>

                  {this.state.data.lastUpdatedAt && (
                    <GridItem xs={12} sm={12} md={6} lg={3}>
                      <CustomInput formControlProps={{ fullWidth: true }}>
                        <span>Ultima vez atualizado em</span>
                        <Tooltip arrow title={moment(this.state.data.lastUpdatedAt).format("DD/MM/YYYY HH:mm")} >
                          <span style={{ fontWeight: "bold", marginLeft: "10px" }} >
                            <Moment date={this.state.data.lastUpdatedAt} format="DD [de] MMMM [de] YYYY" />
                          </span>
                        </Tooltip>
                      </CustomInput>
                    </GridItem>
                  )}

                  {this.state.data.lastUpdatedAt && (
                    <GridItem xs={12} sm={12} md={6} lg={3}>
                      <CustomInput formControlProps={{ fullWidth: true }}>
                        <span>Ultima vez atualizado por</span>
                        <span style={{ fontWeight: "bold", marginLeft: "10px" }} >
                          {this.state.data.lastUpdatedByName}
                        </span>
                      </CustomInput>
                    </GridItem>
                  )}
                </GridContainer>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Tabs value={this.state.tabs.value} onChange={(e, v) => this.setState({ tabs: { ...this.state.tabs, value: v } })} >
                  <Tab label={"Processos (" + (this.state.processes.data.total || 0) + ")"} />
                  <Tab label={this.state.reports.init ? "Relatos (" + (this.state.reports.data.total || "0") + ")" : "Relatos"}
                    onClick={(e) => {
                      this.setState({ reports: { ...this.state.reports, init: true } });
                    }}
                  />
                </Tabs>
                <Divider style={{ width: "100%" }} />

                <div role="tabpanel" hidden={this.state.tabs.value !== 0}>
                  {this.state.tabs.value === 0 && (
                    <GridContainer>
                      <GridItem xs={12} sm={6} md={12} lg={12}>
                        {this.state.processes.err && (
                          <div style={{ textAlign: "center" }}>
                            <h4>Não foi possível carregar os processos do contrato.</h4>
                            <Button color="primary" onClick={(e) => this.searchProcesses()}> Tentar novamente</Button>
                          </div>
                        )}

                        {this.state.processes.loading && (
                          <h1 style={{ textAlign: "center", position: "absolute", width: "100%", height: "100%", }} >
                            <img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." />
                          </h1>
                        )}

                        {!this.state.processes.err &&
                          !this.state.processes.loading && <div>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ textAlign: "center", width: "15%", }}>Número do processo</TableCell>
                                  <TableCell style={{ textAlign: "center", width: "20%", }} >Nome do advogado
                                    <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }} >
                                      <a href="#">
                                        {(this.state.processes.data.sortBy !== "lawyer_name" || this.state.processes.data.sortDirection === "desc") &&
                                          (<ArrowDropDownIcon color={this.state.processes.data.sortBy === "name" ? "" : "disabled"} onClick={(e) => { this.searchProcesses(undefined, undefined, "lawyer_name", "asc"); }} />)}
                                        {this.state.processes.data.sortBy === "lawyer_name" && this.state.processes.data.sortDirection === "asc" &&
                                          (<ArrowDropUpIcon color={this.state.processes.data.sortBy === "name" ? "" : "disabled"} onClick={(e) => { this.searchProcesses(undefined, undefined, "lawyer_name", "desc"); }} />)}
                                      </a>
                                    </div>
                                  </TableCell>

                                  <TableCell style={{ textAlign: "center", width: "15%", }}>Ação</TableCell>
                                  <TableCell style={{ textAlign: "center", width: "15%", }}>Vara</TableCell>


                                  <TableCell style={{ textAlign: "center", width: "10%" }}>Status
                                    <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }} >
                                      <a href="#">
                                        {(this.state.processes.data.sortBy !== "status" || this.state.processes.data.sortDirection === "desc") &&
                                          (<ArrowDropDownIcon color={this.state.processes.data.sortBy === "name" ? "" : "disabled"} onClick={(e) => { this.searchProcesses(undefined, undefined, "status", "asc"); }} />)}
                                        {this.state.processes.data.sortBy === "status" && this.state.processes.data.sortDirection === "asc" &&
                                          (<ArrowDropUpIcon color={this.state.processes.data.sortBy === "name" ? "" : "disabled"} onClick={(e) => { this.searchProcesses(undefined, undefined, "status", "desc"); }} />)}
                                      </a>
                                    </div>
                                  </TableCell>

                                  <TableCell style={{ textAlign: "center", width: "15%" }}>Criado em
                                    <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }} >
                                      <a href="#">
                                        {(this.state.processes.data.sortBy !== "created_at" || this.state.processes.data.sortDirection === "desc") &&
                                          (<ArrowDropDownIcon color={this.state.processes.data.sortBy === "created_at" ? "" : "disabled"} onClick={(e) => { this.searchProcesses(undefined, undefined, "created_at", "asc"); }} />)}
                                        {this.state.processes.data.sortBy === "created_at" && this.state.processes.data.sortDirection === "asc" &&
                                          (<ArrowDropUpIcon color={this.state.processes.data.sortBy === "created_at" ? "" : "disabled"} onClick={(e) => { this.searchProcesses(undefined, undefined, "created_at", "desc"); }} />)}
                                      </a>
                                    </div>
                                  </TableCell>

                                  <TableCell style={{ textAlign: "center", width: "10%" }}>Ações</TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {this.state.processes.data.processes && this.state.processes.data.processes.length > 0 && this.state.processes.data.processes.map((prop, key) => {
                                  return (
                                    <TableRow key={key}>
                                      <TableCell style={{ width: "15%" }}>{prop.code ? prop.code : <span style={{ fontStyle: "italic", color: "grey", fontWeight: "lighter", margin: "0 10px" }}>vazio</span>}</TableCell>
                                      <TableCell style={{ padding: "5px 16px", width: "20%", }}>{prop.lawyerName}</TableCell>
                                      <TableCell style={{ padding: "5px 16px", width: "15%", }}>{prop.action ? prop.action : <span style={{ fontStyle: "italic", color: "grey", fontWeight: "lighter", margin: "0 10px" }}>vazio</span>}</TableCell>
                                      <TableCell style={{ padding: "5px 16px", width: "15%", }}>{prop.courtName ? prop.courtName : <span style={{ fontStyle: "italic", color: "grey", fontWeight: "lighter", margin: "0 10px" }}>vazio</span>}</TableCell>
                                      <TableCell style={{ padding: "5px 16px", textAlign: "center", width: "10%" }}>
                                        {{
                                          OPEN: "Em andamento",
                                          CONCLUDED: "Concluído",
                                        }[prop.status]}
                                      </TableCell>

                                      <TableCell style={{ padding: "5px 16px", textAlign: "center", width: "15%" }} ><Moment date={prop.createdAt} format="DD/MM/YYYY" /></TableCell>

                                      <TableCell style={{ padding: "5px 16px", textAlign: "center", width: "10%" }} >
                                        <Tooltip title="Ver processo" arrow>
                                          <span>
                                            <Button justIcon round color="transparent" onClick={(e) => this.props.history.push("/admin/processes/" + prop.id)}>
                                              <DescriptionOutlinedIcon />
                                            </Button>
                                          </span>
                                        </Tooltip>

                                        <Tooltip title="Remover vínculo" arrow>
                                          <span>
                                            <Button justIcon round color="transparent" onClick={(e) => this.setState({
                                              dialog: {
                                                title: "Deseja remover o vínculo com o processo?",
                                                fullWidth: false,
                                                display: true,
                                                message: "Cuidado! Remover o vínculo de um contracto a um processo pode causar inconsistências nos dados.",
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
                                                      this.detachProcess(prop.id);
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
                            {this.state.processes.data.processes && this.state.processes.data.processes.length === 0 && <h5 style={{ textAlign: "center" }}>Nenhum processo encontrado.</h5>}
                          </div>}

                        <GridContainer>
                          <GridItem sm={12} style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex" }}>
                              <Tooltip title="Início" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={this.state.processes.data.offset === 0}
                                    onClick={(e) => this.searchProcesses(0)}>
                                    <SkipPreviousIcon />
                                  </Button>
                                </div>
                              </Tooltip>
                              <Tooltip title="Anterior" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={this.state.processes.data.offset === 0}
                                    onClick={(e) => this.searchProcesses(this.state.processes.data.offset - this.state.processes.data.limit)}>
                                    <NavigateBeforeIcon />
                                  </Button>
                                </div>
                              </Tooltip>

                              <p>
                                Exibindo{" "}
                                {Math.min(
                                  this.state.processes.data.total,
                                  this.state.processes.data.offset +
                                  this.state.processes.data.limit
                                )}{" "}
                                de {this.state.processes.data.total}
                              </p>

                              <Tooltip title="Próxima" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={
                                      this.state.processes.data.offset +
                                      this.state.processes.data.limit >=
                                      this.state.processes.data.total
                                    }
                                    onClick={(e) =>
                                      this.searchProcesses(
                                        this.state.processes.data.offset +
                                        this.state.processes.data.limit
                                      )
                                    }>
                                    <NavigateNextIcon />
                                  </Button>
                                </div>
                              </Tooltip>

                              <Tooltip title="Última" arrow>
                                <div>
                                  <Button
                                    justIcon round color="transparent"
                                    disabled={
                                      this.state.processes.data.offset +
                                      this.state.processes.data.limit >=
                                      this.state.processes.data.total
                                    }
                                    onClick={(e) =>
                                      this.searchProcesses(
                                        this.state.processes.data.total -
                                        this.state.processes.data.limit
                                      )
                                    }>
                                    <SkipNextIcon />
                                  </Button>
                                </div>
                              </Tooltip>
                            </div>
                          </GridItem>
                        </GridContainer>
                      </GridItem>

                      <GridItem xs={12} sm={6} md={12} lg={12}>
                        <Button color="success" onClick={(e) => {
                          this.setState({ processesSearch: { ...this.state.processesSearch, display: true, loading: true, err: false, } });
                          this.searchProcessesToAttach();
                        }}>Vincular Processo</Button>
                        <Button color="success" onClick={(e) => this.props.history.push("/admin/processes/create?contractId=" + this.state.data.id)}>Novo processo</Button>
                      </GridItem>
                    </GridContainer>
                  )}
                </div>

                <div role="tabpanel" hidden={this.state.tabs.value !== 1}>
                  {this.state.data.id && this.state.tabs.value === 1 &&
                    <ContractReportComponent
                      contract={this.state.data}
                      callback={data => this.setState({
                        reports: {
                          ...this.state.reports,
                          data: {
                            ...this.state.reports.data,
                            ...data
                          }
                        }
                      })}
                      newReportAddedCallback={() => this.loadContract()} />}
                </div>

              </CardBody>
            </Card>

            <Button onClick={(e) => this.props.history.goBack()}>Voltar</Button>

          </div>
        )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    companies: state.common.data.companies,
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchCompanies: (callback) => dispatch(fetchCompanies(callback)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ContractDetails));
