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

class FolderCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,

      data: {
        companyId: "",
        customerId: "",
        customerName: "",
        notes: "",
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

  componentDidMount() {
    this.setState({
      data: {
        ...this.state.data,
        companyId: this.props.account.companyId,
      },
    });
  }

  createFolder() {
    if (this.isValidToCreate(this.state.data)) {
      axios
        .post(
          "/api/folders",
          {
            customerId: this.state.data.customerId,
            companyId: this.state.data.companyId,
            notes: this.state.data.notes,
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
              data: res.data,
              notification: {
                ...this.state.notification,
                display: true,
                severity: "success",
                message: "Pasta criado com sucesso.",
              },
            });
            this.props.history.push("/admin/folders/" + res.data.id);
          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao criar pasta, tente novamente.",
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
              message: "Falha ao criar pasta, tente novamente.",
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

    if (!data.companyId) {
      invalidFields.companyId = true;
      i++;
    }

    this.setState({
      notification: {
        ...this.state.notification,
        display: i > 0,
        severity: "danger",
        message: invalidFields.customerId
          ? "Selecione um cliente para prosseguir."
          : "Selecione uma unidade para prosseguir.",
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

        <Dialog
          open={this.state.customerSearch.display}
          onClose={() => {
            this.setState({
              customerSearch: { ...this.state.customerSearch, display: false },
            });
          }}
        >
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
                              <ElderTooltip birthDate={prop.birthDate} />
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <Tooltip title="Selecionar" arrow>
                                <span>
                                  <Button
                                    justIcon
                                    round
                                    color="transparent"
                                    onClick={(e) => this.selectCustomer(prop)}
                                  >
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
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="success"
              style={{ float: "left" }}
              onClick={() => {
                this.props.history.push("/admin/customers/create");
              }}
            >
              Adicionar Cliente
            </Button>
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

        {this.state.currentStep === 1 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Em qual unidade essa pasta será criada?
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CompanySelect
                  labelText="Unidade"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: this.state.data.companyId,
                    onChange: (e) =>
                      this.setState({
                        data: { ...this.state.data, companyId: e.target.value },
                      }),
                  }}
                />
              </GridItem>
            </GridContainer>
          </div>
        )}

        {this.state.currentStep === 2 && (
          <div>
            <h4 style={{ textAlign: "center" }}>Qual o cliente dessa pasta?</h4>
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
        )}

        {this.state.currentStep === 3 && (
          <div>
            <h4 style={{ textAlign: "center" }}>Observações</h4>
            <h4 style={{ textAlign: "center" }}>
              <small>As observações podem ser alteradas posteriormente</small>
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
                  textarea
                  labelText="Observações"
                  formControlProps={{ fullWidth: true }}
                  labelProps={{ shrink: true }}
                  inputProps={{
                    rows: 5,
                    value: this.state.data.notes,
                    onChange: (e) =>
                      this.setState({
                        data: { ...this.state.data, notes: e.target.value },
                      }),
                  }}
                />
              </GridItem>
            </GridContainer>
          </div>
        )}

        <div>
          {this.state.currentStep === 1 && (
            <Button onClick={(e) => this.props.history.push("/admin/folders")}>
              Voltar
            </Button>
          )}
          {this.state.currentStep === 1 && (
            <Button
              color="success"
              onClick={(e) => this.setState({ currentStep: 2 })}
            >
              Avançar
            </Button>
          )}

          {this.state.currentStep === 2 && (
            <Button onClick={(e) => this.setState({ currentStep: 1 })}>
              Voltar
            </Button>
          )}
          {this.state.currentStep === 2 && (
            <Button
              color="success"
              onClick={(e) => {
                if (this.state.data.customerId) {
                  this.setState({ currentStep: 3 });
                } else {
                  this.setState({
                    notification: {
                      ...this.state.notification,
                      display: true,
                      severity: "danger",
                      message: "Selecione um cliente para prosseguir.",
                    },
                  });
                }
              }}
            >
              Avançar
            </Button>
          )}

          {this.state.currentStep === 3 && (
            <Button onClick={(e) => this.setState({ currentStep: 2 })}>
              Voltar
            </Button>
          )}
          {this.state.currentStep === 3 && (
            <Button color="success" onClick={this.createFolder.bind(this)}>
              Criar
            </Button>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
  };
};

export default connect(mapStateToProps)(withRouter(FolderCreate));
