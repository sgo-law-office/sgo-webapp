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
  Chip,
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
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from '@material-ui/icons/Clear';

import CompanySelect from "components/CompanySelect/CompanySelect";
import Input from "@material-ui/core/Input";



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
import ProcessHistoryComponent from "./ProcessHistoryComponent";
import { fetchCourts } from "store/actions";
import { fetchProcessActions } from "store/actions";
//import ContractReportComponent from "./ContractReportComponent";

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

class ProcessDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: {
        value: 0,
      },

      notFound: false,
      data: this.getInitialDataState(),

      editing: {
        processCode: false,
      },

      history: {
        init: false,
        data: {
          total: 0
        },
      },

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
          name: ""
        }
      },

      actionSearch: {
        display: false,
        query: {
          name: ""
        },
        pagination: {
          offset: 0,
          limit: 10,
          total: 0
        }
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

      action: "",
      code: "",
      companyId: null,
      courtId: null,
      currentStatus: "OPEN",

      customerId: null,
      customerName: "",
      customerBirthDate: null,

      ownerLawyerId: null,
      lawyerName: "",
      otherLawyers: [],

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
      this.loadProcess();
    }
  }

  loadProcess() {
    axios
      .get("/api/processes/" + this.props.match.params.id + ":summary", {
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

    axios.patch("/api/processes/" + this.state.data.id + "/status/" + (this.state.data.currentStatus === "OPEN" ? "CONCLUDED" : "OPEN"),
      {
        headers: {
          Accept: "application/json",
        },
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
          this.loadProcess();
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

  updateCode() {
    if (!this.state.data.id) return;

    axios.patch("/api/processes/" + this.state.data.id + "/code/" + this.state.data.code,
      {
        headers: {
          Accept: "application/json",
        },
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
          this.setState({ editing: { ...this.state.editing, processCode: false } });
          this.loadProcess();

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

  updateProcessAction(action, successCallback) {
    if (!this.state.data.id) return;

    axios.patch("/api/processes/" + this.state.data.id + "/action", { action: action },
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
          successCallback();
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

    axios
      .get("/api/processes/" + this.state.data.id + "/contracts", {
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

  addOtherLawyer(otherLawyerId) {
    if (this.state.data.id && otherLawyerId) {

      axios.post("/api/processes/" + this.state.data.id + ":other-lawyers",
        { otherLawyerId: otherLawyerId },
        {
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
            this.loadProcess();
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

    } else {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "Falha ao adicionar advogado ao processo, tente novamente.",
        },
      });
    }
  }

  removeOtherLawyer(otherLawyerId) {
    if (this.state.data.id && otherLawyerId) {

      axios.delete("/api/processes/" + this.state.data.id + ":other-lawyers/" + otherLawyerId,
        {
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
            this.loadProcess();
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
    } else {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "Falha ao remover advogado ao processo, tente novamente.",
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
          onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }); }}>
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
                    }}>
                    {e.text}
                  </Button>
                );
              })}
            </DialogActions>
          )}
        </Dialog>


        <Dialog fullWidth maxWidth="md" open={this.state.lawyerSearch.display} onClose={() => { this.setState({ lawyerSearch: { ...this.state.lawyerSearch, display: false } }); }}>
          <DialogTitle>Adicionar advogado ao processo</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <p>Selecione abaixo os advogados que gostaria de adicionar ao processo.</p>
              <GridContainer>

                <GridItem sm={12} md={4}>
                  <CustomInput formControlProps={{ fullWidth: true }}
                    inputProps={{
                      placeholder: "Nome",
                      onKeyPress: (e) => {
                        if (e.key === "Enter") {
                          this.searchLawyer();
                        }
                      },
                      onChange: (e) => {
                        this.setState({ lawyerSearch: { ...this.state.lawyerSearch, query: { ...this.state.lawyerSearch.query, name: e.target.value } } })
                      },
                      value: this.state.lawyerSearch.query.name
                    }} />
                </GridItem>

                <GridItem sm={12} md={6}>
                  <CompanySelect labelText="Unidade" inputProps={{
                    onChange: (e) => {
                      this.setState({ lawyerSearch: { ...this.state.lawyerSearch, query: { ...this.state.lawyerSearch.query, companyId: e.target.value } } }); this.searchLawyer(e.target.value);
                    },
                    value: this.state.lawyerSearch.query.companyId
                  }} />
                </GridItem>

                <GridItem sm={12} md={2}>
                  <CustomInput>
                    <Button color="primary" justIcon round onClick={(e) => this.searchLawyer()} >
                      <SearchIcon />
                    </Button>
                  </CustomInput>
                </GridItem>
              </GridContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ textAlign: "center", width: "80%" }}>Nome</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.lawyerSearch.data && this.state.lawyerSearch.data.lawyers && this.state.lawyerSearch.data.lawyers.length > 0 &&
                    this.state.lawyerSearch.data.lawyers
                      .filter(el => !this.state.data.otherLawyersNameById || Object.keys(this.state.data.otherLawyersNameById).indexOf(el.accountId) < 0)
                      .map((prop, key) => (
                        <TableRow key={key}>
                          <TableCell style={{ padding: "5px 16px", width: "80%" }} >{prop.name}</TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            <Tooltip title="Selecionar" arrow>
                              <span>
                                <Button justIcon round color="transparent" onClick={(e) => this.addOtherLawyer(prop.accountId)} >
                                  <CheckIcon />
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>

            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus color="transparent" onClick={e => this.setState({ lawyerSearch: { ...this.state.lawyerSearch, display: false } })}>
              Cancelar
              </Button>
          </DialogActions>
        </Dialog>



        <Dialog
          open={this.state.actionSearch.display}
          onClose={() => { this.setState({ actionSearch: { ...this.state.actionSearch, display: false } }); }}>
          <DialogTitle>Alterar ação do processo</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <p>Selecione abaixo a ação que gostaria de vincular ao processo.</p>
            </DialogContentText>

            <GridContainer>
              <GridItem sm={12} md={12} lg={12}>
                <CustomInput formControlProps={{ fullWidth: true }}
                  inputProps={{
                    placeholder: "Nome",
                    onChange: (e) => {
                      this.setState({ actionSearch: { ...this.state.actionSearch, query: { ...this.state.actionSearch.query, name: e.target.value } } })
                    },
                    value: this.state.actionSearch.query.name
                  }} />
              </GridItem>
            </GridContainer>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ textAlign: "center", width: "80%" }}>Nome</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.processActions && this.props.processActions.data && this.props.processActions.data.length > 0 && this.props.processActions.data
                  .filter(el => this.state.actionSearch.query.name.trim().length == 0 || el.name.toLowerCase().search(this.state.actionSearch.query.name.toLowerCase().trim()) != -1)
                  .slice(this.state.actionSearch.pagination.offset, this.state.actionSearch.pagination.offset + this.state.actionSearch.pagination.limit)
                  .map((prop, key) => (
                    <TableRow key={key}>
                      <TableCell style={{ padding: "5px 16px", width: "80%" }} >{prop.name}</TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <Tooltip title="Selecionar" arrow>
                          <span>
                            <Button justIcon round color="transparent" onClick={(e) => {
                              this.updateProcessAction(prop.name, () => {
                                this.setState({
                                  actionSearch: {
                                    ...this.state.actionSearch, display: false,
                                    query: { ...this.state.actionSearch.query, name: "" },
                                    pagination: { ...this.state.actionSearch.pagination, offset: 0 }
                                  }
                                })
                              });
                              setTimeout(this.loadProcess.bind(this), 600);
                            }} >
                              <CheckIcon />
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <GridContainer>
              <GridItem xs={12} sm={1} md={2} lg={3}></GridItem>
              <GridItem xs={10} sm={11} md={12} lg={9}>
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
          </DialogContent>
          <DialogActions>
            <Button autoFocus color="transparent" onClick={e => this.setState({ actionSearch: { ...this.state.actionSearch, display: false } })}>
              Cancelar
              </Button>
          </DialogActions>
        </Dialog>



        {this.state.notFound && (
          <GridContainer>
            <GridItem sm={12} style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>Não foi possível encontrar o processo</h2>
              <Button onClick={(e) => this.props.history.push("/admin/processes")}>Voltar</Button>
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
                        <span onClick={(e) => { e.preventDefault(); this.props.history.push("/admin/customers/" + this.state.data.customerId); }}
                          style={{ cursor: "pointer", fontSize: "1.5em", marginLeft: "10px", }} >
                          {this.state.data.customerName}
                          <small>
                            <ElderTooltip birthDate={this.state.data.customerBirthDate} />
                          </small>
                        </span>
                      </Tooltip>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={8}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Número do processo</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {!this.state.editing.processCode && this.state.data.code}
                        {!this.state.editing.processCode && !this.state.data.code && <span style={{ fontStyle: "italic", color: "grey", fontWeight: "lighter", margin: "0 10px" }}>vazio</span>}
                        {this.state.editing.processCode && <div style={{ display: "inline-flex", width: "50%" }}>

                          <Input fullWidth
                            inputProps={{ style: { padding: "0 0 6px 0" } }}
                            value={this.state.data.code}
                            onChange={(e) => this.setState({ data: { ...this.state.data, code: e.target.value } })}
                          />

                          <Tooltip arrow title="Salvar">
                            <CheckIcon fontSize="small" style={{ marginLeft: "5px", cursor: "pointer", opacity: "0.8" }} onClick={e => this.updateCode()} />
                          </Tooltip>
                          <Tooltip arrow title="Cancelar">
                            <ClearIcon fontSize="small" style={{ marginLeft: "5px", cursor: "pointer", opacity: "0.8" }} onClick={e => { this.setState({ editing: { ...this.state.editing, processCode: false } }); this.loadProcess() }} />
                          </Tooltip>
                        </div>
                        }
                      </span>
                      {!this.state.editing.processCode &&
                        <Tooltip arrow title="Alterar Número">
                          <EditIcon fontSize="small" style={{ marginLeft: "5px", cursor: "pointer", opacity: "0.8" }} onClick={e => this.setState({ editing: { ...this.state.editing, processCode: true } })} />
                        </Tooltip>}
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Unidade</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {(this.state.data.companyId && this.props.companies &&
                          (this.props.companies.filter((e) => e.id === this.state.data.companyId)[0] || {}).name) || ""}
                      </span>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Status</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {{
                          OPEN: "Aberto",
                          CONCLUDED: "Concluído",
                        }[this.state.data.currentStatus]}
                      </span>


                      {this.state.data.id && (
                        <Button
                          color={
                            this.state.data.currentStatus === "OPEN" ? "success" : "warning"
                          }
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
                                  this.state.data.currentStatus === "OPEN"
                                    ? "Cuidado! Um processo arquivado não estará disponível para ações em outras partes do sistema."
                                    : "Processos abertas estarão disponíveis para ações em outras parte do sistema.",
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
                          {this.state.data.currentStatus === "OPEN" ? "Concluir processo" : "Reabrir processo"}
                        </Button>
                      )}

                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Vara</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.courtName}
                      </span>
                      <Tooltip arrow title="Alterar Vara">
                        <EditIcon fontSize="small" style={{ marginLeft: "5px", cursor: "pointer", opacity: "0.8" }} onClick={e => e.preventDefault()} />
                      </Tooltip>
                    </CustomInput>
                  </GridItem>



                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Ação</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.action}
                      </span>
                      <Tooltip arrow title="Alterar Ação">
                        <EditIcon fontSize="small" style={{ marginLeft: "5px", cursor: "pointer", opacity: "0.8" }} onClick={e => {
                          this.props.fetchProcessActions((actions) => this.setState({
                            actionSearch: {
                              ...this.state.actionSearch,
                              display: true,
                              pagination: {
                                ...this.state.actionSearch.pagination,
                                total: actions.total
                              }
                            }
                          }));

                        }} />
                      </Tooltip>
                    </CustomInput>
                  </GridItem>


                  <GridItem xs={12} sm={12} md={6} lg={4}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Advogado Responsável</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.ownerLawyerName}
                      </span>
                    </CustomInput>
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={8}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Advogados do Processo</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {this.state.data.otherLawyersNameById && Object.keys(this.state.data.otherLawyersNameById).map(otherLawerId => (
                          <Chip
                            style={{ marginRight: "8px", marginBottom: "5px" }}
                            key={otherLawerId}
                            label={this.state.data.otherLawyersNameById[otherLawerId]}
                            onDelete={e => this.setState({
                              dialog: {
                                title: "Remover advogado",
                                fullWidth: false,
                                display: true,
                                message: "Deseja remover o advogado " + this.state.data.otherLawyersNameById[otherLawerId] + " do processo?",
                                actions: [
                                  { text: "Cancelar", color: "transparent", autoFocus: true, callback: () => { this.setState({ dialog: { ...this.state.dialog, display: false } }) } },
                                  { text: "Remover", color: "danger", callback: () => { this.removeOtherLawyer(otherLawerId); this.setState({ dialog: { ...this.state.dialog, display: false } }); } }
                                ]
                              }
                            })} />
                        ))}
                      </span>

                      <Chip
                        variant="outlined"
                        style={{ marginRight: "8px", marginBottom: "5px" }}
                        label="Adicionar"
                        icon={<AddIcon style={{ cursor: "pointer", opacity: "0.8" }} onClick={e => e.preventDefault()} />}
                        onClick={e => {
                          this.searchLawyer();
                          this.setState({
                            lawyerSearch: {
                              ...this.state.lawyerSearch,
                              display: true
                            }
                          });
                        }} />

                    </CustomInput>
                  </GridItem>


                  <GridItem xs={12} sm={12} md={12} lg={12} style={{ marginTop: "15px" }}>
                    <Divider fullWidth />
                  </GridItem>

                  <GridItem xs={12} sm={12} md={6} lg={3}>
                    <CustomInput formControlProps={{ fullWidth: true }}>
                      <span>Criado em</span>
                      <Tooltip arrow title={moment(this.state.data.createdAt).format("DD/MM/YYYY HH:mm")}>
                        <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
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
                        <Tooltip arrow title={moment(this.state.data.lastUpdatedAt).format("DD/MM/YYYY HH:mm")}>
                          <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
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
                  <Tab label={this.state.history.init ? "Histórico (" + (this.state.history.data.total || 0) + ")" : "Histórico"} />
                  <Tab label={this.state.contracts.init ? "Contratos (" + (this.state.contracts.data.total || 0) + ")" : "Contratos"}
                    onClick={(e) => {
                      this.setState({ contracts: { ...this.state.contracts, init: true } });
                      this.searchContracts();
                    }}
                  />
                </Tabs>
                <Divider style={{ width: "100%" }} />


                <div role="tabpanel" hidden={this.state.tabs.value !== 0}>
                  {this.state.data.id && this.state.tabs.value === 0 &&
                    <ProcessHistoryComponent
                      processId={this.state.data.id}
                      loadCallback={(data) =>
                        this.setState({
                          history: {
                            ...this.state.history,
                            init: true,
                            data: {
                              total: data.total
                            }
                          },
                        })
                      } />}
                  {/* 
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
                    newReportAddedCallback={() => this.loadContract()} /> */}
                </div>

                <div role="tabpanel" hidden={this.state.tabs.value !== 1}>
                  {this.state.tabs.value === 1 && (
                    <GridContainer>
                      <GridItem xs={12} sm={6} md={12} lg={12}>
                        {this.state.contracts.err && (
                          <div style={{ textAlign: "center" }}>
                            <h4>Não foi possível carregar os contratos do processo.</h4>
                            <Button color="primary" onClick={(e) => this.searchContracts()}> Tentar novamente</Button>
                          </div>
                        )}

                        {this.state.contracts.loading && (
                          <h1 style={{ textAlign: "center", position: "absolute", width: "100%", height: "100%", }} >
                            <img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." />
                          </h1>
                        )}

                        {!this.state.contracts.err &&
                          !this.state.contracts.loading && (
                            <div>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{ textAlign: "center", width: "20%", }}>Número do processo</TableCell>
                                    <TableCell style={{ textAlign: "center", width: "30%", }} >Nome do advogado
                                    <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }} >
                                        <a href="#">
                                          {(this.state.contracts.data.sortBy !== "lawyer_name" || this.state.contracts.data.sortDirection === "desc") &&
                                            (<ArrowDropDownIcon color={this.state.contracts.data.sortBy === "name" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "lawyer_name", "asc"); }} />)}
                                          {this.state.contracts.data.sortBy === "lawyer_name" && this.state.contracts.data.sortDirection === "asc" &&
                                            (<ArrowDropUpIcon color={this.state.contracts.data.sortBy === "name" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "lawyer_name", "desc"); }} />)}
                                        </a>
                                      </div>
                                    </TableCell>

                                    <TableCell style={{ textAlign: "center" }}>Status</TableCell>

                                    <TableCell style={{ textAlign: "center" }}>Criado em
                                    <div style={{ display: "inline", verticalAlign: "top", padding: "0 5px", }} >
                                        <a href="#">
                                          {(this.state.contracts.data.sortBy !== "created_at" || this.state.contracts.data.sortDirection === "desc") &&
                                            (<ArrowDropDownIcon color={this.state.contracts.data.sortBy === "created_at" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "created_at", "asc"); }} />)}
                                          {this.state.contracts.data.sortBy === "created_at" && this.state.contracts.data.sortDirection === "asc" &&
                                            (<ArrowDropUpIcon color={this.state.contracts.data.sortBy === "created_at" ? "" : "disabled"} onClick={(e) => { this.searchContracts(undefined, undefined, "created_at", "desc"); }} />)}
                                        </a>
                                      </div>
                                    </TableCell>

                                    <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {this.state.contracts.data.contracts && this.state.contracts.data.contracts.length > 0 && this.state.contracts.data.contracts.map((prop, key) => {
                                    return (
                                      <TableRow key={key}>
                                        <TableCell style={{ width: "20%" }}>NNNNNNN-DD.AAAA.JTR.OOOO</TableCell>
                                        <TableCell style={{ padding: "5px 16px", width: "30%", }}>{prop.lawyerName}</TableCell>
                                        <TableCell style={{ padding: "5px 16px", textAlign: "center", }}>
                                          {{
                                            CURRENT: "Vigente",
                                            FILED: "Arquivado",
                                          }[prop.status]}
                                        </TableCell>

                                        <TableCell style={{ padding: "5px 16px", textAlign: "center", }} ><Moment date={prop.createdAt} format="DD/MM/YYYY" /></TableCell>

                                        <TableCell style={{ padding: "5px 16px", textAlign: "center", }} >
                                          <Tooltip title="Detalhes" arrow>
                                            <span>
                                              <Button justIcon round color="transparent" onClick={(e) => this.props.history.push("/admin/contracts/" + prop.id)}>
                                                <DescriptionOutlinedIcon />
                                              </Button>
                                            </span>
                                          </Tooltip>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                              {!this.state.contracts.err &&
                                !this.state.contracts.loading &&
                                this.state.contracts.data.contracts &&
                                this.state.contracts.data.contracts.length === 0 &&
                                <h5 style={{ textAlign: "center" }}>Nenhum contrato encontrado.</h5>}
                            </div>
                          )}

                        <GridContainer>
                          <GridItem sm={12} style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex" }}>
                              <Tooltip title="Início" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={this.state.contracts.data.offset === 0}
                                    onClick={(e) => this.searchProcesses(0)}>
                                    <SkipPreviousIcon />
                                  </Button>
                                </div>
                              </Tooltip>
                              <Tooltip title="Anterior" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={this.state.contracts.data.offset === 0}
                                    onClick={(e) => this.searchProcesses(this.state.contracts.data.offset - this.state.contracts.data.limit)}>
                                    <NavigateBeforeIcon />
                                  </Button>
                                </div>
                              </Tooltip>

                              <p>Exibindo{" "} {Math.min(this.state.contracts.data.total, this.state.contracts.data.offset + this.state.contracts.data.limit)}{" "} de {this.state.contracts.data.total} </p>

                              <Tooltip title="Próxima" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={this.state.contracts.data.offset + this.state.contracts.data.limit >= this.state.contracts.data.total}
                                    onClick={(e) => this.searchProcesses(this.state.contracts.data.offset + this.state.contracts.data.limit)}>
                                    <NavigateNextIcon />
                                  </Button>
                                </div>
                              </Tooltip>

                              <Tooltip title="Última" arrow>
                                <div>
                                  <Button justIcon round color="transparent"
                                    disabled={this.state.contracts.data.offset + this.state.contracts.data.limit >= this.state.contracts.data.total}
                                    onClick={(e) => this.searchProcesses(this.state.contracts.data.total - this.state.contracts.data.limit)}>
                                    <SkipNextIcon />
                                  </Button>
                                </div>
                              </Tooltip>
                            </div>
                          </GridItem>
                        </GridContainer>
                      </GridItem>

                      <GridItem xs={12} sm={6} md={12} lg={12}>
                        <Button color="success" onClick={(e) => this.props.history.push("/admin/contracts/create")}>Adicionar novo contrato</Button>
                      </GridItem>
                    </GridContainer>
                  )}
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
    account: state.account,
    companies: state.common.data.companies,
    courts: state.common.data.courts,
    processActions: state.common.data.processActions
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchCompanies: (callback) => dispatch(fetchCompanies(callback)),
  fetchCourts: (callback) => dispatch(fetchCourts(callback, true)),
  fetchProcessActions: (callback) => dispatch(fetchProcessActions(callback, true))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProcessDetails));
