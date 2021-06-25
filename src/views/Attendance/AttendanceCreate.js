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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@material-ui/core";
import Button from "components/CustomButtons/Button";
import { connect } from "react-redux";
import CompanySelect from "components/CompanySelect/CompanySelect";
import SearchIcon from "@material-ui/icons/Search";

import Notification from "components/Notifications/Notification";

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

import CheckIcon from "@material-ui/icons/Check";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";

const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);

class AttendanceCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        customerId: "",
        customerName: "",
      },

      customerSearch: {
        display: false,
        query: {
          name: "",
          code: "",
          companyId: null,
        },
        data: {
          limit: 5,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          customers: [],
        },
      },

      notification: {
        display: false,
        severity: "",
        message: "",
      },
    };

    this.selectCustomer = this.selectCustomer.bind(this);
  }

  createAttendance() {
    if (this.isValidToCreate(this.state.data)) {
      axios
        .post(
          "/api/attendances",
          {
            customerId: this.state.data.customerId,
            companyId: this.props.account.companyId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            this.setState({
              creating: false,
              editing: false,
              data: res.data.attendance,
              notification: {
                ...this.state.notification,
                display: true,
                severity: "success",
                message: "Atendimento criado com sucesso.",
              },
            });
            this.props.history.push(
              "/admin/attendances/" + res.data.attendance.id
            );
          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao criar atendimento, tente novamente.",
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
              message: "Falha ao criar atendimento, tente novamente.",
            },
          });
        });
    }
  }

  isValidToCreate(data) {
    let i = 0;
    const invalidFields = {};

    if (!data.customerId) {
      invalidFields.customerId = true;
      i++;
    }

    this.setState({
      validations: {
        ...this.state.validations,
        ...invalidFields,
      },

      notification: {
        ...this.state.notification,
        display: i > 0,
        severity: "danger",
        message: "Selecione um cliente para prosseguir.",
      },
    });

    return i === 0;
  }

  selectCustomer(customer) {
    if (customer.id) {
      this.setState({
        data: {
          ...this.state.data,
          customerId: customer.id,
          customerName: customer.name,
        },
        customerSearch: {
          ...this.state.customerSearch,
          display: false,
        },
      });
    }
  }

  searchCustomer(companyId) {
    if (
      !companyId &&
      !this.state.customerSearch.query.companyId &&
      !this.props.account.companyId
    ) {
      return;
    }

    const params = {
      offset: 0,
      limit: 5,
      sortBy: "created_at",
      sortDirection: "desc",
      active: "true",
      companyId:
        companyId ||
        this.state.customerSearch.query.companyId ||
        this.props.account.companyId,
    };

    if (
      this.state.customerSearch.query.name &&
      this.state.customerSearch.query.name.trim().length > 0
    ) {
      params.name = this.state.customerSearch.query.name;
    }

    if (
      this.state.customerSearch.query.code &&
      this.state.customerSearch.query.code.trim().length > 0
    ) {
      params.code = this.state.customerSearch.query.code;
    }

    axios
      .get("/api/customers", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        this.setState({
          customerSearch: {
            ...this.state.customerSearch,
            data: {
              ...this.state.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: res.data.total,
              customers: res.data.data || [],
            },
          },
        });
      })
      .catch((err) => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "danger",
            message: "Falha ao buscar clientes, tente novamente.",
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

        <Dialog open={this.state.customerSearch.display} onClose={() => { this.setState({ customerSearch: { ...this.state.customerSearch, display: false }, }); }}>
          <DialogTitle>Selecione um cliente</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>
                <GridItem sm={12}>
                  <CompanySelect
                    labelText="Unidade"
                    inputProps={{
                      onChange: (e) => {
                        this.setState({
                          customerSearch: {
                            ...this.state.customerSearch,
                            query: {
                              ...this.state.customerSearch.query,
                              companyId: e.target.value,
                            },
                          },
                        });
                        this.searchCustomer(e.target.value);
                      },
                      value: this.state.customerSearch.query.companyId,
                    }}
                  />
                </GridItem>

                <GridItem sm={12} md={10} lg={10}>
                  <CustomInput
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      placeholder: "Nome",
                      onKeyPress: (e) => {
                        if (e.key === "Enter") {
                          this.searchCustomer();
                        }
                      },
                      onChange: (e) =>
                        this.setState({
                          customerSearch: {
                            ...this.state.customerSearch,
                            query: {
                              ...this.state.customerSearch.query,
                              name: e.target.value,
                            },
                          },
                        }),
                      value: this.state.customerSearch.query.name,
                    }}
                  />
                </GridItem>

                <GridItem sm={12} md={2} lg={2}>
                  <CustomInput>
                    <Button
                      color="primary"
                      justIcon
                      round
                      onClick={(e) => this.searchCustomer()}
                    >
                      <SearchIcon />
                    </Button>
                  </CustomInput>
                </GridItem>
              </GridContainer>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ textAlign: "center", width: "70%" }}>
                      Nome
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.customerSearch.data &&
                    this.state.customerSearch.data.customers &&
                    this.state.customerSearch.data.customers.length > 0 &&
                    this.state.customerSearch.data.customers.map(
                      (prop, key) => {
                        return (
                          <TableRow key={key}>
                            <TableCell
                              style={{ padding: "5px 16px", width: "70%" }}
                            >
                              {prop.name}{" "}
                              <ElderTooltip birthDate={prop.birthDate} deathDate={prop.deathDate} />
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <Tooltip arrow title="Selecionar">
                              <span>
                              <Button round justIcon color="success" onClick={(e) => this.selectCustomer(prop)}><CheckIcon /></Button>
                              </span>
                              </Tooltip>
                              </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                </TableBody>
              </Table>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="transparent"
              autoFocus
              onClick={() => {
                this.setState({
                  customerSearch: {
                    ...this.state.customerSearch,
                    display: false,
                  },
                });
              }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        <div>
          <h4 style={{ textAlign: "center" }}>
            Selecione um cliente para iniciar o atendimento
          </h4>
          <GridContainer>
            <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
            <GridItem xs={10} sm={9} md={8} lg={6}>
              <CustomInput
                id="customer-search"
                labelText="Cliente"
                formControlProps={{ fullWidth: true }}
                inputProps={{
                  value: this.state.data.customerName,
                  onClick: (e) => {
                    if (!e.target.value) {
                      this.setState({
                        customerSearch: {
                          ...this.state.customerSearch,
                          display: true,
                          query: {
                            ...this.state.customerSearch.query,
                            companyId: this.props.account.companyId,
                          },
                        },
                      });
                      this.searchCustomer();
                    }
                  },
                }}
              />
            </GridItem>

            <GridItem xs={2}>
              <CustomInput>
                <Button
                  color="primary"
                  justIcon
                  round
                  onClick={() => {
                    this.setState({
                      customerSearch: {
                        ...this.state.customerSearch,
                        display: true,
                        query: {
                          ...this.state.customerSearch.query,
                          companyId: this.props.account.companyId,
                        },
                      },
                    });
                    this.searchCustomer();
                  }}
                >
                  <SearchIcon />
                </Button>
              </CustomInput>
            </GridItem>
          </GridContainer>
        </div>

        <div>
          <Button
            onClick={(e) => this.props.history.push("/admin/attendances")}
          >
            Voltar
          </Button>
          <Button color="success" onClick={this.createAttendance.bind(this)}>
            Criar
          </Button>
        </div>
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

export default connect(mapStateToProps)(withRouter(AttendanceCreate));
