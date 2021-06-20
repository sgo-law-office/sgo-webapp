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
  Tooltip,
} from "@material-ui/core";
import CustomInput from "components/CustomInput/CustomInput";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";
import CheckIcon from "@material-ui/icons/Check";
import SearchIcon from "@material-ui/icons/Search";

import Button from "components/CustomButtons/Button";
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

class ContractCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        attendanceId: null,
        processId: null,
        customerId: null,
        companyId: null,
        lawyerId: null,
        folderId: null,
        customerName: "",
        lawyerName: "",
        folderCode: "",
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

      folderSearch: {
        display: false,
        query: {
          code: "",
          companyId: null,
        },
        data: {
          limit: 5,
          offset: 0,
          total: 0,
          sortBy: "created_by",
          sortDirection: "desc",
          folders: [],
        },
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
    const attendanceId = query.get("atendanceId");
    const processId = query.get("processId");

    this.setState({
      data: {
        ...this.state.data,
        companyId: this.props.account.companyId,
        processId: processId
      },
    });

    if (attendanceId) {
      axios
        .get("/api/attendances/" + attendanceId, {
          headers: {
            Accept: "application/json",
          },
        })
        .then((res) => {
          this.setState({
            data: {
              ...this.state.data,
              attendanceId: res.data.id,
              customerId: res.data.customerId,
              companyId: res.data.companyId,
            },
            currentStep: 3,
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
                "Falha ao buscar atendimento, recarregue a página para tentar novamente, ou prossiga com a criação e vincule o atendimento posteriormente.",
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

  createContract() {
    const { data } = this.state;

    if (
      !data.companyId ||
      !data.customerId ||
      !data.lawyerId ||
      !data.folderId
    ) {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "Falha ao criar contrato, recarregue a página para tentar novamente.",
        },
      });
      return;
    }

    axios
      .post(
        "/api/contracts",
        {
          customerId: data.customerId,
          companyId: data.companyId,
          lawyerId: data.lawyerId,
          folderId: data.folderId,
          attendanceId: data.attendanceId,
          processId: data.processId
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.status === 201) {
          this.props.history.push("/admin/contracts/" + res.data.contract.id);
        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao criar contrato, tente novamente.",
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
            message: "Falha ao criar contrato, tente novamente.",
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

  selectFolder(folder) {
    if (folder.id) {
      this.setState({
        data: {
          ...this.state.data,
          folderId: folder.id,
          folderCode: folder.code,
        },
        folderSearch: {
          ...this.state.folderSearch,
          display: false,
        },
      });
    }
  }

  searchFolder(companyId) {
    if (
      !this.state.data.customerId &&
      !companyId &&
      !this.state.folderSearch.query.companyId &&
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
        this.state.folderSearch.query.companyId ||
        this.props.account.companyId,
      customerId: this.state.data.customerId,
    };

    if (
      this.state.folderSearch.query.code &&
      this.state.folderSearch.query.code.trim().length > 0
    ) {
      params.code = this.state.folderSearch.query.code;
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
          folderSearch: {
            ...this.state.folderSearch,
            data: {
              ...this.state.folderSearch.data,
              limit: res.data.limit,
              offset: res.data.offset,
              sortBy: res.data.sortBy,
              sortDirection: res.data.sortDirection,
              total: res.data.total,
              folders: res.data.data || [],
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
            message: "Falha ao buscar pastas, tente novamente.",
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
                                    color="success"
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
                                  color="success"
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

        <Dialog
          open={this.state.folderSearch.display}
          onClose={() => {
            this.setState({
              folderSearch: { ...this.state.folderSearch, display: false },
            });
          }}
        >
          <DialogTitle>Selecione uma pasta</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>
                <GridItem sm={12}>
                  <CompanySelect
                    labelText="Unidade"
                    inputProps={{
                      onChange: (e) => {
                        this.setState({
                          folderSearch: {
                            ...this.state.folderSearch,
                            query: {
                              ...this.state.folderSearch.query,
                              companyId: e.target.value,
                            },
                          },
                        });
                        this.searchFolder(e.target.value);
                      },
                      value: this.state.folderSearch.query.companyId,
                    }}
                  />
                </GridItem>

                <GridItem sm={12} md={10} lg={10}>
                  <CustomInput
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      placeholder: "Código",
                      onKeyPress: (e) => {
                        if (e.key === "Enter") {
                          this.searchFolder();
                        }
                      },
                      onChange: (e) =>
                        this.setState({
                          folderSearch: {
                            ...this.state.folderSearch,
                            query: {
                              ...this.state.folderSearch.query,
                              code: e.target.value,
                            },
                          },
                        }),
                      value: this.state.folderSearch.query.code,
                    }}
                  />
                </GridItem>

                <GridItem sm={12} md={2} lg={2}>
                  <CustomInput>
                    <Button
                      color="primary"
                      justIcon
                      round
                      onClick={(e) => this.searchFolder()}
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
                      Código
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.folderSearch.data &&
                    this.state.folderSearch.data.folders &&
                    this.state.folderSearch.data.folders.length > 0 &&
                    this.state.folderSearch.data.folders.map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell
                            style={{ padding: "5px 16px", width: "70%" }}
                          >
                            {prop.code}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            <Tooltip title="Selecionar" arrow>
                              <span>
                                <Button
                                  justIcon
                                  round
                                  color="success"
                                  onClick={(e) => this.selectFolder(prop)}
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
              color="transparent"
              autoFocus
              onClick={() => {
                this.setState({
                  folderSearch: { ...this.state.folderSearch, display: false },
                });
              }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {this.state.currentStep === 0 && <div></div>}

        {this.state.currentStep === 1 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Em qual unidade esse contrato será criado?
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

            <Button
              onClick={(e) => this.props.history.push("/admin/contracts")}
            >
              Voltar
            </Button>
            <Button
              color="success"
              onClick={(e) => this.setState({ currentStep: 2 })}
            >
              Avançar
            </Button>
          </div>
        )}

        {this.state.currentStep === 2 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Qual o cliente desse contrato?
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

            <Button onClick={(e) => this.setState({ currentStep: 1 })}>
              Voltar
            </Button>
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
          </div>
        )}

        {this.state.currentStep === 3 && (
          <div>
            <h4 style={{ textAlign: "center" }}>
              Qual o advogado responsável desse contrato?
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
              Qual a pasta desse contrato?
            </h4>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={9} md={8} lg={6}>
                <CustomInput
                  labelText="Pasta"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: this.state.data.folderCode,
                    onClick: (e) => {
                      if (!e.target.value) {
                        this.setState({
                          folderSearch: {
                            ...this.state.folderSearch,
                            display: true,
                            query: {
                              ...this.state.folderSearch.query,
                              companyId: this.props.account.companyId,
                            },
                          },
                        });
                        this.searchFolder();
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
                        folderSearch: {
                          ...this.state.folderSearch,
                          display: true,
                          query: {
                            ...this.state.folderSearch.query,
                            companyId: this.props.account.companyId,
                          },
                        },
                      });
                      this.searchFolder();
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
                if (this.state.data.folderId) {
                  this.createContract();
                } else {
                  this.setState({
                    notification: {
                      ...this.state.notification,
                      display: true,
                      severity: "danger",
                      message: "Selecione uma pasta para prosseguir.",
                    },
                  });
                }
              }}
            >
              Criar Contrato
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

export default connect(mapStateToProps)(withRouter(ContractCreate));
