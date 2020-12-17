import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { withRouter } from "react-router-dom";
import CustomInput from "components/CustomInput/CustomInput";
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
import CardBody from "components/Card/CardBody";
import Card from "components/Card/Card";

import Button from "components/CustomButtons/Button";
import { connect } from "react-redux";

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

import moment from "moment";

import Moment from "react-moment";
import AttendanceHistoryComponent from "./AttendanceHistoryComponent";
import AttendanceCreate from "./AttendanceCreate";
import Axios from "axios";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";

import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";

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

class AttendanceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      creating: false,
      editing: false,
      notFound: false,
      idFromUrl: null,

      data: this.getInitialDataState(),

      tabs: {
        value: 0,
        historyCount: null,
      },

      contracts: {
        init: false,
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
      customerId: null,
      customerName: "",
      createdByName: "",
      status: "",
      contractsSummary: {
        total: 0,
        open: 0,
      },
      paymentsSummary: {
        total: 0,
        open: 0,
      },
      schedulesSummary: {
        total: 0,
        open: 0,
      },
    };
  }

  componentDidMount() {
    const data = this.props.attendance || { ...this.state.data };

    this.setState({
      creating:
        this.props.history.location.pathname === "/admin/attendances/create",
      editing:
        this.props.history.location.pathname === "/admin/attendances/create",
      data,
    });

    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      this.loadAttendance();
    }
  }

  loadAttendance(force) {
    if (
      force ||
      (this.props.match && this.props.match.params.id && !this.state.data.id)
    ) {
      axios
        .get(
          "/api/attendances/" + this.props.match.params.id + ":summary",
          this.state.data,
          {
            headers: {
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            this.setState({
              idFromUrl: this.props.match.params.id,
              creating: false,
              editing: false,
              data: {
                ...this.state.data,
                ...res.data,
              },
            });
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

    axios
      .get("/api/attendances/" + this.state.data.id + "/contracts", {
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
        <Dialog
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
              <h2>Não foi possível encontrar o atendimento</h2>
              <Button
                onClick={(e) => this.props.history.push("/admin/attendances")}
              >
                Voltar
              </Button>
            </GridItem>
          </GridContainer>
        )}

        {!this.state.notFound && (
          <div>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                {this.state.creating && <AttendanceCreate />}

                {!this.state.creating && (
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
                                      "/admin/customers/" +
                                        this.state.data.customerId
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
                                      birthDate={
                                        this.state.data.customerBirthDate
                                      }
                                    />
                                  </small>
                                </span>
                              </Tooltip>
                            </CustomInput>
                          </GridItem>

                          <GridItem xs={12} sm={12} md={12} lg={12}>
                            <CustomInput formControlProps={{ fullWidth: true }}>
                              <span>Status</span>
                              <span
                                style={{
                                  fontWeight: "bold",
                                  marginLeft: "10px",
                                }}
                              >
                                {
                                  {
                                    CREATED: "Iniciado",
                                    IN_PROGRESS: "Em progresso",
                                    CONCLUDED: "Concluído",
                                    WAITING_CUSTOMER: "Aguardando Cliente",
                                    WAITING_INTERNAL:
                                      "Aguardando Pendência Interna",
                                    WAITING_SCHEDULE: "Aguardando Retorno",
                                    WAITING_OTHER: "Aguardando",
                                  }[this.state.data.status]
                                }
                              </span>
                            </CustomInput>
                          </GridItem>

                          <GridItem xs={12} sm={6} md={6} lg={4}>
                            <CustomInput formControlProps={{ fullWidth: true }}>
                              <span>Criado em</span>
                              <Tooltip
                                arrow
                                title={moment(this.state.data.createdAt).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              >
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    marginLeft: "10px",
                                  }}
                                >
                                  <Moment
                                    date={this.state.data.createdAt}
                                    format="DD [de] MMMM [de] YYYY"
                                  />
                                </span>
                              </Tooltip>
                            </CustomInput>
                          </GridItem>

                          <GridItem xs={12} sm={6} md={6} lg={8}>
                            <CustomInput formControlProps={{ fullWidth: true }}>
                              <span>Criado por</span>
                              <span
                                style={{
                                  fontWeight: "bold",
                                  marginLeft: "10px",
                                }}
                              >
                                {this.state.data.createdByName}
                              </span>
                            </CustomInput>
                          </GridItem>

                          {this.state.data.lastUpdatedAt && (
                            <GridItem xs={12} sm={6} md={6} lg={4}>
                              <CustomInput
                                formControlProps={{ fullWidth: true }}
                              >
                                <span>Ultima vez atualizado em</span>
                                <Tooltip
                                  arrow
                                  title={moment(
                                    this.state.data.lastUpdatedAt
                                  ).format("DD/MM/YYYY HH:mm")}
                                >
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      marginLeft: "10px",
                                    }}
                                  >
                                    <Moment
                                      date={this.state.data.lastUpdatedAt}
                                      format="DD [de] MMMM [de] YYYY"
                                    />
                                  </span>
                                </Tooltip>
                              </CustomInput>
                            </GridItem>
                          )}

                          {this.state.data.lastUpdatedAt && (
                            <GridItem xs={12} sm={6} md={6} lg={8}>
                              <CustomInput
                                formControlProps={{ fullWidth: true }}
                              >
                                <span>Ultima vez atualizado por</span>
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    marginLeft: "10px",
                                  }}
                                >
                                  {this.state.data.lastUpdatedByName}
                                </span>
                              </CustomInput>
                            </GridItem>
                          )}
                        </GridContainer>
                      </CardBody>
                    </Card>

                    <Card style={{ marginTop: "45px", marginBottom: "45px" }}>
                      <CardBody>
                        <Tabs
                          value={this.state.tabs.value}
                          onChange={(e, v) =>
                            this.setState({
                              tabs: { ...this.state.tabs, value: v },
                            })
                          }
                        >
                          <Tab
                            label={
                              "Histórico" +
                              (this.state.tabs.historyCount === null
                                ? ""
                                : " (" + this.state.tabs.historyCount + ")")
                            }
                          />
                          <Tab
                            label={
                              this.state.contracts.init
                                ? "Contratos (" +
                                  (this.state.contracts.data.total || 0) +
                                  ")"
                                : "Contratos"
                            }
                            onClick={(e) => {
                              if (!this.state.contracts.init) {
                                this.searchContracts();
                              }
                              this.setState({
                                contracts: {
                                  ...this.state.contracts,
                                  init: true,
                                },
                              });
                            }}
                          />
                        </Tabs>
                        <Divider style={{ width: "100%" }} />

                        <div
                          role="tabpanel"
                          hidden={this.state.tabs.value !== 0}
                        >
                          {!this.state.data.id && (
                            <h1 style={{ textAlign: "center" }}>
                              <img
                                style={{ height: "100px" }}
                                src="/load-small.gif"
                                alt="Carregando..."
                              />
                            </h1>
                          )}
                          {this.state.data.id && (
                            <AttendanceHistoryComponent
                              attendanceId={this.state.data.id}
                              loadCallback={(data) =>
                                this.setState({
                                  tabs: {
                                    ...this.state.tabs,
                                    historyCount: data.total,
                                  },
                                })
                              }
                              statusChangeCallback={(newStatus) =>
                                this.loadAttendance(true)
                              }
                            />
                          )}
                        </div>

                        <div
                          role="tabpanel"
                          hidden={this.state.tabs.value !== 1}
                        >
                          {!this.state.data.id && (
                            <h1 style={{ textAlign: "center" }}>
                              <img
                                style={{ height: "100px" }}
                                src="/load-small.gif"
                                alt="Carregando..."
                              />
                            </h1>
                          )}
                          {this.state.data.id && (
                            <GridContainer>
                              <GridItem xs={12} sm={6} md={12} lg={12}>
                                {this.state.contracts.err && (
                                  <div style={{ textAlign: "center" }}>
                                    <h4>
                                      Não foi possível carregar os contratos do
                                      atendimento.
                                    </h4>
                                    <Button
                                      color="primary"
                                      onClick={(e) => this.searchContracts()}
                                    >
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
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell
                                            style={{
                                              textAlign: "center",
                                              width: "40%",
                                            }}
                                          >
                                            Nome do advogado
                                            <div
                                              style={{
                                                display: "inline",
                                                verticalAlign: "top",
                                                padding: "0 5px",
                                              }}
                                            >
                                              <a href="#">
                                                {(this.state.contracts.data
                                                  .sortBy !== "lawyer_name" ||
                                                  this.state.contracts.data
                                                    .sortDirection ===
                                                    "desc") && (
                                                  <ArrowDropDownIcon
                                                    color={
                                                      this.state.contracts.data
                                                        .sortBy === "name"
                                                        ? ""
                                                        : "disabled"
                                                    }
                                                    onClick={(e) => {
                                                      this.searchContracts(
                                                        undefined,
                                                        undefined,
                                                        "lawyer_name",
                                                        "asc"
                                                      );
                                                    }}
                                                  />
                                                )}

                                                {this.state.contracts.data
                                                  .sortBy === "lawyer_name" &&
                                                  this.state.contracts.data
                                                    .sortDirection === "asc" && (
                                                    <ArrowDropUpIcon
                                                      color={
                                                        this.state.contracts
                                                          .data.sortBy === "name"
                                                          ? ""
                                                          : "disabled"
                                                      }
                                                      onClick={(e) => {
                                                        this.searchContracts(
                                                          undefined,
                                                          undefined,
                                                          "lawyer_name",
                                                          "desc"
                                                        );
                                                      }}
                                                    />
                                                  )}
                                              </a>
                                            </div>
                                          </TableCell>

                                          <TableCell
                                            style={{ textAlign: "center" }}
                                          >
                                            Status
                                          </TableCell>

                                          <TableCell
                                            style={{ textAlign: "center" }}
                                          >
                                            Criado em
                                            <div
                                              style={{
                                                display: "inline",
                                                verticalAlign: "top",
                                                padding: "0 5px",
                                              }}
                                            >
                                              <a href="#">
                                                {(this.state.contracts.data
                                                  .sortBy !== "created_at" ||
                                                  this.state.contracts.data
                                                    .sortDirection ===
                                                    "desc") && (
                                                  <ArrowDropDownIcon
                                                    color={
                                                      this.state.contracts.data
                                                        .sortBy === "created_at"
                                                        ? ""
                                                        : "disabled"
                                                    }
                                                    onClick={(e) => {
                                                      this.searchContracts(
                                                        undefined,
                                                        undefined,
                                                        "created_at",
                                                        "asc"
                                                      );
                                                    }}
                                                  />
                                                )}

                                                {this.state.contracts.data
                                                  .sortBy === "created_at" &&
                                                  this.state.contracts.data
                                                    .sortDirection === "asc" && (
                                                    <ArrowDropUpIcon
                                                      color={
                                                        this.state.contracts
                                                          .data.sortBy ===
                                                        "created_at"
                                                          ? ""
                                                          : "disabled"
                                                      }
                                                      onClick={(e) => {
                                                        this.searchContracts(
                                                          undefined,
                                                          undefined,
                                                          "created_at",
                                                          "desc"
                                                        );
                                                      }}
                                                    />
                                                  )}
                                              </a>
                                            </div>
                                          </TableCell>

                                          <TableCell
                                            style={{ textAlign: "center" }}
                                          >
                                            Ações
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>

                                      <TableBody>
                                        {this.state.contracts.data.contracts &&
                                          this.state.contracts.data.contracts
                                            .length > 0 &&
                                          this.state.contracts.data.contracts.map(
                                            (prop, key) => {
                                              return (
                                                <TableRow key={key}>
                                                  <TableCell
                                                    style={{
                                                      padding: "5px 16px",
                                                      width: "40%",
                                                    }}
                                                  >
                                                    {prop.lawyerName}
                                                  </TableCell>

                                                  <TableCell
                                                    style={{
                                                      padding: "5px 16px",
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {
                                                      {
                                                        CURRENT: "Vigente",
                                                        FILED: "Arquivado",
                                                      }[prop.status]
                                                    }
                                                  </TableCell>

                                                  <TableCell
                                                    style={{
                                                      padding: "5px 16px",
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    <Moment
                                                      date={prop.createdAt}
                                                      format="DD/MM/YYYY"
                                                    />
                                                  </TableCell>

                                                  <TableCell
                                                    style={{
                                                      padding: "5px 16px",
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    <Tooltip
                                                      title="Detalhes"
                                                      arrow
                                                    >
                                                      <span>
                                                        <Button
                                                          justIcon
                                                          round
                                                          color="transparent"
                                                          onClick={(e) =>
                                                            this.props.history.push(
                                                              "/admin/contracts/" +
                                                                prop.id
                                                            )
                                                          }
                                                        >
                                                          <DescriptionOutlinedIcon />
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
                                  )}

                                <GridContainer>
                                  <GridItem
                                    sm={12}
                                    style={{ textAlign: "right" }}
                                  >
                                    <div style={{ display: "inline-flex" }}>
                                      <Tooltip title="Início" arrow>
                                        <div>
                                          <Button
                                            justIcon
                                            round
                                            color="transparent"
                                            disabled={
                                              this.state.contracts.data
                                                .offset === 0
                                            }
                                            onClick={(e) =>
                                              this.searchContracts(0)
                                            }
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
                                              this.state.contracts.data
                                                .offset === 0
                                            }
                                            onClick={(e) =>
                                              this.searchContracts(
                                                this.state.contracts.data
                                                  .offset -
                                                  this.state.contracts.data
                                                    .limit
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
                                                this.state.contracts.data
                                                  .limit >=
                                              this.state.contracts.data.total
                                            }
                                            onClick={(e) =>
                                              this.searchContracts(
                                                this.state.contracts.data
                                                  .offset +
                                                  this.state.contracts.data
                                                    .limit
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
                                                this.state.contracts.data
                                                  .limit >=
                                              this.state.contracts.data.total
                                            }
                                            onClick={(e) =>
                                              this.searchContracts(
                                                this.state.contracts.data
                                                  .total -
                                                  this.state.contracts.data
                                                    .limit
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
                                <Button
                                  color="success"
                                  onClick={(e) =>
                                    this.props.history.push(
                                      "/admin/contracts/create?atendanceId=" +
                                        this.state.data.id
                                    )
                                  }
                                >
                                  Adicionar novo contrato
                                </Button>
                              </GridItem>
                            </GridContainer>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {!this.state.creating && !this.state.editing && (
                  <div>
                    <Button
                      onClick={(e) =>
                        this.props.history.push("/admin/attendances")
                      }
                    >
                      Voltar
                    </Button>
                  </div>
                )}
              </GridItem>
            </GridContainer>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    jwt: state.jwt,
    account: state.account,
    common: {
      data: {
        states: state.common.data.states,
      },
    },
  };
};

export default connect(mapStateToProps)(withRouter(AttendanceDetails));
