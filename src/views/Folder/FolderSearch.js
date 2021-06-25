import {
  Hidden,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  withStyles,
} from "@material-ui/core";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button.js";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import React from "react";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";

import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

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
import Notification from "components/Notifications/Notification";
import Moment from "react-moment";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import CustomInput from "components/CustomInput/CustomInput";
import CompanySelect from "components/CompanySelect/CompanySelect";
import { Search } from "@material-ui/icons";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";

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

class FolderPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {
        customerName: "",
        status: "OPEN",
        companyId: null,
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
        total: 1,
        sortBy: "created_at",
        sortDirection: "desc",
        folders: [],
      },
      notification: {
        display: false,
        message: "",
        severity: "",
      },
    };
  }

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    this.setState({
      params: {
        ...this.state.params,
        companyId: this.props.account ? this.props.account.companyId : null,
        customerName: query.get("customerName") || "",
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
      this.state.params.code &&
      this.state.params.code.trim().length > 0
    ) {
      params.code = this.state.params.code;
    }

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

    if (this.state.params.createdAtStartDate) {
      params.createdAtStartDate = this.state.params.createdAtStartDate;
    }

    if (this.state.params.createdAtEndDate) {
      params.createdAtEndDate = this.state.params.createdAtEndDate;
    }

    if (customerId) {
      params.customerId = customerId;
    }

    axios
      .get("/api/folders", {
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
            folders: res.data.data || [],
          },
        });
      })
      .catch((err) => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "danger",
            message: "Falha ao buscar pastas, tente novamente.",
          },
        });
      });
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
              <GridItem xs={12} sm={12} md={4} lg={4}>
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
                  labelText="Código"
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
                          code: e.target.value,
                        },
                      }),
                    value: this.state.params.code,
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
                  <option value={"OPEN"}>Aberta</option>
                  <option value={"ARCHIVED"}>Arquivada</option>
                </CustomInput>
              </GridItem>

              <GridItem xs={12} sm={12} md={4} lg={4}>
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
                    labelText="Nome do criador"
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
          <GridItem xs={12}>
            <Card>
              <CardBody>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: "center" }}>
                        Pasta
                      </TableCell>
                      <TableCell style={{ textAlign: "center", width: "30%" }}>
                        Cliente
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
                                    this.state.data.sortBy === "customer_name"
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
                                    this.state.data.sortBy === "customer_name"
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
                      <TableCell style={{ textAlign: "center" }}>
                        Status
                      </TableCell>
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
                      <TableCell style={{ textAlign: "center", width: "20%" }}>
                        Criado por
                        <div
                          style={{
                            display: "inline",
                            verticalAlign: "top",
                            padding: "0 5px",
                          }}
                        >
                          <a href="#">
                            {(this.state.data.sortBy !== "created_by_name" ||
                              this.state.data.sortDirection === "desc") && (
                                <ArrowDropDownIcon
                                  color={
                                    this.state.data.sortBy === "created_by_name"
                                      ? ""
                                      : "disabled"
                                  }
                                  onClick={(e) => {
                                    this.search(
                                      undefined,
                                      undefined,
                                      "created_by_name",
                                      "asc"
                                    );
                                  }}
                                />
                              )}

                            {this.state.data.sortBy === "created_by_name" &&
                              this.state.data.sortDirection === "asc" && (
                                <ArrowDropUpIcon
                                  color={
                                    this.state.data.sortBy === "created_by_name"
                                      ? ""
                                      : "disabled"
                                  }
                                  onClick={(e) => {
                                    this.search(
                                      undefined,
                                      undefined,
                                      "created_by_name",
                                      "desc"
                                    );
                                  }}
                                />
                              )}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.data.folders &&
                      this.state.data.folders.length > 0 &&
                      this.state.data.folders.map((prop, key) => {
                        return (
                          <TableRow key={key}>
                            <TableCell style={{ textAlign: "center" }}>
                              {prop.code}
                            </TableCell>
                            <TableCell style={{ width: "30%" }}>
                              {prop.customerName}{" "}
                              <ElderTooltip
                                birthDate={prop.customerBirthDate}
                                deathDate={prop.customerDeathDate}
                              />
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              {
                                {
                                  OPEN: "Aberta",
                                  ARCHIVED: "Arquivada",
                                }[prop.status]
                              }
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <Moment
                                date={prop.createdAt}
                                format="DD/MM/YYYY"
                              />
                            </TableCell>
                            <TableCell style={{ width: "20%" }}>
                              {prop.createdByName}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: "center",
                                padding: "5px 16px",
                              }}
                            >
                              <Tooltip title="Detalhes" arrow>
                                <span>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    onClick={(e) =>
                                      this.props.history.push(
                                        "/admin/folders/" + prop.id
                                      )
                                    }
                                  >
                                    <FolderOpenIcon />
                                  </Button>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>

                {(!this.state.data.folders ||
                  this.state.data.folders.length === 0) && (
                    <div style={{ width: "100%" }}>
                      <h4 style={{ textAlign: "center" }}>
                        Nenhuma pasta encontrada.
                    </h4>
                      <span>
                        <ArrowDownwardIcon />
                      Clique em{" "}
                        <span style={{ fontWeight: "bold" }}>
                          Nova pasta
                      </span>{" "}
                      para criar uma nova pasta.
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
          onClick={(e) => this.props.history.push("/admin/folders/create")}
        >
          Nova pasta
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

export default connect(mapStateToProps)(
  withStyles(styles)(withRouter(FolderPage))
);
