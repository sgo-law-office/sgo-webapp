import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CompanySelect from "components/CompanySelect/CompanySelect";
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
  TextField,
  Tooltip,
} from "@material-ui/core";
import CustomInput from "components/CustomInput/CustomInput";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";
import CheckIcon from "@material-ui/icons/Check";
import SearchIcon from "@material-ui/icons/Search";

import Button from "components/CustomButtons/Button";
import Notification from "components/Notifications/Notification";

import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';


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
import { fetchCourts } from "store/actions";
import { fetchProcessActions } from "store/actions";

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

class ProcessCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        contractId: null,
        customerId: null,
        companyId: null,
        lawyerId: null,
        courtId: null,
        customerName: "",
        lawyerName: "",
        courtName: "",
        code: "",
        action: ""
      },

      customerSearch: {
        display: false,
        query: {
          name: "",
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

      lawyerSearch: {
        display: false,
        query: {
          name: "",
          companyId: null,
        },
        data: {
          limit: 5,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          lawyers: [],
        },
      },

      courtSearch: {
        display: false,
        query: {
          name: "",
        },
        pagination: {
          offset: 0,
          limit: 10,
          total: 0
        },
      },

      actionSearch: {
        pagination: {
          offset: 0,
          limit: 10,
          total: 0
        }
      },

      currentStep: 0,

      notification: {
        display: false,
        message: "",
        severity: "",
      },
    };
  }

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    const contractId = query.get("contractId");

    this.setState({
      data: {
        ...this.state.data,
        companyId: this.props.account.companyId,
      },
    });

    if (contractId) {
      axios
        .get("/api/contracts/" + contractId + ":summary", {
          headers: {
            Accept: "application/json",
          },
        })
        .then((res) => {
          this.setState({
            data: {
              ...this.state.data,
              contractId: res.data.id,
              customerId: res.data.customerId,
              companyId: res.data.companyId,
              lawyerId: res.data.lawyerId,
            },
            currentStep: 4,
          });
          this.fetchCustomerName(res.data.customerId);
        })
        .catch((err) => {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "warning",
              message:
                "Falha ao buscar contrato, recarregue a página para tentar novamente, ou prossiga com a criação e anexe o contrato posteriormente.",
            },
            currentStep: 1,
          });
        });
    } else {
      this.setState({
        currentStep: 1,
      });
    }
  }

  fetchCustomerName(customerId) {
    if (customerId) {
      axios
        .get("/api/customers/" + customerId, {
          headers: {
            Accept: "application/json",
          },
        })
        .then((res) => {
          this.setState({
            data: {
              ...this.state.data,
              customerName: res.data.name,
            },
          });
        })
        .catch((err) => {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message:
                "Falha ao buscar cliente, recarregue a página para tentar novamente.",
            },
          });
        });
    }
  }

  createProcess() {
    const { data } = this.state;

    if (
      !data.companyId ||
      !data.customerId ||
      !data.lawyerId
    ) {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "Falha ao criar processo, recarregue a página para tentar novamente.",
        },
      });
      return;
    }

    axios
      .post(
        "/api/processes",
        {
          code: data.code,
          customerId: data.customerId,
          companyId: data.companyId,
          lawyerId: data.lawyerId,
          courtId: data.courtId,
          contractId: data.contractId,
          action: data.action
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.status === 201) {
          this.props.history.push("/admin/processes/" + res.data.id);
        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao criar processo, tente novamente.",
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
            message: "Falha ao criar processo, tente novamente.",
          },
        });
      });
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
              ...this.state.customerSearch.data,
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

  selectLawyer(lawyer) {
    if (lawyer.accountId) {
      this.setState({
        data: {
          ...this.state.data,
          lawyerId: lawyer.accountId,
          lawyerName: lawyer.name,
        },
        lawyerSearch: {
          ...this.state.lawyerSearch,
          display: false,
        },
      });
    }
  }

  searchLawyer(companyId) {
    if (
      !companyId &&
      !this.state.lawyerSearch.query.companyId &&
      !this.props.account.companyId
    ) {
      return;
    }

    const params = {
      offset: 0,
      limit: 5,
      sortBy: "created_at",
      sortDirection: "desc",
      companyId:
        companyId ||
        this.state.lawyerSearch.query.companyId ||
        this.props.account.companyId,
    };

    if (
      this.state.lawyerSearch.query.name &&
      this.state.lawyerSearch.query.name.trim().length > 0
    ) {
      params.name = this.state.lawyerSearch.query.name;
    }

    axios
      .get("/api/lawyers", {
        headers: {
          Accept: "application/json",
        },
        params,
      })
      .then((res) => {
        this.setState({
          lawyerSearch: {
            ...this.state.lawyerSearch,
            data: {
              ...this.state.lawyerSearch.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: res.data.total,
              lawyers: res.data.data || [],
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
            message: "Falha ao buscar advogados, tente novamente.",
          },
        });
      });
  }

  selectCourt(court) {
    if (court.id) {
      this.setState({
        data: {
          ...this.state.data,
          courtId: court.id,
          courtName: court.name,
        },
        courtSearch: {
          ...this.state.courtSearch,
          display: false
        },
      });
    }
  }

  searchCourt() {
    this.props.fetchCourts((courts) => this.setState({ courtSearch: { ...this.state.courtSearch, pagination: { ...this.state.courtSearch.pagination, total: courts.total } } }));
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

        <Dialog
          open={this.state.lawyerSearch.display}
          onClose={() => {
            this.setState({
              lawyerSearch: { ...this.state.lawyerSearch, display: false },
            });
          }}
        >
          <DialogTitle>Selecione um advogado</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>
                <GridItem sm={12}>
                  <CompanySelect
                    labelText="Unidade"
                    inputProps={{
                      onChange: (e) => {
                        this.setState({
                          lawyerSearch: {
                            ...this.state.lawyerSearch,
                            query: {
                              ...this.state.lawyerSearch.query,
                              companyId: e.target.value,
                            },
                          },
                        });
                        this.searchLawyer(e.target.value);
                      },
                      value: this.state.lawyerSearch.query.companyId,
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
                          this.searchLawyer();
                        }
                      },
                      onChange: (e) =>
                        this.setState({
                          lawyerSearch: {
                            ...this.state.lawyerSearch,
                            query: {
                              ...this.state.lawyerSearch.query,
                              name: e.target.value,
                            },
                          },
                        }),
                      value: this.state.lawyerSearch.query.name,
                    }}
                  />
                </GridItem>

                <GridItem sm={12} md={2} lg={2}>
                  <CustomInput>
                    <Button
                      color="primary"
                      justIcon
                      round
                      onClick={(e) => this.searchLawyer()}
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
                  {this.state.lawyerSearch.data &&
                    this.state.lawyerSearch.data.lawyers &&
                    this.state.lawyerSearch.data.lawyers.length > 0 &&
                    this.state.lawyerSearch.data.lawyers.map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell
                            style={{ padding: "5px 16px", width: "70%" }}
                          >
                            {prop.name}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            <Tooltip title="Selecionar" arrow>
                              <span>
                                <Button
                                  justIcon
                                  round
                                  color="transparent"
                                  onClick={(e) => this.selectLawyer(prop)}
                                >
                                  <CheckIcon />
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="success"
              style={{ float: "left" }}
              onClick={() => {
                this.props.history.push("/admin/registrations/lawyers");
              }}
            >
              Adicionar Advogado
            </Button>
            <Button
              color="transparent"
              autoFocus
              onClick={() => {
                this.setState({
                  lawyerSearch: { ...this.state.lawyerSearch, display: false },
                });
              }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.courtSearch.display} fullWidth maxWidth="sm" onClose={() => { this.setState({ courtSearch: { ...this.state.courtSearch, display: false } }); }} >
          <DialogTitle>Selecione uma vara</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>

                <GridItem sm={12} md={12} lg={12}>
                  <CustomInput
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      placeholder: "Nome",
                      onChange: (e) =>
                        this.setState({
                          courtSearch: {
                            ...this.state.courtSearch,
                            query: {
                              ...this.state.courtSearch.query,
                              name: e.target.value,
                            },
                            pagination: {
                              ...this.state.courtSearch.pagination,
                              offset: 0
                            }
                          },
                        }),
                      value: this.state.courtSearch.query.name,
                    }}
                  />
                </GridItem>

              </GridContainer>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ textAlign: "center", width: "70%" }}>
                      Código
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.props.courts && this.props.courts.data && this.props.courts.data.length > 0 && this.props.courts.data
                    .filter(el => this.state.courtSearch.query.name.trim().length == 0 || el.name.toLowerCase().search(this.state.courtSearch.query.name.toLowerCase().trim()) != -1)
                    .slice(this.state.courtSearch.pagination.offset, this.state.courtSearch.pagination.offset + this.state.courtSearch.pagination.limit)
                    .map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell style={{ padding: "5px 16px", width: "70%" }} > {prop.name} </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            <Tooltip title="Selecionar" arrow>
                              <span>
                                <Button justIcon round color="transparent" onClick={(e) => this.selectCourt(prop)} >
                                  <CheckIcon />
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <GridContainer>
                <GridItem sm={12} style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex" }}>

                    <Tooltip title="Início" arrow>
                      <div>
                        <Button justIcon round color="transparent"
                          disabled={this.state.courtSearch.pagination.offset == 0}
                          onClick={e => this.setState({ courtSearch: { ...this.state.courtSearch, pagination: { ...this.state.courtSearch.pagination, offset: 0 } } })}>
                          <SkipPreviousIcon /></Button>
                      </div>
                    </Tooltip>
                    <Tooltip title="Anterior" arrow>
                      <div>
                        <Button justIcon round color="transparent"
                          disabled={this.state.courtSearch.pagination.offset == 0}
                          onClick={e => this.setState({ courtSearch: { ...this.state.courtSearch, pagination: { ...this.state.courtSearch.pagination, offset: this.state.courtSearch.pagination.offset - this.state.courtSearch.pagination.limit } } })}>
                          <NavigateBeforeIcon /></Button>
                      </div>
                    </Tooltip>

                    <p>Exibindo {Math.min(this.state.courtSearch.pagination.total, this.state.courtSearch.pagination.offset + this.state.courtSearch.pagination.limit)} de {this.state.courtSearch.pagination.total}</p>

                    <Tooltip title="Próxima" arrow>
                      <div>
                        <Button justIcon round color="transparent"
                          disabled={this.state.courtSearch.pagination.offset + this.state.courtSearch.pagination.limit >= this.state.courtSearch.pagination.total}
                          onClick={e => this.setState({ courtSearch: { ...this.state.courtSearch, pagination: { ...this.state.courtSearch.pagination, offset: this.state.courtSearch.pagination.offset + this.state.courtSearch.pagination.limit } } })}>
                          <NavigateNextIcon /></Button>
                      </div>
                    </Tooltip>

                    <Tooltip title="Última" arrow>
                      <div>
                        <Button justIcon round color="transparent"
                          disabled={this.state.courtSearch.pagination.offset + this.state.courtSearch.pagination.limit >= this.state.courtSearch.pagination.total}
                          onClick={e => this.setState({ courtSearch: { ...this.state.courtSearch, pagination: { ...this.state.courtSearch.pagination, offset: this.state.courtSearch.pagination.total - this.state.courtSearch.pagination.limit } } })}>
                          <SkipNextIcon /></Button>
                      </div>
                    </Tooltip>

                  </div>
                </GridItem>
              </GridContainer>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="success" style={{ float: "left" }} onClick={() => { this.props.history.push("/admin/registrations/courts"); }}>Adicionar Vara </Button>
            <Button color="transparent" autoFocus onClick={() => { this.setState({ courtSearch: { ...this.state.courtSearch, display: false }, }); }} > Cancelar </Button>
          </DialogActions>
        </Dialog>

        {this.state.currentStep === 0 && <div></div>}

        {this.state.currentStep === 1 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Em qual unidade esse processo será criado?
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

            <Button onClick={(e) => this.props.history.push("/admin/processes")}>Voltar</Button>
            <Button color="success" onClick={(e) => this.setState({ currentStep: 2 })}>Avançar</Button>
          </div>
        )}

        {this.state.currentStep === 2 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Qual o cliente desse processo?
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
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

            <Button onClick={(e) => this.setState({ currentStep: 1 })}>Voltar</Button>
            <Button color="success" onClick={(e) => {
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
          </div>
        )}

        {this.state.currentStep === 3 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Qual o advogado responsável desse processo?
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
                  labelText="Advogado responsável"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: this.state.data.lawyerName,
                    onClick: (e) => {
                      if (!e.target.value) {
                        this.setState({
                          lawyerSearch: {
                            ...this.state.lawyerSearch,
                            display: true,
                            query: {
                              ...this.state.lawyerSearch.query,
                              companyId: this.props.account.companyId,
                            },
                          },
                        });
                        this.searchLawyer();
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
                        lawyerSearch: {
                          ...this.state.lawyerSearch,
                          display: true,
                          query: {
                            ...this.state.lawyerSearch.query,
                            companyId: this.props.account.companyId,
                          },
                        },
                      });
                      this.searchLawyer();
                    }}
                  >
                    <SearchIcon />
                  </Button>
                </CustomInput>
              </GridItem>
            </GridContainer>

            <Button onClick={(e) => this.setState({ currentStep: 2 })}>
              Voltar
            </Button>
            <Button
              color="success"
              onClick={(e) => {
                if (this.state.data.lawyerId) {
                  this.setState({ currentStep: 4 });
                } else {
                  this.setState({
                    notification: {
                      ...this.state.notification,
                      display: true,
                      severity: "danger",
                      message:
                        "Selecione um advogado responsável para prosseguir.",
                    },
                  });
                }
              }}
            >
              Avançar
            </Button>
          </div>
        )}

        {this.state.currentStep === 4 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Qual a vara desse processo?
            </h4>
            <h4 style={{ textAlign: "center" }}>
              <small>A vara poderá ser alteradas posteriormente</small>
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
                  labelText="Vara"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: this.state.data.courtName,
                    onClick: (e) => {
                      if (!e.target.value) {
                        this.setState({
                          courtSearch: {
                            ...this.state.courtSearch,
                            display: true
                          },
                        });
                        this.searchCourt();
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
                        courtSearch: {
                          ...this.state.courtSearch,
                          display: true
                        },
                      });
                      this.searchCourt();
                    }}
                  >
                    <SearchIcon />
                  </Button>
                </CustomInput>
              </GridItem>
            </GridContainer>

            <Button onClick={(e) => this.setState({ currentStep: 3 })}>Voltar</Button>
            <Button color="success"
              onClick={e => {
                this.setState({ currentStep: 5 });
                this.props.fetchProcessActions((actions) => this.setState({
                  actionSearch: {
                    ...this.state.actionSearch, pagination: {
                      ...this.state.actionSearch.pagination, total: actions.total
                    }
                  }
                }));
              }}>Avançar</Button>
          </div>
        )}

        {this.state.currentStep === 5 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Qual o número e a ação do processo?
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
                  labelText="Número do processo"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: this.state.data.code,
                    onChange: e => this.setState({ data: { ...this.state.data, code: e.target.value } })
                  }}
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>


              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
                  labelText="Ação"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: this.state.data.action,
                    onChange: e => this.setState({
                      data: { ...this.state.data, action: e.target.value },
                      actionSearch: { ...this.state.actionSearch, pagination: { ...this.state.actionSearch.pagination, offset: 0 } }
                    })
                  }}
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6} style={{ overflowY: "scroll", borderBottom: "1px solid #cacaca", maxHeight: "300px", height: "300px" }}>
                <Table>
                  <TableBody>
                    {this.props.processActions && this.props.processActions.data && this.props.processActions.data.length > 0 && this.props.processActions.data
                      .filter(el => this.state.data.action.trim().length == 0 || el.name.toLowerCase().search(this.state.data.action.toLowerCase().trim()) != -1)
                      .slice(this.state.actionSearch.pagination.offset, this.state.actionSearch.pagination.offset + this.state.actionSearch.pagination.limit)
                      .map((prop, key) => {
                        return (
                          <TableRow key={key}>
                            <TableCell style={{ padding: "5px 5px", width: "70%" }} > {prop.name} </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <Tooltip title="Selecionar" arrow>
                                <span>
                                  <Button justIcon round color="transparent" onClick={(e) => this.setState({ data: { ...this.state.data, action: prop.name } })} >
                                    <CheckIcon />
                                  </Button>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6} >
                <GridContainer>
                  <GridItem sm={12} style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex" }}>

                      <Tooltip title="Início" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.actionSearch.pagination.offset == 0}
                            onClick={e => this.setState({ actionSearch: { ...this.state.actionSearch, pagination: { ...this.state.actionSearch.pagination, offset: 0 } } })}>
                            <SkipPreviousIcon /></Button>
                        </div>
                      </Tooltip>
                      <Tooltip title="Anterior" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.actionSearch.pagination.offset == 0}
                            onClick={e => this.setState({ actionSearch: { ...this.state.actionSearch, pagination: { ...this.state.actionSearch.pagination, offset: this.state.actionSearch.pagination.offset - this.state.actionSearch.pagination.limit } } })}>
                            <NavigateBeforeIcon /></Button>
                        </div>
                      </Tooltip>

                      <p>Exibindo {Math.min(this.state.actionSearch.pagination.total, this.state.actionSearch.pagination.offset + this.state.actionSearch.pagination.limit)} de {this.state.actionSearch.pagination.total}</p>

                      <Tooltip title="Próxima" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.actionSearch.pagination.offset + this.state.actionSearch.pagination.limit >= this.state.actionSearch.pagination.total}
                            onClick={e => this.setState({ actionSearch: { ...this.state.actionSearch, pagination: { ...this.state.actionSearch.pagination, offset: this.state.actionSearch.pagination.offset + this.state.actionSearch.pagination.limit } } })}>
                            <NavigateNextIcon /></Button>
                        </div>
                      </Tooltip>

                      <Tooltip title="Última" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.actionSearch.pagination.offset + this.state.actionSearch.pagination.limit >= this.state.actionSearch.pagination.total}
                            onClick={e => this.setState({ actionSearch: { ...this.state.actionSearch, pagination: { ...this.state.actionSearch.pagination, offset: this.state.actionSearch.pagination.total - this.state.actionSearch.pagination.limit } } })}>
                            <SkipNextIcon /></Button>
                        </div>
                      </Tooltip>

                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>


            <Button onClick={(e) => this.setState({ currentStep: 4 })}>
              Voltar
            </Button>
            <Button color="success" onClick={(e) => { this.createProcess() }} >
              Criar Processo
            </Button>
          </div>
        )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
    courts: state.common.data.courts,
    processActions: state.common.data.processActions
  };
};


const mapDispatchToProps = dispatch => ({
  fetchCourts: (callback) => dispatch(fetchCourts(callback, true)),
  fetchProcessActions: (callback) => dispatch(fetchProcessActions(callback, true))
})


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProcessCreate));
