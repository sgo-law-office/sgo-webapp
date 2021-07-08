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
} from "@material-ui/core";
import Button from "components/CustomButtons/Button";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";

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

class ProcessHistoryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: this.getInitialDataState(),

      add: {
        display: false,
        data: {
          processId: this.props.processId,
          type: "",
          value: "",
          valueDetailed: "",
          description: "",
        },
      },


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

  getInitialDataState() {
    return {
      loading: true,
      err: false,
      limit: 10,
      offset: 0,
      total: 0,
      data: [],
    };
  }

  componentDidMount() {
    this.loadProcessHistory();
  }

  loadProcessHistory(offset = 0, limit = 10, sortDirection = "asc") {
    this.setState({
      history: {
        ...this.state.history,
        loading: true,
        err: false,
      },
    });

    const params = {
      sortBy: "created_at",
      sortDirection,
      limit,
      offset,
    };

    axios
      .get("/api/processes/" + this.props.processId + ":history", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            history: {
              ...this.state.history,
              loading: false,
              err: false,
              ...res.data,
            },
          });
          if (this.props.loadCallback) {
            this.props.loadCallback(res.data);
          }
        } else {
          this.setState({
            history: {
              ...this.state.history,
              loading: false,
              err: true,
            },
          });
        }
      })
      .catch((err) => {
        this.setState({
          history: {
            ...this.state.history,
            loading: false,
            err: true,
          },
        });
      });
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

  detachContract(contractId) {

    axios.patch("/api/processes/" + this.props.processId + "/detach-contract", { contractId: contractId },
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
          this.loadProcessHistory();
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

        <Dialog
          open={this.state.add.display}
          onClose={() => {
            this.setState({ add: { ...this.state.add, display: false } });
          }}
        >
          <DialogTitle>Adicionar registro</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>
                <GridItem sm={12}>
                  <CustomInput select labelText="Tipo de registro" formControlProps={{ fullWidth: true }} labelProps={{ style: { fontSize: "1.2rem", lineHeight: "0" }, }}
                    inputProps={{ value: this.state.add.data.type, }}>
                    <option value="MANUAL">Registro Manual</option>
                  </CustomInput>
                </GridItem>

                <GridItem sm={12}>
                  {this.state.add.data.type === "MANUAL" && (
                    <CustomInput select labelText="Entrada Manual" formControlProps={{ fullWidth: true }} labelProps={{ style: { fontSize: "1.2rem", lineHeight: "0" }, }}
                      inputProps={{ value: this.state.add.data.value }}>
                      <option value="INPUT">Adicionar Registro</option>
                    </CustomInput>
                  )}
                </GridItem>

                <GridItem xs={12}>
                  <CustomInput textarea labelText="Descrição" labelProps={{ shrink: true, style: { fontSize: "1.2rem", lineHeight: "0" } }}
                    formControlProps={{ fullWidth: true }}
                    inputProps={{
                      rows: 5,
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
            <Button color="success" style={{ float: "left" }} onClick={() => { this.createProcessHistory(); }} >Adicionar</Button>
            <Button color="transparent" autoFocus onClick={() => { this.setState({ add: { ...this.state.add, display: false } }); }} >Cancelar</Button>
          </DialogActions>
        </Dialog>

        {this.state.history.err && (
          <div style={{ textAlign: "center" }}>
            <h4>Não foi possível carregar o histórico do processo.</h4>
            <Button color="primary" onClick={(ev) => this.loadProcessHistory()} >Tentar novamente</Button>
          </div>
        )}

        {!this.state.history.err && (
          <div>
            {this.state.history.data && this.state.history.data.length === 0 && (
              <div style={{ width: "100%" }}>
                <h4 style={{ textAlign: "center" }}>Nenhum registro encontrado para esse processo.</h4>
                <span>
                  <ArrowDownwardIcon />
                  Clique em{" "} <span style={{ fontWeight: "bold" }}>Adicionar</span> para criar um novo registro de prcesso.
                </span>
              </div>
            )}

            {this.state.history.data && this.state.history.data.length > 0 && (
              <GridContainer>
                <GridItem xs={12} style={{ padding: "10px 30px", marginBottom: "15px" }}>
                  {this.state.history.loading && (
                    <h1 style={{ textAlign: "center", position: "absolute", width: "100%", height: "100%", }}>
                      <img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." />
                    </h1>
                  )}

                  <GridContainer style={{ opacity: this.state.history.loading ? "0.5" : "1", }} >
                    {this.state.history.data.map((e, i) => {
                      return (
                        <GridItem xs={12} sm={12} key={i}>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={3} lg={2} style={{ textAlign: "right" }} >
                              <p style={{ marginBottom: "3px" }}> {e.createdByName} </p>

                              <Tooltip title={moment(e.createdAt).format("DD [de] MMMM, HH:mm")} arrow>
                                <small>
                                  <Moment fromNow date={e.createdAt} />
                                </small>
                              </Tooltip>
                            </GridItem>

                            <GridItem xs={12} sm={12} md={9} lg={10}>
                              {e.type === 'EVENT' && <div
                                style={{
                                  backgroundColor: "rgba(76, 175, 80, 0.15)",
                                  margin: "10px 10px 0 0",
                                  padding: "10px 5px",
                                  boxShadow:
                                    "0 2px 2px 0 rgba(76, 175, 80, 0.14)",
                                }}
                              >
                                <span>
                                  {e.value === 'CREATED' && <div>Processo Criado.</div>}
                                  {e.value === 'STATUS_CHANGE' && <div>
                                    Mudou o Status do processo
                                    {e.metadata.from ? " de " : ""}
                                    <span style={{ fontWeight: "bold" }}>
                                      {e.metadata.from ? ({ OPEN: "Em andamento", CONCLUDED: "Concluído", }[e.metadata.from]) + " " : ""}
                                    </span>
                                    {e.metadata.to ? " para " : ""}
                                    <span style={{ fontWeight: "bold" }}>
                                      {e.metadata.to ? ({ OPEN: "Em andamento", CONCLUDED: "Concluído", }[e.metadata.to]) + "." : ""}
                                    </span>
                                  </div>}

                                  {e.value === 'ATTACH_OTHER_LAWYER' && <div>
                                    {e.metadata.lawyerName ? "Adicionou o advogado " : ""}
                                    <span style={{ fontWeight: "bold" }}>
                                      {e.metadata.lawyerName}
                                    </span>
                                    {e.metadata.lawyerName ? " ao processo." : "Adicionou um advogado ao processo."}
                                  </div>}
                                  {e.value === 'DETACH_OTHER_LAWYER' && <div>
                                    {e.metadata.lawyerName ? "Removeu o advogado " : ""}
                                    <span style={{ fontWeight: "bold" }}>
                                      {e.metadata.lawyerName}
                                    </span>
                                    {e.metadata.lawyerName ? " do processo." : "Removeu um advogado do processo."}
                                  </div>}

                                  {e.value === 'UPDATE_COUNTERPARTS' && <div>Alterou a parte contrária do processo.</div>}


                                  {(e.value === 'UPDATE_CODE' || e.value === 'UPDATE_ACTION' || e.value === 'UPDATE_COURT') && <div>
                                    Atualizou {{"UPDATE_CODE" : "o número ", "UPDATE_ACTION": "a ação", "UPDATE_COURT": "a vara" }[e.value]} do processo de
                                    <span style={{ fontWeight: "bold" }}>
                                      {e.metadata.from ? " " + e.metadata.from + " " : " vazio "}
                                    </span>
                                    para
                                    <span style={{ fontWeight: "bold" }}>
                                      {e.metadata.to ? " " + e.metadata.to : " vazio"}
                                    </span>
                                    .
                                  </div>}


                                  {e.value === 'ATTACH_CONTRACT' && <div>
                                    Vinculou um contrato a esse processo.
                                    <a href={"/admin/contracts/" + e.metadata.contractId} onClick={ev => { ev.preventDefault(); this.props.history.push("/admin/contracts/" + e.metadata.contractId) }}>Ver contrato.</a>
                                    <a style={{ marginLeft: "5px" }} href={"/admin/contracts/" + e.metadata.contractId} onClick={ev => {
                                      ev.preventDefault();
                                      this.setState({
                                        dialog: {
                                          title: "Deseja continuar?",
                                          fullWidth: false,
                                          display: true,
                                          message: "Cuidado! Essa ação poderá deixar os dados inconsistêntes nas buscas e relatórios.",
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
                                                this.detachContract(e.metadata.contractId);
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
                                      })
                                    }}>Remover vínculo.</a>
                                  </div>}
                                  {e.value === 'DETACH_CONTRACT' && <div>Removeu o vínculo de um contrato com esse processo. <a href={"/admin/contracts/" + e.metadata.contractId} onClick={e => { e.preventDefault(); this.props.history.push("/admin/contracts/" + e.metadata.contractId) }}>Ver contrato desvinculado</a></div>}
                                </span>
                              </div>}
                              {e.type !== 'EVENT' && e.description && e.description.trim().length > 0 && (
                                <p style={{ whiteSpace: "pre-line", borderLeft: "3px solid rgba(0, 0, 0, 0.12)", paddingLeft: "10px", }} >
                                  {e.description}
                                </p>
                              )}
                            </GridItem>
                            <Divider style={{ width: "100%" }} />
                          </GridContainer>
                        </GridItem>
                      );
                    })}
                  </GridContainer>
                </GridItem>

                <div style={{ width: "100%", textAlign: "right" }}>
                  {this.state.history.sortDirection === "asc" && (
                    <span style={{ marginRight: "15px" }}>
                      Mostando Antigos primeiro
                      <ArrowDropDownIcon style={{ verticalAlign: "middle", cursor: "pointer" }} onClick={(e) => this.loadProcessHistory(undefined, undefined, "desc")} />
                    </span>
                  )}
                  {this.state.history.sortDirection === "desc" && (
                    <span style={{ marginRight: "15px" }}>
                      Mostrando Novos primeiro
                      <ArrowDropUpIcon style={{ verticalAlign: "middle", cursor: "pointer" }} onClick={(e) => this.loadProcessHistory(undefined, undefined, "asc")} />
                    </span>
                  )}

                  <div style={{ display: "inline-flex" }}>
                    <Tooltip title="Início" arrow>
                      <div>
                        <Button justIcon round color="transparent" disabled={this.state.history.offset === 0} onClick={(e) => this.loadProcessHistory(0)} >
                          <SkipPreviousIcon />
                        </Button>
                      </div>
                    </Tooltip>
                    <Tooltip title="Anterior" arrow>
                      <div>
                        <Button justIcon round color="transparent" disabled={this.state.history.offset === 0} onClick={(e) => this.loadProcessHistory(this.state.history.offset - this.state.history.limit)} >
                          <NavigateBeforeIcon />
                        </Button>
                      </div>
                    </Tooltip>

                    <p>Exibindo{" "} {Math.min(this.state.history.total, this.state.history.offset + this.state.history.limit)}{" "} de {this.state.history.total} </p>

                    <Tooltip title="Próxima" arrow>
                      <div>
                        <Button justIcon round color="transparent" disabled={this.state.history.offset + this.state.history.limit >= this.state.history.total}
                          onClick={(e) => this.loadProcessHistory(this.state.history.offset + this.state.history.limit)}>
                          <NavigateNextIcon />
                        </Button>
                      </div>
                    </Tooltip>

                    <Tooltip title="Última" arrow>
                      <div>
                        <Button justIcon round color="transparent" disabled={this.state.history.offset + this.state.history.limit >= this.state.history.total}
                          onClick={(e) => this.loadProcessHistory(this.state.history.total - this.state.history.limit)} >
                          <SkipNextIcon />
                        </Button>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </GridContainer>
            )}

            <Button color="success" onClick={(e) => this.setState({ add: { ...this.state.add, display: true, data: { ...this.state.add.data, type: "MANUAL", value: "INPUT", description: "" } } })}>
              Adicionar Registro
            </Button>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
  };
};

export default connect(mapStateToProps)(withRouter(ProcessHistoryComponent));
