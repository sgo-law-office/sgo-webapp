import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { withRouter } from "react-router-dom";
import CustomInput from "components/CustomInput/CustomInput";
import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Hidden, IconButton, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tooltip } from "@material-ui/core";

import CardBody from "components/Card/CardBody";

import Button from "components/CustomButtons/Button";
import { connect } from "react-redux";
import CompanySelect from "components/CompanySelect/CompanySelect";

import Axios from "axios";
import {
  authRequestInterceptor, authRequestInterceptorOnError,
  authResponseInterceptor, authResponseInterceptorOnError
} from "auth/interceptor";
import { loadingRequestInterceptor } from "components/Loading/interceptor";
import { loadingRequestInterceptorOnError } from "components/Loading/interceptor";
import { loadingResponseInterceptor } from "components/Loading/interceptor";
import { loadingResponseInterceptorOnError } from "components/Loading/interceptor";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';


import Notification from "components/Notifications/Notification";

import queryString from 'query-string';
import AddressComponent from "./AddressComponent";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";


const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


class CustomerDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      creating: false,
      editing: false,
      notFound: false,
      idFromUrl: null,

      tabs: {
        value: 0
      },

      data: this.getInitialDataState(),

      validations: {
        companyId: false,
        name: false,
        mail: false,
        birthDate: false,
        taxPayerIdentifier: false,
        idCard: false,
        phones: false
      },

      notification: {
        display: false,
        message: "",
        severity: ""
      },

      dialog: {
        display: false,
        title: "",
        message: "",
        actions: []
      }
    }
  }

  getInitialDataState() {
    return {
      id: null,
      active: null,
      companyId: null,
      name: "",
      mail: "",
      birthDate: "",
      taxPayerIdentifier: "",
      idCard: "",
      addresses: [],
      phones: [{
        type: "MOBILE",
        value: "",
        alias: "",
        notes: ""
      }],
      metadata: {
        RECOMMENDATION: "",
        NOTES: ""
      }
    }
  }

  componentDidMount() {
    const data = this.props.customer || {
      ...this.state.data,
      companyId: this.props.account ? this.props.account.companyId : null
    };
    this.setState({
      creating: this.props.history.location.pathname === "/admin/customers/create",
      editing: this.props.history.location.pathname === "/admin/customers/create",
      data
    });

    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      this.loadUser(true);
    }

    const query = queryString.parse(this.props.location.search);

    if (query.success && query.success === "true") {
      this.setState({
        notification: {
          ...this.state.notification,
          display: true,
          severity: "success",
          message: "Cliente criado com sucesso."
        }
      });
    }
  }

  selectCompanyBranch(e) {
    this.setState({
      companyId: e.target.value
    })
  }

  loadUser(force) {
    if (force || (this.props.match && this.props.match.params.id && !this.state.data.id)) {
      axios.get("/api/customers/" + this.props.match.params.id, this.state.data, {
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(res => {
          if (res.status == 200) {
            this.setState({
              idFromUrl: this.props.match.params.id,
              creating: false,
              editing: false,
              data: res.data
            });
          } else {
            this.setState({
              notFound: true
            });
          }
        })
        .catch(err => {
          this.setState({
            notFound: true
          });
        });

    }
  }

  toggleStatus(active) {
    axios.patch("/api/customers/" + this.state.idFromUrl + "/status/" + active, this.state.data)
      .then(res => {
        if (res.status == 200) {
          this.setState({
            creating: false,
            editing: false,
            data: res.data,
            notification: {
              ...this.state.notification,
              display: true,
              severity: "success",
              message: "Cliente " + (active ? "Ativado" : "Desativado") + " com sucesso."
            }
          });
        } else {
          this.setState({
            notification: {
              ...this.state.notification,
              display: true,
              severity: "danger",
              message: "Falha ao " + active ? "Ativar" : "Desativar" + " cliente, tente novamente."
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
            message: "Falha ao " + active ? "Ativar" : "Desativar" + " cliente, tente novamente."
          }
        });
      });

  }

  createUser(skipDuplicated) {
    if (this.isValidToCreate(this.state.data)) {

      const payload = this.state.data;
      payload.addresses = payload.addresses.filter((a) => a.streetName.trim().length > 0);

      axios.post("/api/customers" + (skipDuplicated ? "?skipDuplicated=true" : ""), this.state.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.status === 201) {
            this.setState({
              creating: false,
              editing: false,
              data: res.data
            });
            this.props.history.push('/admin/customers/' + res.data.id + "?success=true")
          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao criar cliente, tente novamente."
              }
            });
          }
        })
        .catch(err => {
          if (err.response && err.response.status === 400 && err.response.data.actionMnemonic && err.response.data.actionMnemonic === "DUPLICATED_CUSTOMER") {

            this.setState({
              dialog: {
                title: "Possível duplicidade de cliente encontrada",
                display: true,
                fullWidth: true,
                maxWidth: "lg",
                message: (<div>
                  <span>Foram encontrados clientes com dados pessoais iguais ao que está sendo cadastrado.</span>
                  <p>Confirme os dados e caso queira prosseguir sabendo da possível duplicidade, clique em "Estou ciente e quero continuar".</p>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ textAlign: "center", width: "35%" }}>Nome</TableCell>
                        <TableCell style={{ textAlign: "center", width: "10%" }}>E-mail</TableCell>
                        <TableCell style={{ textAlign: "center", width: "15%" }}>CPF</TableCell>
                        <TableCell style={{ textAlign: "center", width: "15%" }}>RG</TableCell>
                        <TableCell style={{ textAlign: "center", width: "25%" }}>Unidade</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {err.response.data.data.data.map((prop, key) => {
                        return (
                          <TableRow key={key}>
                            <TableCell>{prop.name}</TableCell>
                            <TableCell>{prop.mail}</TableCell>
                            <TableCell>{prop.taxPayerIdentifier}</TableCell>
                            <TableCell>{prop.idCard}</TableCell>
                            <TableCell>{(this.props.companies.filter(e => e.id === prop.companyId)[0] || {}).name || ""}</TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <Tooltip title="Detalhes" arrow>
                                <span>
                                  <Button justIcon round color="transparent"
                                    onClick={e => this.props.history.push("/admin/customers/" + prop.id)}>
                                    <PersonOutlineIcon />
                                  </Button>
                                </span>
                              </Tooltip>

                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>),
                actions: [
                  {
                    text: "Cancelar",
                    color: "transparent",
                    autoFocus: true,
                    callback: () => {
                      this.setState({
                        dialog: {
                          ...this.state.dialog,
                          display: false
                        }
                      })
                    }
                  },
                  {
                    text: "Estou ciente e quero continuar",
                    color: "danger",
                    callback: () => {
                      this.createUser(true);
                    }
                  }
                ]
              }
            })

          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao criar cliente, tente novamente."
              }
            });
          }
        });

    }
  }

  editUser() {
    if (this.isValidToEdit(this.state.data)) {
      const payload = this.state.data;
      payload.addresses = payload.addresses.filter((a) => a.streetName.trim().length > 0);
      axios.put("/api/customers/" + this.state.idFromUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.status == 200) {
            this.setState({
              creating: false,
              editing: false,
              data: res.data,
              notification: {
                ...this.state.notification,
                display: true,
                severity: "success",
                message: "Alterações salvas com sucesso."
              }
            });

          } else {
            this.setState({
              notification: {
                ...this.state.notification,
                display: true,
                severity: "danger",
                message: "Falha ao salvar alterações, tente novamente."
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
              message: "Falha ao salvar alterações, tente novamente."
            }
          });
        });
    }
  }

  isValidToEdit(data) {
    return this.isValidToCreate(data);
  }

  isValidToCreate(data) {
    let i = 0;
    const invalidFields = {};

    if (!data.companyId) {
      invalidFields.companyId = true;
      i++;
    }

    if (!data.name || data.name.trim().length === 0) {
      invalidFields.name = true;
      i++;
    }

    if (!data.birthDate || data.birthDate.trim().length === 0) {
      invalidFields.birthDate = true;
      i++;
    }

    if (!data.idCard || data.idCard.trim().length === 0) {
      invalidFields.idCard = true;
      i++;
    }

    if (!data.taxPayerIdentifier || data.taxPayerIdentifier.trim().length === 0) {
      invalidFields.taxPayerIdentifier = true;
      i++;
    }

    if (!data.phones || data.phones.length == 0 || !data.phones[0].value || data.phones[0].value.trim().length === 0) {
      // fixme: validando somente primeiro telefone, possível bug!
      invalidFields.phones = true;
      i++
    }

    this.setState({
      validations: {
        ...this.state.validations,
        ...invalidFields
      },

      notification: {
        ...this.state.notification,
        display: i > 0,
        severity: "danger",
        message: invalidFields.phones ?
          "Ao menos um telefone é obrigatório."
          : "O campo " + (invalidFields.name ? "Nome"
            : (invalidFields.companyId ? "Unidade"
              : (invalidFields.birthDate ? "Data de nascimento"
                : (invalidFields.idCard ? "RG"
                  : (invalidFields.taxPayerIdentifier ? "CPF" : ""))))) + " é obrigatório."
      }
    });

    return i === 0;
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

        <Dialog
          fullWidth={this.state.dialog.fullWidth}
          maxWidth={this.state.dialog.maxWidth}
          open={this.state.dialog.display}
          onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
          <DialogTitle >{this.state.dialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.state.dialog.message}
            </DialogContentText>
          </DialogContent>
          {(this.state.dialog.actions && this.state.dialog.actions.length > 0) &&
            <DialogActions>
              {this.state.dialog.actions.map((e, i) => {
                return <Button
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
              })}

            </DialogActions>}
        </Dialog>




        {this.state.notFound &&
          <GridContainer>
            <GridItem xs={12} sm={12} style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>Não foi possível encontrar o cliente</h2>
              <Button color="transparent" onClick={e => this.props.history.push("/admin/customers")}>Voltar</Button>
            </GridItem>
          </GridContainer>}

        {!this.state.notFound &&
          <div>
            <Tabs value={this.state.tabs.value} onChange={(e, v) => this.setState({ tabs: { ...this.state.tabs, value: v } })}>
              <Tab label="Dados pessoais" />
              <Tab label="Outros" />
            </Tabs>
            <Divider style={{ width: "100%" }} />


            <div role="tabpanel" hidden={this.state.tabs.value !== 0}>
              {this.state.tabs.value === 0 && (


                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                      <CardBody>

                        <GridContainer>

                          <GridItem xs={12} sm={12} md={6}>
                            <CompanySelect id="companyId" labelText="Unidade"
                              inputProps={{
                                disabled: !this.state.editing,
                                onChange: e => this.setState({ data: { ...this.state.data, companyId: e.target.value } }),
                                value: this.state.data.companyId
                              }} />
                          </GridItem>

                          <GridItem xs={12} sm={12} md={6}>
                            <CustomInput formControlProps={{ fullWidth: true }}>
                              <div style={{ textAlign: "center", fontSize: "1.5em" }}>

                                <ElderTooltip birthDate={this.state.data.birthDate} />

                                {this.state.data.active !== null && <div style={{ display: "inline" }}>
                                  <small style={{ marginLeft: "30px" }}>Status </small>
                                  <span style={{ color: this.state.data.active ? "green" : "red" }}>
                                    {this.state.data.active ? "Ativo" : "Desativado"}
                                  </span>
                                </div>}
                              </div>
                            </CustomInput>
                          </GridItem>

                        </GridContainer>

                      </CardBody>
                    </Card>

                    <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                      <CardBody>

                        <h3><small>Dados pessoais</small></h3>
                        <GridContainer>

                          <GridItem xs={12} sm={12} md={6} lg={6}>
                            <CustomInput id="name" labelText="Nome" formControlProps={{ fullWidth: true }} error={this.state.validations.name}
                              inputProps={{
                                disabled: !this.state.editing,
                                value: this.state.data.name,
                                onChange: (e) => this.setState({ data: { ...this.state.data, name: e.target.value } }),
                                onFocus: () => this.setState({ validations: { ...this.state.validations, name: false } })
                              }} />
                          </GridItem>

                          <GridItem xs={12} sm={12} md={6} lg={6}>
                            <CustomInput id="mail" labelText="E-mail" formControlProps={{ fullWidth: true }}
                              inputProps={{
                                disabled: !this.state.editing,
                                value: this.state.data.mail,
                                onChange: (e) => this.setState({ data: { ...this.state.data, mail: e.target.value } })
                              }} />
                          </GridItem>

                          <GridItem xs={12} sm={12} md={6} lg={4}>
                            <CustomInput id="cpf" labelText="CPF" formControlProps={{ fullWidth: true }} error={this.state.validations.taxPayerIdentifier}
                              inputProps={{
                                disabled: !this.state.editing,
                                value: this.state.data.taxPayerIdentifier,
                                onChange: (e) => this.setState({ data: { ...this.state.data, taxPayerIdentifier: e.target.value.replace(/[^0-9]/g, '').substring(0, 11) } }),
                                onFocus: () => this.setState({ validations: { ...this.state.validations, taxPayerIdentifier: false } })
                              }} />
                          </GridItem>

                          <GridItem xs={12} sm={12} md={6} lg={4}>
                            <CustomInput id="rg" labelText="RG" formControlProps={{ fullWidth: true }} error={this.state.validations.idCard}
                              inputProps={{
                                disabled: !this.state.editing,
                                value: this.state.data.idCard,
                                onChange: (e) => this.setState({ data: { ...this.state.data, idCard: e.target.value.replace(/[^0-9x]/g, '').substring(0, 10) } }),
                                onFocus: () => this.setState({ validations: { ...this.state.validations, idCard: false } })
                              }} />
                          </GridItem>

                          <GridItem xs={12} sm={12} md={6} lg={4}>
                            <CustomInput id="birthdate" labelText="Data de Nascimento" labelProps={{ shrink: true }} formControlProps={{ fullWidth: true }}
                              error={this.state.validations.birthDate}
                              inputProps={{
                                type: "date",
                                disabled: !this.state.editing,
                                value: this.state.data.birthDate,
                                onChange: (e) => this.setState({ data: { ...this.state.data, birthDate: e.target.value } }),
                                onFocus: () => this.setState({ validations: { ...this.state.validations, birthDate: false } })
                              }} />
                          </GridItem>

                        </GridContainer>

                      </CardBody>
                    </Card>

                    <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                      <CardBody>
                        <h3><small>Telefones</small></h3>

                        <GridContainer>

                          {this.state.data.phones && this.state.data.phones.map((el, i) => {
                            return <GridItem xs={12} sm={12} md={12} lg={12} xl={12} key={i} style={{ borderLeft: "2px solid #cacaca", marginBottom: "10px" }}>

                              <GridContainer>

                                <GridItem xs={12} sm={3} md={2} lg={2}>
                                  <CustomInput select={true} labelText="Tipo"
                                    inputProps={{
                                      value: el.type,
                                      disabled: !this.state.editing,
                                      onChange: (e) => {

                                        this.setState({
                                          data: {
                                            ...this.state.data,
                                            phones: [
                                              ...this.state.data.phones.slice(0, i),
                                              {
                                                ...this.state.data.phones[i],
                                                type: e.target.value
                                              },
                                              ...this.state.data.phones.slice(i + 1),
                                            ]
                                          }
                                        });
                                      }

                                    }}
                                    formControlProps={{
                                      fullWidth: true
                                    }}>
                                    <option value={"MOBILE"}>Celular</option>
                                    <option value={"HOME"}>Residencial</option>
                                    <option value={"WORK"}>Trabalho</option>
                                    <option value={"OTHER"}>Outro</option>
                                  </CustomInput>
                                </GridItem>

                                <GridItem xs={12} sm={9} md={5} lg={3}>
                                  <CustomInput id={"phone-no-" + i} labelText="Número" formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                      disabled: !this.state.editing,
                                      value: el.value,
                                      onChange: (e) => {

                                        this.setState({
                                          data: {
                                            ...this.state.data,
                                            phones: [
                                              ...this.state.data.phones.slice(0, i),
                                              {
                                                ...this.state.data.phones[i],
                                                value: e.target.value
                                              },
                                              ...this.state.data.phones.slice(i + 1),
                                            ]
                                          }
                                        });
                                      }
                                    }} />
                                </GridItem>

                                <GridItem xs={12} sm={6} md={2} lg={2}>
                                  <CustomInput id={"phone-obs-" + i} labelText="Complemento" formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                      disabled: !this.state.editing,
                                      value: el.notes,
                                      onChange: (e) => {

                                        this.setState({
                                          data: {
                                            ...this.state.data,
                                            phones: [
                                              ...this.state.data.phones.slice(0, i),
                                              {
                                                ...this.state.data.phones[i],
                                                notes: e.target.value
                                              },
                                              ...this.state.data.phones.slice(i + 1),
                                            ]
                                          }
                                        });
                                      }
                                    }} />
                                </GridItem>

                                <GridItem xs={12} sm={6} md={2} lg={2}>
                                  <CustomInput id={"phone-alias-" + i} labelText="Apelido" formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                      disabled: !this.state.editing,
                                      value: el.alias,
                                      onChange: (e) => {

                                        this.setState({
                                          data: {
                                            ...this.state.data,
                                            phones: [
                                              ...this.state.data.phones.slice(0, i),
                                              {
                                                ...this.state.data.phones[i],
                                                alias: e.target.value
                                              },
                                              ...this.state.data.phones.slice(i + 1),
                                            ]
                                          }
                                        });
                                      }
                                    }} />
                                </GridItem>

                                {this.state.editing && i > 0 &&
                                  <GridItem xs={12} sm={12} md={1} style={{ textAlign: "center" }}>

                                    <CustomInput>
                                      <Hidden only={["xs", "sm"]}>
                                        <Tooltip title="Remover telefone" arrow>
                                          <IconButton size="large"
                                            onClick={e => {
                                              this.setState({
                                                data: {
                                                  ...this.state.data,
                                                  phones: [
                                                    ...this.state.data.phones.slice(0, i),
                                                    ...this.state.data.phones.slice(i + 1)
                                                  ]
                                                }
                                              });
                                            }}>
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </Hidden>
                                      <Hidden only={["md", "lg", "xl"]}>
                                        <Button color="danger"
                                          onClick={e => {
                                            this.setState({
                                              data: {
                                                ...this.state.data,
                                                phones: [
                                                  ...this.state.data.phones.slice(0, i),
                                                  ...this.state.data.phones.slice(i + 1)
                                                ]
                                              }
                                            });
                                          }}>
                                          <DeleteIcon /> Remover telefone
                                      </Button>
                                      </Hidden>
                                    </CustomInput>


                                  </GridItem>}

                              </GridContainer>
                            </GridItem>
                          })}

                          <GridItem xs={12} sm={12} md={1} style={{ textAlign: "center" }}>

                            {this.state.editing &&
                              <CustomInput>
                                <Tooltip title="Adicionar telefone" arrow>
                                  <div>
                                    <Button color="primary"
                                      onClick={e => this.setState({ data: { ...this.state.data, phones: this.state.data.phones.concat([{ type: "HOME", value: "", alias: "", notes: "" }]) } })}>
                                      <AddIcon />Adicionar Telefone</Button>
                                  </div>
                                </Tooltip>
                              </CustomInput>}
                          </GridItem>

                        </GridContainer>

                      </CardBody>
                    </Card>


                    <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                      <CardBody>

                        <h3><small>Endereços</small></h3>


                        {!this.state.creating && this.state.data && this.state.data.addresses && this.state.data.addresses.length <= 0 &&
                          <div>
                            <h4 style={{ textAlign: "center" }}>Nenhum endereço cadastrado.</h4>
                          </div>}

                        <GridContainer>

                          {this.state.data && this.state.data.addresses && this.state.data.addresses.length > 0 && this.state.data.addresses.map((el, i) => {
                            return (
                              <GridItem xs={12} sm={12} md={12} lg={12} xl={12} key={i} style={{ borderLeft: "2px solid #cacaca", marginBottom: "10px" }}>
                                <AddressComponent editing={this.state.editing} creating={this.state.editing} data={el} key={i}
                                  onChange={(address) =>
                                    this.setState({
                                      data: {
                                        ...this.state.data,
                                        addresses: [
                                          ...this.state.data.addresses.slice(0, i),
                                          {
                                            ...this.state.data.addresses[i],
                                            ...address
                                          },
                                          ...this.state.data.addresses.slice(i + 1),
                                        ]
                                      }
                                    })}
                                  onRemove={() =>
                                    this.setState({
                                      data: {
                                        ...this.state.data,
                                        addresses: [
                                          ...this.state.data.addresses.slice(0, i),
                                          ...this.state.data.addresses.slice(i + 1),
                                        ]
                                      }
                                    })} />
                              </GridItem>
                            );
                          })}

                        </GridContainer>

                        {this.state.editing &&
                          <CustomInput>
                            <Tooltip title="Adicionar endereço" arrow>
                              <div>
                                <Button color="primary"
                                  onClick={e => this.setState({ data: { ...this.state.data, addresses: this.state.data.addresses.concat([{ zipCode: "", streetName: "", streetNumber: "", streetNumberComplement: "", neighborhood: "", city: "", state: "SP", alias: "", notes: "" }]) } })}>
                                  <AddIcon />Adicionar Endereço</Button>
                              </div>
                            </Tooltip>
                          </CustomInput>}

                      </CardBody>
                    </Card>

                  </GridItem>
                </GridContainer>

              )}
            </div>

            <div role="tabpanel" hidden={this.state.tabs.value !== 1}>
              {this.state.tabs.value === 1 && (

                <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                  <CardBody>

                    <h3><small>Outras informações</small></h3>
                    <GridContainer>

                      <GridItem xs={12} sm={12} md={4} lg={3}>
                        <CustomInput formControlProps={{ fullWidth: true }}>
                          <p style={{ textAlign: "center" }}>Como ficou sabendo</p>
                        </CustomInput>

                      </GridItem>
                      <GridItem xs={12} sm={12} md={8} lg={8}>
                        <CustomInput formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.metadata.RECOMMENDATION,
                            onChange: (e) => this.setState({ data: { ...this.state.data, metadata: { ...this.state.data.metadata, RECOMMENDATION: e.target.value } } })
                          }} />
                      </GridItem>

                      <GridItem xs={12} sm={12} md={4} lg={3}>
                        <CustomInput formControlProps={{ fullWidth: true }}>
                          <p style={{ textAlign: "center" }}>Observações</p>
                        </CustomInput>

                      </GridItem>
                      <GridItem xs={12} sm={12} md={8} lg={8}>
                        <CustomInput textarea formControlProps={{ fullWidth: true }}
                          inputProps={{
                            rows: 4,
                            disabled: !this.state.editing,
                            value: this.state.data.metadata.NOTES,
                            onChange: (e) => this.setState({ data: { ...this.state.data, metadata: { ...this.state.data.metadata, NOTES: e.target.value } } })
                          }} />
                      </GridItem>


                    </GridContainer>

                  </CardBody>
                </Card>

              )}
            </div>

            <GridContainer>
              <GridItem xs={12}>

                {this.state.creating && <div>
                  <Button onClick={e => this.props.history.push("/admin/customers")}>Voltar</Button>
                  <Button color="success" onClick={e => this.createUser()}>Criar</Button>
                </div>}

                {(!this.state.creating && this.state.editing) &&
                  <div>
                    <Button onClick={e => {
                      this.setState({
                        creating: false,
                        editing: false
                      });
                      this.loadUser(true);
                    }}>Cancelar</Button>

                    <Button color="success" onClick={e => {
                      this.setState({
                        dialog: {
                          title: "Deseja continuar?",
                          fullWidth: false,
                          display: true,
                          message: "Cuidado! Essa ação irá alterar os dados do cliente já existentes.",
                          actions: [
                            {
                              text: "Cancelar",
                              color: "transparent",
                              autoFocus: true,
                              callback: () => {
                                this.setState({
                                  dialog: {
                                    ...this.state.dialog,
                                    display: false
                                  }
                                })
                              }
                            },
                            {
                              text: "Estou ciente e quero continuar",
                              color: "danger",
                              callback: () => {
                                this.editUser();
                                this.setState({
                                  dialog: {
                                    ...this.state.dialog,
                                    display: false
                                  }
                                });
                              }
                            }
                          ]
                        }
                      })

                    }}>Salvar</Button>

                    <Button color={this.state.data.active ? "danger" : "warning"} onClick={e => {
                      this.setState({
                        dialog: {
                          title: "Deseja continuar?",
                          display: true,
                          fullWidth: false,
                          message: this.state.data.active
                            ? "Cuidado! Ao desativar um cliente não será possível efetuar novas ações relacionadas ao mesmo."
                            : "Cuidado! Ao ativar um cliente será possível efetuar novas ações relacionadas ao mesmo.",
                          actions: [
                            {
                              text: "Cancelar",
                              color: "transparent",
                              autoFocus: true,
                              callback: () => {
                                this.setState({
                                  dialog: {
                                    ...this.state.dialog,
                                    display: false
                                  }
                                })
                              }
                            },
                            {
                              text: "Estou ciente e quero continuar",
                              color: "danger",
                              callback: () => {
                                this.toggleStatus(!this.state.data.active);

                                this.setState({
                                  dialog: {
                                    ...this.state.dialog,
                                    display: false
                                  }
                                });
                              }
                            }
                          ]
                        }
                      })


                    }}>{this.state.data.active ? "Desativar Cliente" : "Ativar cliente"}</Button>

                  </div>}

                {(!this.state.creating && !this.state.editing) &&
                  <div>
                    <Button onClick={e => this.props.history.push("/admin/customers")}>Voltar</Button>
                    <Button color="warning" onClick={e => {
                      this.setState({
                        creating: false,
                        editing: true
                      })
                    }}>Editar</Button>
                  </div>}

              </GridItem>
            </GridContainer>


          </div>
        }

      </div >
    );
  }
}


const mapStateToProps = state => {
  return {
    account: state.account,
    companies: state.common.data.companies
  };
}


export default connect(mapStateToProps)(
  withRouter(CustomerDetails));