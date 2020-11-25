import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import Button from "components/CustomButtons/Button.js";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { fetchPhones } from "store/actions";
import CustomInput from "components/CustomInput/CustomInput";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';


import Axios from "axios";
import {
  authRequestInterceptor,
  authRequestInterceptorOnError,
  authResponseInterceptor,
  authResponseInterceptorOnError
} from "auth/interceptor";
import {
  loadingRequestInterceptor,
  loadingRequestInterceptorOnError,
  loadingResponseInterceptor,
  loadingResponseInterceptorOnError
} from "components/Loading/interceptor";
import Notification from "components/Notifications/Notification";




const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


class PhoneCrud extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filter: {
        name: ""
      },
      pagination: {
        offset: 0,
        limit: 10,
        total: 0
      },
      dialog: {
        display: false,
        data: {
          id: null,
          name: "",
          notes: "",
          phones: []
        }
      },
      notification: {
        display: false,
        message: "",
        severity: ""
      }
    };
  }

  componentDidMount() {
    this.props.fetchPhones((phones) => this.setState({ pagination: { ...this.state.pagination, total: phones.total } }));
  }

  createPhone() {
    if (!this.state.dialog.data.name || this.state.dialog.data.name.trim().length === 0 ||
      !this.state.dialog.data.phones || this.state.dialog.data.phones.filter(el => el.trim().length > 0).length === 0) {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "O nome e ao menos 1 telefone são obrigatórios."
        }
      });
      return;
    }

    axios.post("/api/phones", this.state.dialog.data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.status == 201) {
          this.setState({
            dialog: {
              ...this.state.dialog,
              display: false
            },
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Telefone criado com sucesso."
            }
          });
          this.props.fetchPhones((phones) => this.setState({ pagination: { ...this.state.pagination, total: phones.total } }));

        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao criar telefone, tente novamente."
            }
          });
        }
      })
      .catch(err => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "danger",
            message: "Falha ao criar telefone, tente novamente."
          }
        });
      });
  }

  removePhone(phone) {
    axios.delete("/api/phones/" + phone.id, {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.status == 200) {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Telefone removido com sucesso."
            }
          });
          this.props.fetchPhones((phones) => this.setState({ pagination: { ...this.state.pagination, total: phones.total } }));
        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao remover telefone, tente novamente."
            }
          });
        }
      })
      .catch(err => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "danger",
            message: "Falha ao remover telefone, tente novamente."
          }
        });
      });
  }

  updatePhone() {
    if (!this.state.dialog.data.name || this.state.dialog.data.name.trim().length === 0 ||
      !this.state.dialog.data.phones || this.state.dialog.data.phones.filter(el => el.trim().length > 0).length === 0 ||
      !this.state.dialog.data.id) {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "danger",
          message: "O nome e ao menos 1 telefone são obrigatórios."
        }
      });
      return;
    }

    axios.put("/api/phones/" + this.state.dialog.data.id, this.state.dialog.data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.status == 200) {
          this.setState({
            dialog: {
              ...this.state.dialog,
              display: false
            },
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Telefone alterado com sucesso."
            }
          });
          this.props.fetchPhones((phones) => this.setState({ pagination: { ...this.state.pagination, total: phones.total } }));
        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao atualizar telefone, tente novamente."
            }
          });
        }
      })
      .catch(err => {
        this.setState({
          notification: {
            ...this.state.notification,
            display: true,
            severity: "danger",
            message: "Falha ao atualizar telefone, tente novamente."
          }
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
                message: ""
              }
            });
          }}
        />

        <Dialog fullWidth maxWidth="sm" open={this.state.dialog.display} onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
          <DialogTitle>Adicionar telefone</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <GridContainer>

                <GridItem xs={12}>
                  <CustomInput labelText="Nome" formControlProps={{ fullWidth: true }}
                    inputProps={{
                      value: this.state.dialog.data.name,
                      onChange: (e) => this.setState({ dialog: { ...this.state.dialog, data: { ...this.state.dialog.data, name: e.target.value } } })
                    }} />
                </GridItem>

                {this.state.dialog.data.phones.map((prop, i) => {
                  return (
                    <GridItem xs={12} sm={12} md={12} lg={12} xl={12} key={i} style={{ borderLeft: "2px solid #cacaca", marginBottom: "10px" }}>
                      <GridContainer>
                        <GridItem xs={10}>
                          <CustomInput labelText="Telefone" formControlProps={{ fullWidth: true }}
                            inputProps={{
                              value: prop,
                              onChange: (e) => this.setState({
                                dialog: {
                                  ...this.state.dialog,
                                  data: {
                                    ...this.state.dialog.data,
                                    phones: [
                                      ...this.state.dialog.data.phones.slice(0, i),
                                      e.target.value,
                                      ...this.state.dialog.data.phones.slice(i + 1),
                                    ]
                                  }
                                }
                              })
                            }} />
                        </GridItem>
                        <GridItem xs={2}>
                          <CustomInput formControlProps={{ fullWidth: true }} style={{ textAlign: "left" }}>
                            <Tooltip title="Remover telefone" arrow>
                              <span>
                                <Button color="transparent" justIcon onClick={() => {
                                  const phones = [
                                    ...this.state.dialog.data.phones.slice(0, i),
                                    ...this.state.dialog.data.phones.slice(i + 1)
                                  ];
                                  this.setState({
                                    dialog: {
                                      ...this.state.dialog,
                                      data: {
                                        ...this.state.dialog.data,
                                        phones: phones.length === 0 ? [""] : phones
                                      }
                                    }
                                  })
                                }}><DeleteIcon /></Button>
                              </span>
                            </Tooltip>
                          </CustomInput>
                        </GridItem>
                      </GridContainer>

                    </GridItem>
                  );
                })}

                <GridItem xs={12}>
                  <Tooltip title="Adicionar telefone" arrow>
                    <span>
                      <Button color="transparent" onClick={() => this.setState({
                        dialog: {
                          ...this.state.dialog,
                          data: {
                            ...this.state.dialog.data,
                            phones: [
                              ...this.state.dialog.data.phones,
                              ""
                            ]
                          }
                        }
                      })}><AddIcon /><small>Adicionar</small></Button>
                    </span>
                  </Tooltip>
                </GridItem>
                <GridItem xs={12}>
                  <CustomInput labelText="Observações" formControlProps={{ fullWidth: true }} textarea
                    inputProps={{
                      rows: 5,
                      value: this.state.dialog.data.notes,
                      onChange: (e) => this.setState({ dialog: { ...this.state.dialog, data: { ...this.state.dialog.data, notes: e.target.value } } })
                    }} />
                </GridItem>
              </GridContainer>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {this.state.dialog.data.id && <Button color="success" autoFocus onClick={() => this.updatePhone()}>Salvar Modificações</Button>}
            {!this.state.dialog.data.id && <Button color="success" autoFocus onClick={() => this.createPhone()}>Adicionar</Button>}

            <Button color="transparent" autoFocus onClick={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>Cancelar</Button>
          </DialogActions>
        </Dialog>


        <h3>Cadastros de Telefones</h3>
        <p>&nbsp;</p>
        <GridContainer>

          <GridItem xs={12} sm={12} md={12} >
            <Card>
              <CardBody>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "20%", textAlign: "center" }}>
                        <CustomInput
                          labelText="Nome"
                          formControlProps={{ fullWidth: true, style: { marginTop: "0" } }}
                          inputProps={{ value: this.state.filter.name, onChange: e => this.setState({ filter: { ...this.state.filter, name: e.target.value }, pagination: { ...this.state.pagination, offset: 0 } }) }} /></TableCell>
                      <TableCell style={{ width: "30%", textAlign: "center" }}>Telefones</TableCell>
                      <TableCell style={{ width: "20%", textAlign: "center" }}>Observações</TableCell>
                      <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                </Table>

                <div style={{ maxHeight: "500px", overflow: "auto", width: "100%" }}>
                  <Table>
                    <TableBody>
                      {this.props.phones && this.props.phones.data && this.props.phones.data.length > 0 && this.props.phones.data
                        .filter(el => this.state.filter.name.trim().length == 0 || el.name.toLowerCase().search(this.state.filter.name.toLowerCase().trim()) != -1)
                        .slice(this.state.pagination.offset, this.state.pagination.offset + this.state.pagination.limit)
                        .map((prop, key) => {
                          return (
                            <TableRow key={key}>
                              <TableCell style={{ width: "20%" }}>{prop.name}</TableCell>
                              <TableCell style={{ width: "30%" }}>
                                <ul>
                                  {prop.phones.map((el, i) => {
                                    return <li key={i}>{el}</li>

                                  })}
                                </ul>
                              </TableCell>
                              <TableCell style={{ width: "20%" }}>{prop.notes}</TableCell>
                              <TableCell style={{ padding: "5px 16px", textAlign: "center" }}>
                                <Tooltip title="Remover telefone" arrow>
                                  <span>
                                    <Button justIcon round color="transparent"
                                      onClick={e => this.removePhone(prop)}>
                                      <DeleteOutlineIcon />

                                    </Button>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Editar telefone" arrow>
                                  <span>
                                    <Button justIcon round color="transparent"
                                      onClick={e => this.setState({
                                        dialog: {
                                          ...this.state.dialog,
                                          display: true,
                                          data: {
                                            ...prop
                                          }
                                        }
                                      })}>
                                      <EditIcon />

                                    </Button>
                                  </span>
                                </Tooltip>

                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>

                <GridContainer>
                  <GridItem sm={12} style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex" }}>

                      <Tooltip title="Início" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.pagination.offset == 0}
                            onClick={e => this.setState({ pagination: { ...this.state.pagination, offset: 0 } })}>
                            <SkipPreviousIcon /></Button>
                        </div>
                      </Tooltip>
                      <Tooltip title="Anterior" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.pagination.offset == 0}
                            onClick={e => this.setState({ pagination: { ...this.state.pagination, offset: this.state.pagination.offset - this.state.pagination.limit } })}>
                            <NavigateBeforeIcon /></Button>
                        </div>
                      </Tooltip>

                      <p>Exibindo {Math.min(this.state.pagination.total, this.state.pagination.offset + this.state.pagination.limit)} de {this.state.pagination.total}</p>

                      <Tooltip title="Próxima" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.pagination.offset + this.state.pagination.limit >= this.state.pagination.total}
                            onClick={e => this.setState({ pagination: { ...this.state.pagination, offset: this.state.pagination.offset + this.state.pagination.limit } })}>
                            <NavigateNextIcon /></Button>
                        </div>
                      </Tooltip>

                      <Tooltip title="Última" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.pagination.offset + this.state.pagination.limit >= this.state.pagination.total}
                            onClick={e => this.setState({ pagination: { ...this.state.pagination, offset: this.state.pagination.total - this.state.pagination.limit } })}>
                            <SkipNextIcon /></Button>
                        </div>
                      </Tooltip>

                    </div>
                  </GridItem>
                </GridContainer>

                {!(this.props.phones && this.props.phones.data && this.props.phones.data.length > 0) &&
                  <div style={{ width: "100%" }}>
                    <h4 style={{ textAlign: "center" }}>Nenhuma telefone encontrado.</h4>
                    <span><ArrowDownwardIcon />Clique em <span style={{ fontWeight: "bold" }}>Adicionar telefone</span> para criar um novo telefone.</span>
                  </div>}


              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>

        <div style={{ margin: "15px 0" }}>
          <Button onClick={e => this.props.history.push("/admin/registrations")}>Voltar</Button>
          <Button color="success" onClick={e => this.setState({ dialog: { ...this.state.dialog, display: true, data: { name: "", notes: "", phones: [""] } } })}>Adicionar telefone</Button>
        </div>

      </div>
    );
  }
}



const mapStateToProps = state => {
  return {
    phones: state.common.data.phones
  };
}

const mapDispatchToProps = dispatch => ({
  fetchPhones: (callback) => dispatch(fetchPhones(callback, true))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(PhoneCrud));