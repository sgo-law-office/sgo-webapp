import React from "react";
import Moment from "react-moment";

// @material-ui/core components
import { withStyles } from "@material-ui/styles";

import Search from "@material-ui/icons/Search";

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Hidden,
} from "@material-ui/core";
import { connect } from "react-redux";
import CompanySelect from "components/CompanySelect/CompanySelect";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";

import Tooltip from "@material-ui/core/Tooltip";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";

import Notification from "components/Notifications/Notification";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";

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

const styles = (theme) => ({
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0",
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF",
    },
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1",
    },
  },
  searchWrapper: {
    width: "100%",
  },
  margin: {
    margin: "0",
  },
});

class AttendanceSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMoreFilters: false,
      params: {
        customerName: "",
        status: "all",
        companyId: null,
        createdByName: "",
        createdAtStartDate: "",
        createdAtEndDate: "",

        pagination: {
          limit: 10,
          offset: 0,
        },
      },
      data: {
        limit: 10,
        offset: 0,
        total: 0,
        sortBy: "created_by",
        sortDirection: "desc",
        attendances: [],
      },
      notification: {
        display: false,
        message: "",
        severity: "",
      },
    };

    this.search = this.search.bind(this);
  }

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    this.setState({
      params: {
        ...this.state.params,
        companyId: this.props.account ? this.props.account.companyId : null,
        customerName: query.get("customerName"),
      },
    });

    if (this.props.account && this.props.account.companyId) {
      this.search(
        undefined,
        undefined,
        undefined,
        undefined,
        this.props.account.companyId,
        undefined,
        query.get("customerId")
      );
    }
  }

  search(
    offset = 0,
    limit = 10,
    sortBy = "created_at",
    sortDirection = "desc",
    companyId,
    status,
    customerId
  ) {
    if (!this.props.account.companyId && !companyId) {
      return;
    }

    const params = {
      offset: offset,
      limit: limit,
      sortBy: sortBy,
      sortDirection: sortDirection,
      companyId: companyId || this.state.params.companyId,
      status:
        status === "all"
          ? undefined
          : status ||
            (this.state.params.status === "all"
              ? undefined
              : this.state.params.status),
    };

    if (
      this.state.params.customerName &&
      this.state.params.customerName.trim().length > 0
    ) {
      params.customerName = this.state.params.customerName;
    }

    if (
      this.state.params.createdByName &&
      this.state.params.createdByName.trim().length > 0
    ) {
      params.createdByName = this.state.params.createdByName;
    }

    if (
      this.state.params.createdAtStartDate &&
      this.state.params.createdAtStartDate.trim().length > 0
    ) {
      params.createdAtStartDate = this.state.params.createdAtStartDate;
    }

    if (
      this.state.params.createdAtEndDate &&
      this.state.params.createdAtEndDate.trim().length > 0
    ) {
      params.createdAtEndDate = this.state.params.createdAtEndDate;
    }

    if (customerId) {
      params.customerId = customerId;
    }

    axios
      .get("/api/attendances", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        this.setState({
          data: {
            ...this.state.data,
            limit: res.data.limit,
            offset: res.data.offset,
            sortBy: res.data.sortBy,
            sortDirection: res.data.sortDirection,
            total: res.data.total,
            attendances: res.data.data || [],
          },
        });
      })
      .catch((err) => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "danger",
            message: "Falha ao buscar atendimentos, tente novamente.",
          },
        });
      });
  }

  openDetails(attendance) {
    this.props.history.push("/admin/attendances/" + attendance.id);
  }

  render() {
    const { classes } = this.props;
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

        <GridContainer>
          <GridItem xs={12} sm={12} md={11}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={4} lg={6}>
                <CustomInput
                  labelText="Nome do cliente"
                  formControlProps={{
                    fullWidth: true,
                    className: classes.margin + " " + classes.search,
                  }}
                  inputProps={{
                    onKeyPress: (e) => {
                      if (e.key === "Enter") {
                        this.search();
                      }
                    },
                    onChange: (e) =>
                      this.setState({
                        params: {
                          ...this.state.params,
                          customerName: e.target.value,
                        },
                      }),
                    value: this.state.params.customerName,
                  }}
                />
              </GridItem>

              <GridItem xs={12} sm={12} md={2} lg={2}>
                <CustomInput
                  select={true}
                  labelText="Status"
                  inputProps={{
                    onChange: (e) => {
                      this.setState({
                        params: {
                          ...this.state.params,
                          status: e.target.value,
                        },
                      });
                      this.search(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        e.target.value
                      );
                    },
                    value: this.state.params.status,
                  }}
                  formControlProps={{
                    fullWidth: true,
                    className: classes.margin + " " + classes.search,
                  }}
                >
                  <option value={"all"}>Todos</option>
                  <option value={"CREATED"}>Iniciado</option>
                  <option value={"IN_PROGRESS"}>Em progresso</option>
                  <option value={"WAITING_CUSTOMER"}>Aguardando Cliente</option>
                  <option value={"WAITING_INTERNAL"}>
                    Aguardando Pendência
                  </option>
                  <option value={"WAITING_SCHEDULE"}>Aguardando Retorno</option>
                  <option value={"WAITING_OTHER"}>Aguardando</option>
                  <option value={"CONCLUDED"}>Concluído</option>
                </CustomInput>
              </GridItem>

              <GridItem xs={12} sm={12} md={6} lg={4}>
                <CompanySelect
                  id="companyId"
                  labelText="Unidade"
                  formControlProps={{
                    fullWidth: true,
                    className: classes.margin + " " + classes.search,
                  }}
                  inputProps={{
                    onChange: (e) => {
                      this.setState({
                        params: {
                          ...this.state.params,
                          companyId: e.target.value,
                        },
                      });
                      this.search(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        e.target.value
                      );
                    },
                    value: this.state.params.companyId,
                  }}
                />
              </GridItem>
            </GridContainer>

            {this.state.displayMoreFilters && (
              <GridContainer>
                <GridItem xs={12} sm={12} md={4} lg={6}>
                  <CustomInput
                    labelText="Nome do atendente"
                    formControlProps={{
                      fullWidth: true,
                      className: classes.margin + " " + classes.search,
                    }}
                    inputProps={{
                      onKeyPress: (e) => {
                        if (e.key === "Enter") {
                          this.search();
                        }
                      },
                      onChange: (e) =>
                        this.setState({
                          params: {
                            ...this.state.params,
                            createdByName: e.target.value,
                          },
                        }),
                      value: this.state.params.createdByName,
                    }}
                  />
                </GridItem>

                <GridItem xs={12} sm={12} md={4} lg={3}>
                  <CustomInput
                    labelText="Criado em: Data inicial"
                    labelProps={{ shrink: true }}
                    formControlProps={{
                      fullWidth: true,
                      className: classes.margin + " " + classes.search,
                    }}
                    inputProps={{
                      type: "date",
                      onKeyPress: (e) => {
                        if (e.key === "Enter") {
                          this.search();
                        }
                      },
                      onChange: (e) =>
                        this.setState({
                          params: {
                            ...this.state.params,
                            createdAtStartDate: e.target.value,
                          },
                        }),
                      value: this.state.params.createdAtStartDate,
                    }}
                  />
                </GridItem>

                <GridItem xs={12} sm={12} md={4} lg={3}>
                  <CustomInput
                    labelText="Criado em: Data final"
                    labelProps={{ shrink: true }}
                    formControlProps={{
                      fullWidth: true,
                      className: classes.margin + " " + classes.search,
                    }}
                    inputProps={{
                      type: "date",
                      onKeyPress: (e) => {
                        if (e.key === "Enter") {
                          this.search();
                        }
                      },
                      onChange: (e) =>
                        this.setState({
                          params: {
                            ...this.state.params,
                            createdAtEndDate: e.target.value,
                          },
                        }),
                      value: this.state.params.createdAtEndDate,
                    }}
                  />
                </GridItem>
              </GridContainer>
            )}

            <a
              href="#"
              onClick={(e) => {
                this.setState({
                  displayMoreFilters: !this.state.displayMoreFilters,
                });
                e.preventDefault();
              }}
            >
              <small>
                Exibir {this.state.displayMoreFilters && "menos"}{" "}
                {!this.state.displayMoreFilters && "mais"} filtros
              </small>
            </a>
          </GridItem>

          <Hidden only={["xs", "sm"]}>
            <GridItem md={1} style={{ textAlign: "center" }}>
              <IconButton size="large" onClick={(e) => this.search()}>
                <Search />
              </IconButton>
            </GridItem>
          </Hidden>

          <Hidden only={["md", "lg", "xl"]}>
            <GridItem xs={12} sm={12} style={{ textAlign: "center" }}>
              <Button
                color="primary"
                size="large"
                onClick={(e) => this.search()}
              >
                <Search /> Buscar
              </Button>
            </GridItem>
          </Hidden>
        </GridContainer>

        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardBody>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: "center", width: "40%" }}>
                        Nome do cliente
                        <div
                          style={{
                            display: "inline",
                            verticalAlign: "top",
                            padding: "0 5px",
                          }}
                        >
                          <a href="#">
                            {(this.state.data.sortBy !== "customer_name" ||
                              this.state.data.sortDirection === "desc") && (
                              <ArrowDropDownIcon
                                color={
                                  this.state.data.sortBy === "name"
                                    ? ""
                                    : "disabled"
                                }
                                onClick={(e) => {
                                  this.search(
                                    undefined,
                                    undefined,
                                    "customer_name",
                                    "asc"
                                  );
                                }}
                              />
                            )}

                            {this.state.data.sortBy === "customer_name" &&
                              this.state.data.sortDirection === "asc" && (
                                <ArrowDropUpIcon
                                  color={
                                    this.state.data.sortBy === "name"
                                      ? ""
                                      : "disabled"
                                  }
                                  onClick={(e) => {
                                    this.search(
                                      undefined,
                                      undefined,
                                      "customer_name",
                                      "desc"
                                    );
                                  }}
                                />
                              )}
                          </a>
                        </div>
                      </TableCell>
                      <Hidden only={["xs"]}>
                        <TableCell style={{ textAlign: "center" }}>
                          Status
                        </TableCell>
                      </Hidden>
                      <Hidden only={["xs", "sm", "md"]}>
                        <TableCell style={{ textAlign: "center" }}>
                          Criado em
                          <div
                            style={{
                              display: "inline",
                              verticalAlign: "top",
                              padding: "0 5px",
                            }}
                          >
                            <a href="#">
                              {(this.state.data.sortBy !== "created_at" ||
                                this.state.data.sortDirection === "desc") && (
                                <ArrowDropDownIcon
                                  color={
                                    this.state.data.sortBy === "created_at"
                                      ? ""
                                      : "disabled"
                                  }
                                  onClick={(e) => {
                                    this.search(
                                      undefined,
                                      undefined,
                                      "created_at",
                                      "asc"
                                    );
                                  }}
                                />
                              )}

                              {this.state.data.sortBy === "created_at" &&
                                this.state.data.sortDirection === "asc" && (
                                  <ArrowDropUpIcon
                                    color={
                                      this.state.data.sortBy === "created_at"
                                        ? ""
                                        : "disabled"
                                    }
                                    onClick={(e) => {
                                      this.search(
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
                      </Hidden>
                      <Hidden only={["xs", "sm"]}>
                        <TableCell style={{ textAlign: "center" }}>
                          Criado por
                        </TableCell>
                      </Hidden>
                      <TableCell style={{ textAlign: "center" }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.data.attendances &&
                      this.state.data.attendances.length > 0 &&
                      this.state.data.attendances.map((prop, key) => {
                        return (
                          <TableRow key={key}>
                            <TableCell
                              style={{ padding: "5px 16px", width: "40%" }}
                            >
                              {prop.customerName}{" "}
                              <ElderTooltip
                                birthDate={prop.customerBirthDate}
                              />
                            </TableCell>
                            <Hidden only={["xs"]}>
                              <TableCell
                                style={{
                                  padding: "5px 16px",
                                  textAlign: "center",
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
                                  }[prop.currentStatus]
                                }
                              </TableCell>
                            </Hidden>
                            <Hidden only={["xs", "sm", "md"]}>
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
                            </Hidden>
                            <Hidden only={["xs", "sm"]}>
                              <TableCell
                                style={{
                                  padding: "5px 16px",
                                  textAlign: "center",
                                }}
                              >
                                {prop.createdByName}
                              </TableCell>
                            </Hidden>
                            <TableCell
                              style={{
                                padding: "5px 16px",
                                textAlign: "center",
                              }}
                            >
                              <Tooltip title="Detalhes" arrow>
                                <span>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    onClick={(e) => this.openDetails(prop)}
                                  >
                                    <AssignmentOutlinedIcon />
                                  </Button>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>

                {this.state.data.attendances.length === 0 && (
                  <div style={{ width: "100%" }}>
                    <h4 style={{ textAlign: "center" }}>
                      Nenhum atendimento encontrado.
                    </h4>
                    <span>
                      <ArrowDownwardIcon />
                      Clique em{" "}
                      <span style={{ fontWeight: "bold" }}>
                        Novo atendimento
                      </span>{" "}
                      para criar um novo atendimento.
                    </span>
                  </div>
                )}

                <GridContainer>
                  <GridItem sm={12} style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex" }}>
                      <Tooltip title="Início" arrow>
                        <div>
                          <Button
                            justIcon
                            round
                            color="transparent"
                            disabled={this.state.data.offset === 0}
                            onClick={(e) => this.search(0)}
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
                            disabled={this.state.data.offset === 0}
                            onClick={(e) =>
                              this.search(
                                this.state.data.offset - this.state.data.limit
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
                          this.state.data.total,
                          this.state.data.offset + this.state.data.limit
                        )}{" "}
                        de {this.state.data.total}
                      </p>

                      <Tooltip title="Próxima" arrow>
                        <div>
                          <Button
                            justIcon
                            round
                            color="transparent"
                            disabled={
                              this.state.data.offset + this.state.data.limit >=
                              this.state.data.total
                            }
                            onClick={(e) =>
                              this.search(
                                this.state.data.offset + this.state.data.limit
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
                              this.state.data.offset + this.state.data.limit >=
                              this.state.data.total
                            }
                            onClick={(e) =>
                              this.search(
                                this.state.data.total - this.state.data.limit
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
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>

        <Button
          color="success"
          onClick={(e) => this.props.history.push("/admin/attendances/create")}
        >
          Novo atendimento
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
  };
};

export default connect(mapStateToProps)(withStyles(styles)(AttendanceSearch));
