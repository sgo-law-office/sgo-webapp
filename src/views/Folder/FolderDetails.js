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
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";

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

class FolderDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: {
        value: 0,
      },

      editNotes: false,

      notFound: false,
      data: this.getInitialDataState(),

      contracts: {
        loading: true,
        err: false,

        data: {
          limit: 10,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          contracts: [],
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
      code: "",
      companyId: null,
      customerId: "",
      status: "",
      notes: "",
      createdAt: null,
      createdBy: null,
      lastUpdatedAt: null,
      lastUpdatedBy: null,
      customerName: "",
      customerBirthDate: null,
      customerDeathDate: null,
      createdByName: "",
      lastUpdatedByName: "",
    };
  }

  componentDidMount() {
    this.props.fetchCompanies();
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      this.loadFolder();
    }
  }

  loadFolder() {
    axios.get("/api/folders/" + this.props.match.params.id + ":summary", {
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            data: {
              ...this.state.data,
              ...res.data,
            },
          });
          this.searchContracts();
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

  updateNotes() {
    if (!this.state.data.id) return;

    axios.put("/api/folders/" + this.state.data.id, { ...this.state.data }, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
    )
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            editNotes: false,
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Alterações salvas com sucesso.",
            },
          });
          this.loadFolder();
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

  toggleStatus() {
    if (!this.state.data.id) return;

    axios.patch("/api/folders/" + this.state.data.id + "/status/" + (this.state.data.status === "OPEN" ? "ARCHIVED" : "OPEN"), {
      headers: {
        Accept: "application/json",
      },
    })
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

  searchContracts(
    offset = 0,
    limit = 10,
    sortBy = "created_at",
    sortDirection = "desc"
  ) {
    this.setState({
      contracts: {
        ...this.state.contracts,
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

    axios.get("/api/folders/" + this.state.data.id + "/contracts", {
      headers: {
        Accept: "application/json",
      },
      params,
    })
      .then((res) => {
        this.setState({
          contracts: {
            ...this.state.contracts,
            loading: false,
            err: false,
            data: {
              ...this.state.contracts.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: res.data.total,
              contracts: res.data.data || [],
            },
          },
        });
      })
      .catch((err) => {
        this.setState({
          contracts: {
            ...this.state.contracts,
            loading: false,
            err: true,
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

        {this.state.notFound && (
          <GridContainer>
            <GridItem
              sm={12}
              style={{ textAlign: "center", marginTop: "50px" }}
            >
              <h2>Não foi possível encontrar a pasta</h2>
              <Button
                onClick={(e) => this.props.history.push("/admin/folders")}
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
                              deathDate={this.state.data.customerDeathDate}
                            />
                          </small>
                        </span>
                      </Tooltip>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Código</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.code}
                      </span>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Status</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {
                          {
                            OPEN: "Aberta",
                            ARCHIVED: "Arquivada",
                          }[this.state.data.status]
                        }
                      </span>
                      {this.state.data.id && (
                        <Button
                          color={this.state.data.status === "OPEN" ? "danger" : "warning"}
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
                                  this.state.data.status === "OPEN"
                                    ? "Cuidado! Uma pasta arquivada não estará disponível para ações em outras partes do sistema."
                                    : "Pastas abertas estarão disponíveis para ações em outras parte do sistema.",
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
                          {this.state.data.status === "OPEN"
                            ? "Arquivar Pasta"
                            : "Reabrir pasta"}
                        </Button>
                      )}
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


                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <CustomInput textarea labelText="Observações" formControlProps={{ fullWidth: true }} labelProps={{ shrink: true }}
                      inputProps={{
                        rows: 5,
                        value: this.state.data.notes,
                        onChange: (e) =>
                          this.setState({
                            editNotes: true,
                            data: { ...this.state.data, notes: e.target.value },
                          }),
                      }}
                    />
                  </GridItem>

                  {this.state.editNotes && (
                    <GridItem xs={12} sm={12} md={12} lg={12}>
                      <Button
                        color="primary"
                        onClick={(e) => this.updateNotes()}
                      >
                        Salvar alterações
                      </Button>
                    </GridItem>
                  )}


                  <GridItem xs={12} sm={12} md={12} lg={12} style={{ marginTop: "15px" }}>
                    <Divider fullWidth />
                  </GridItem>


                  <GridItem xs={12} sm={12} md={6} lg={3}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Criado em</span>
                      <Tooltip arrow title={moment(this.state.data.createdAt).format("DD/MM/YYYY HH:mm")}>
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
                  <Tab label={"Contratos (" + (this.state.contracts.data.total || 0) + ")"} />
                </Tabs>
                <Divider style={{ width: "100%" }} />

                <div role="tabpanel" hidden={this.state.tabs.value !== 0}>
                  {this.state.tabs.value === 0 && (
                    <GridContainer>
                      <GridItem xs={12} sm={6} md={12} lg={12}>
                        {this.state.contracts.err && (
                          <div style={{ textAlign: "center" }}>
                            <h4>Não foi possível carregar os contratos da pasta.</h4>
                            <Button color="primary" onClick={(e) => this.searchContracts()}>
                              Tentar novamente
                            </Button>
                          </div>
                        )}

                        {this.state.contracts.loading && (
                          <h1
                            style={{
                              textAlign: "center",
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <img
                              style={{ height: "100px" }}
                              src="/load-small.gif"
                              alt="Carregando..."
                            />
                          </h1>
                        )}

                        {!this.state.contracts.err &&
                          !this.state.contracts.loading && (
                            <div>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{ textAlign: "center", width: "40%", }} >Nome do advogado
                                      <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }}>
                                        <a href="#">
                                          {(this.state.contracts.data.sortBy !== "lawyer_name" || this.state.contracts.data.sortDirection === "desc") && (<ArrowDropDownIcon color={this.state.contracts.data.sortBy === "lawyer_name" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "lawyer_name", "asc"); }} />)}
                                          {this.state.contracts.data.sortBy === "lawyer_name" && this.state.contracts.data.sortDirection === "asc" && (<ArrowDropUpIcon color={this.state.contracts.data.sortBy === "lawyer_name" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "lawyer_name", "desc"); }} />)}
                                        </a>
                                      </div>
                                    </TableCell>

                                    <TableCell style={{ textAlign: "center" }}>Status</TableCell>

                                    <TableCell style={{ textAlign: "center" }}>Criado em
                                      <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }} >
                                        <a href="#">
                                          {(this.state.contracts.data.sortBy !== "created_at" || this.state.contracts.data.sortDirection === "desc") && (<ArrowDropDownIcon color={this.state.contracts.data.sortBy === "created_at" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "created_at", "asc"); }} />)}
                                          {this.state.contracts.data.sortBy === "created_at" && this.state.contracts.data.sortDirection === "asc" && (<ArrowDropUpIcon color={this.state.contracts.data.sortBy === "created_at" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "created_at", "desc"); }} />)}
                                        </a>
                                      </div>
                                    </TableCell>

                                    <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {this.state.contracts.data.contracts && this.state.contracts.data.contracts.length > 0 && this.state.contracts.data.contracts.map(
                                    (prop, key) => {
                                      return (
                                        <TableRow key={key}>
                                          <TableCell style={{ padding: "5px 16px", width: "40%", }} >{prop.lawyerName}</TableCell>

                                          <TableCell style={{ padding: "5px 16px", textAlign: "center" }} >
                                            {{
                                              CURRENT: "Vigente",
                                              FILED: "Arquivado",
                                            }[prop.status]}
                                          </TableCell>

                                          <TableCell style={{ padding: "5px 16px", textAlign: "center", }} >
                                            <Moment date={prop.createdAt} format="DD/MM/YYYY" />
                                          </TableCell>

                                          <TableCell style={{ padding: "5px 16px", textAlign: "center", }}>
                                            <Tooltip title="Detalhes" arrow>
                                              <span>
                                                <Button justIcon round color="transparent" onClick={(e) => this.props.history.push("/admin/contracts/" + prop.id)} >
                                                  <DescriptionOutlinedIcon />
                                                </Button>
                                              </span>
                                            </Tooltip>

                                            {prop.attendanceId && (
                                              <Tooltip title="Atendimento" arrow>
                                                <span>
                                                  <Button justIcon round color="transparent" onClick={(e) => this.props.history.push("/admin/attendances/" + prop.attendanceId)} >
                                                    <AssignmentOutlinedIcon />
                                                  </Button>
                                                </span>
                                              </Tooltip>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                                </TableBody>
                              </Table>
                              {this.state.contracts.data.contracts && this.state.contracts.data.contracts.length === 0 && <h5 style={{ textAlign: "center" }}>Nenhum contrato encontrado.</h5>}
                            </div>)}

                        <GridContainer>
                          <GridItem sm={12} style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex" }}>
                              <Tooltip title="Início" arrow>
                                <div>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    disabled={
                                      this.state.contracts.data.offset === 0
                                    }
                                    onClick={(e) => this.searchContracts(0)}
                                  >
                                    <SkipPreviousIcon />
                                  </Button>
                                </div>
                              </Tooltip>
                              <Tooltip title="Anterior" arrow>
                                <div>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    disabled={
                                      this.state.contracts.data.offset === 0
                                    }
                                    onClick={(e) =>
                                      this.searchContracts(
                                        this.state.contracts.data.offset -
                                        this.state.contracts.data.limit
                                      )
                                    }
                                  >
                                    <NavigateBeforeIcon />
                                  </Button>
                                </div>
                              </Tooltip>

                              <p>
                                Exibindo{" "}
                                {Math.min(
                                  this.state.contracts.data.total,
                                  this.state.contracts.data.offset +
                                  this.state.contracts.data.limit
                                )}{" "}
                                de {this.state.contracts.data.total}
                              </p>

                              <Tooltip title="Próxima" arrow>
                                <div>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    disabled={
                                      this.state.contracts.data.offset +
                                      this.state.contracts.data.limit >=
                                      this.state.contracts.data.total
                                    }
                                    onClick={(e) =>
                                      this.searchContracts(
                                        this.state.contracts.data.offset +
                                        this.state.contracts.data.limit
                                      )
                                    }
                                  >
                                    <NavigateNextIcon />
                                  </Button>
                                </div>
                              </Tooltip>

                              <Tooltip title="Última" arrow>
                                <div>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    disabled={
                                      this.state.contracts.data.offset +
                                      this.state.contracts.data.limit >=
                                      this.state.contracts.data.total
                                    }
                                    onClick={(e) =>
                                      this.searchContracts(
                                        this.state.contracts.data.total -
                                        this.state.contracts.data.limit
                                      )
                                    }
                                  >
                                    <SkipNextIcon />
                                  </Button>
                                </div>
                              </Tooltip>
                            </div>
                          </GridItem>
                        </GridContainer>
                      </GridItem>

                      <GridItem xs={12} sm={6} md={12} lg={12}>
                        <Button color="success" onClick={(e) => this.props.history.push("/admin/contracts/create")}>Novo contrato</Button>
                      </GridItem>
                    </GridContainer>
                  )}
                </div>

                <div role="tabpanel" hidden={this.state.tabs.value !== 1}>
                  {
                    this.state.tabs.value === 1 && (
                      <div>
                        <h4>Em construção</h4>
                        <p>
                          Ajude a desenvolver essa página enviando conselhos,
                          sugestões ou outros.
                        </p>
                      </div>
                    )
                      (
                        <GridContainer>
                          <GridItem xs={12} sm={6} md={12} lg={12}>

                            {this.state.files.err && <div style={{ textAlign: "center" }}>
                              <h4>Não foi possível carregar os arquivos da pasta.</h4>
                              <Button color="primary" onClick={e => this.searchFiles()}>Tentar novamente</Button>
                            </div>}

                            {this.state.files.loading &&
                              <h1 style={{ textAlign: "center", position: "absolute", width: "100%", height: "100%" }}>
                                <img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." />
                              </h1>}

                            {!this.state.files.err && !this.state.files.loading &&
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Criado em</TableCell>
                                    <TableCell>Criado por</TableCell>
                                    <TableCell>Ações</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>

                                </TableBody>
                              </Table>}
                          </GridItem>

                          <GridItem xs={12} sm={6} md={12} lg={12}>
                            <Button color="success">Adicionar arquivo</Button>
                          </GridItem>

                        </GridContainer>)
                  }
                </div>
              </CardBody>
            </Card>

            <Button onClick={(e) => this.props.history.goBack()}>Voltar</Button>
          </div>
        )}
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
)(withRouter(FolderDetails));
