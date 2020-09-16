import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { withRouter } from "react-router-dom";
import CustomInput from "components/CustomInput/CustomInput";
import { Card, Divider, IconButton, NativeSelect, Tooltip } from "@material-ui/core";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import CardFooter from "components/Card/CardFooter";
import Button from "components/CustomButtons/Button";
import { connect } from "react-redux";
import CompanySelect from "components/CompanySelect/CompanySelect";
import SearchIcon from '@material-ui/icons/Search';
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

      cepText: "",
      cepSearched: false,
      validCepInput: false,
      addressFromCep: this.getInitialAddressFromCepState(),

      data: this.getInitialDataState(),

      validations: {
        companyId: false,
        name: false,
        mail: false,
        birthDate: false,
        taxPayerIdentifier: false,
        idCard: false,
      }
    }
  }

  getInitialDataState() {
    return {
      id: null,
      code: "O código será gerado após a criação do cliente",
      active: null,
      companyId: null,
      name: "",
      mail: "",
      birthDate: "",
      taxPayerIdentifier: "",
      idCard: "",
      address: this.getInitialDataAddressState(),
      phones: [{
        type: "MOBILE",
        value: "",
        alias: "",
        notes: ""
      }]
    }
  }

  getInitialDataAddressState() {
    return {
      zipCode: "",
      streetName: "",
      streetNumber: "",
      streetNumberComplement: "",
      neighborhood: "",
      city: "",
      state: "SP",
    }
  }

  getInitialAddressFromCepState() {
    return {
      streetName: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: ""
    };
  }

  componentDidMount() {
    const data = this.props.customer || {
      ...this.state.data,
      companyId: this.props.account ? this.props.account.companyId : null
    };
    this.setState({
      // todo: get from history path /create or /uuid
      creating: this.props.history.location.pathname === "/admin/customers/create",
      editing: this.props.history.location.pathname === "/admin/customers/create",
      data
    });

    if (this.props.match && this.props.match.params && this.props.match.params.id) {
      this.loadUser();
    }
  }

  selectCompanyBranch(e) {
    this.setState({
      companyId: e.target.value
    })
  }

  cepInputKeyPress(e) {
    if (e.key === 'Enter') {
      this.fetchCep();
    }
  }

  fetchCep() {
    if (this.state.cepText.length === 9) {
      axios.get('/api/cep?cep=' + this.state.cepText.replace(/^\D+/g, ''), {
        headers: {
          "Accept": "application/json"
        }
      })
        .then(res => {
          if (res.status == 200) {
            const { data } = res;
            if (data.state) {
              this.setState({
                cepSearched: true,
                validCepInput: true,
                addressFromCep: data,
                data: {
                  ...this.state.data,
                  address: {
                    ...this.state.address,
                    zipCode: data.zipCode,
                    streetName: data.streetName,
                    neighborhood: data.neighborhood,
                    city: data.city,
                    state: data.state
                  }

                }
              });
            } else {
              this.setState({
                cepSearched: true,
                validCepInput: false,
                addressFromCep: this.getInitialAddressFromCepState(),
                data: {
                  ...this.state.data,
                  address: this.getInitialDataAddressState()
                }
              })
            }
          } else {
            this.setState({
              validCepInput: false,
              cepSearched: true,
              addressFromCep: this.getInitialAddressFromCepState(),
              data: {
                ...this.state.data,
                address: this.getInitialDataAddressState()
              }
            })
          }
        })
        .catch(err => {
          this.setState({
            validCepInput: false,
            addressFromCep: this.getInitialAddressFromCepState(),
            data: {
              ...this.state.data,
              address: this.getInitialDataAddressState()
            }
          })
        })
    }
  }

  changeCep(e) {
    var sanitizedValue = e.target.value.substring(0, 9).replace(/^(\d{5})(\d).*/, '$1-$2');
    this.setState({
      cepSearched: false,
      validCepInput: false,
      addressFromCep: this.getInitialAddressFromCepState(),
      cepText: sanitizedValue
    });
  }

  loadUser() {
    if (this.props.match && this.props.match.params.id && !this.state.data.id) {
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
            data: res.data
          })
        } else {
          // todo falha ao togglear
        }
      })
      .catch(err => {
        // todo falha ao togglear
      });

  }

  createUser() {
    if (this.isValidToCreate(this.state.data)) {

      axios.post("/api/customers", this.state.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.status == 201) {
            this.setState({
              creating: false,
              editing: false,
              data: res.data
            })
            // todo toast sucesso
            this.props.history.push('/admin/customers/' + res.data.id)
          } else {
            // todo falha ao criar
          }
        })
        .catch(err => {
          // todo falha ao criar
        });

    }
  }

  editUser() {
    if (this.isValidToEdit(this.state.data)) {
      axios.put("/api/customers/" + this.state.idFromUrl, this.state.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.status == 200) {
            this.setState({
              creating: false,
              editing: false,
              data: res.data
            })
            // todo toast sucesso
          } else {
            // todo falha ao criar
          }
        })
        .catch(err => {
          // todo falha ao criar
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

    /// todo toast de erro
    this.setState({
      validations: {
        ...this.state.validations,
        ...invalidFields
      }
    });

    return i == 0;
  }

  render() {
    return (
      <div>
        {this.state.notFound &&
          <GridContainer>
            <GridItem sm={12} style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>Não foi possível encontrar o cliente</h2>
              <Button color="transparent" onClick={e => this.props.history.push("/admin/customers")}>Voltar</Button>
            </GridItem>
          </GridContainer>
        }

        {!this.state.notFound &&
          <div>
            {this.state.data.active !== null &&
              <p style={{ textAlign: "right", fontSize: "1.5em" }}>
                {this.state.data.active && <div>
                  <p style={{ color: "green" }}><small style={{ color: "grey" }}>Status&nbsp;&nbsp;</small> Ativo</p>
                </div>}
                {!this.state.data.active && <div>
                  <p style={{ color: "red" }}><small style={{ color: "grey" }}>Status&nbsp;&nbsp;</small> Desativado</p>
                </div>}
              </p>}
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}>
                <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                  <CardBody>

                    <GridContainer>

                      <GridItem sm={12} md={6}>
                        <CustomInput id="code" labelText="Código"
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            value: this.state.data.code,
                            disabled: true
                          }} />
                      </GridItem>

                      <GridItem sm={12} md={6}>
                        <CompanySelect id="companyId" labelText="Unidade"
                          inputProps={{
                            disabled: !this.state.editing,
                            onChange: e => this.setState({ data: { ...this.state.data, companyId: e.target.value } }),
                            value: this.state.data.companyId
                          }} />
                      </GridItem>

                    </GridContainer>

                  </CardBody>
                </Card>

                <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                  <CardBody>

                    <h3><small>Dados pessoais</small></h3>
                    <GridContainer>

                      <GridItem sm={12} md={6} lg={6}>
                        <CustomInput id="name" labelText="Nome" formControlProps={{ fullWidth: true }} error={this.state.validations.name}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.name,
                            onChange: (e) => this.setState({ data: { ...this.state.data, name: e.target.value } }),
                            onFocus: () => this.setState({ validations: { ...this.state.validations, name: false } })
                          }} />
                      </GridItem>

                      <GridItem sm={12} md={6} lg={6}>
                        <CustomInput id="mail" labelText="E-mail" formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.mail,
                            onChange: (e) => this.setState({ data: { ...this.state.data, mail: e.target.value } })
                          }} />
                      </GridItem>

                      <GridItem sm={12} md={6} lg={4}>
                        <CustomInput id="cpf" labelText="CPF" formControlProps={{ fullWidth: true }} error={this.state.validations.taxPayerIdentifier}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.taxPayerIdentifier,
                            onChange: (e) => this.setState({ data: { ...this.state.data, taxPayerIdentifier: e.target.value.replace(/[^0-9]/g, '').substring(0, 11) } }),
                            onFocus: () => this.setState({ validations: { ...this.state.validations, taxPayerIdentifier: false } })
                          }} />
                      </GridItem>

                      <GridItem sm={12} md={6} lg={4}>
                        <CustomInput id="rg" labelText="RG" formControlProps={{ fullWidth: true }} error={this.state.validations.idCard}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.idCard,
                            onChange: (e) => this.setState({ data: { ...this.state.data, idCard: e.target.value.replace(/[^0-9x]/g,'').substring(0, 10) } }),
                            onFocus: () => this.setState({ validations: { ...this.state.validations, idCard: false } })
                          }} />
                      </GridItem>

                      <GridItem sm={12} md={6} lg={4}>
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

                    <h4><small>Telefones</small></h4>

                    <GridContainer>

                      {this.state.data.phones && this.state.data.phones.map((el, i) => {
                        return <GridItem sm={12} key={i}>

                          <GridContainer>

                            <GridItem sm={3} md={2} lg={2}>
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

                            <GridItem sm={9} md={5} lg={3}>
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

                            <GridItem sm={6} md={3} lg={2}>
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

                            <GridItem sm={6} md={2} lg={2}>
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
                              <GridItem sm={1}>
                                <CustomInput>
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
                                </CustomInput>
                              </GridItem>}

                          </GridContainer>
                        </GridItem>
                      })}

                      <GridItem sm={1}>

                        {this.state.editing &&
                          <CustomInput>
                            <Tooltip title="Adicionar telefone" arrow>
                              <div>
                              <Button color="primary" justIcon round
                                onClick={e => this.setState({ data: { ...this.state.data, phones: this.state.data.phones.concat([{ type: "HOME", value: "", alias: "", notes: "" }]) } })}>
                                <AddIcon /></Button>
                                </div>
                            </Tooltip>
                          </CustomInput>}
                      </GridItem>

                    </GridContainer>

                  </CardBody>
                </Card>


                <Card style={{ marginTop: "30px", marginBottom: "30px", padding: "0 15px 20px 15px" }}>
                  <CardBody>

                    <h3><small>Endereço</small></h3>
                    <GridContainer>
                      <GridItem sm={6} md={4} lg={2}>
                        <CustomInput id="address-cep" labelText="CEP"
                          success={this.state.cepSearched && this.state.validCepInput}
                          error={this.state.cepSearched && !this.state.validCepInput}
                          formControlProps={{ fullWidth: false }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.cepText || this.state.data.address.zipCode,
                            onChange: this.changeCep.bind(this),
                            onKeyPress: this.cepInputKeyPress.bind(this)
                          }} />
                      </GridItem>
                      <GridItem sm={3}>
                        {this.state.editing &&
                          <CustomInput>
                            <Button color="primary" justIcon round
                              disabled={!this.state.editing || this.state.cepText.length !== 9}
                              onClick={this.fetchCep.bind(this)}><SearchIcon /></Button>
                          </CustomInput>}
                      </GridItem>

                    </GridContainer>

                    <GridContainer>

                      <GridItem sm={12} md={6} lg={6}>
                        <CustomInput id="streetName" labelText="Rua"
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.address.streetName,
                            onChange: (e) => this.setState({
                              data: {
                                ...this.state.data,
                                address: {
                                  ...this.state.data.address,
                                  streetName: e.target.value
                                }
                              }
                            })
                          }} />
                      </GridItem>

                      <GridItem sm={6} md={3} lg={3}>
                        <CustomInput id="streetNumber" labelText="Número"
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.address.streetNumber,
                            onChange: (e) => this.setState({
                              data: {
                                ...this.state.data,
                                address: {
                                  ...this.state.data.address,
                                  streetNumber: e.target.value
                                }
                              }
                            })
                          }} />
                      </GridItem>

                      <GridItem sm={6} md={3} lg={3}>
                        <CustomInput id="streetNumberComplement" labelText="Complemento"
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.address.streetNumberComplement,
                            onChange: (e) => this.setState({
                              data: {
                                ...this.state.data,
                                address: {
                                  ...this.state.data.address,
                                  streetNumberComplement: e.target.value
                                }
                              }
                            })
                          }} />
                      </GridItem>

                      <GridItem sm={12} md={5} lg={5}>
                        <CustomInput id="neighborhood" labelText="Bairro"
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.address.neighborhood,
                            onChange: (e) => this.setState({
                              data: {
                                ...this.state.data,
                                address: {
                                  ...this.state.data.address,
                                  neighborhood: e.target.value
                                }
                              }
                            })
                          }} />
                      </GridItem>

                      <GridItem sm={8} md={5} lg={5}>
                        <CustomInput id="city" labelText="Cidade"
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.address.city,
                            onChange: (e) => this.setState({
                              data: {
                                ...this.state.data,
                                address: {
                                  ...this.state.data.address,
                                  city: e.target.value
                                }
                              }
                            })
                          }} />
                      </GridItem>

                      <GridItem sm={4} md={2} lg={2}>
                        <CustomInput id="state" labelText="Estado" select={true}
                          formControlProps={{ fullWidth: true }}
                          inputProps={{
                            disabled: !this.state.editing,
                            value: this.state.data.address.state,
                            onChange: (e) => this.setState({
                              data: {
                                ...this.state.data,
                                address: {
                                  ...this.state.data.address,
                                  state: e.target.value
                                }
                              }
                            })
                          }}>
                          {this.props.common.data.states.map((e, i) => {
                            return (<option value={e} key={i}>{e}</option>)
                          })}
                        </CustomInput>
                      </GridItem>
                    </GridContainer>
                  </CardBody>
                </Card>

                {this.state.creating && <div>
                  <Button onClick={e => this.props.history.push("/admin/customers")}>Voltar</Button>
                  <Button color="success" onClick={this.createUser.bind(this)}>Criar</Button>
                </div>}

                {(!this.state.creating && this.state.editing) &&
                  <div>
                    <Button onClick={e => {
                      this.setState({
                        creating: false,
                        editing: false
                      });
                      // todo fetch customer again and override data (pristine)
                    }}>Cancelar</Button>

                    <Button color="success" onClick={e => {
                      // todo confirmação
                      this.editUser()
                    }}>Salvar</Button>

                    <Button color={this.state.data.active ? "danger" : "warning"} onClick={e => {
                      // todo confirmação
                      this.toggleStatus(!this.state.data.active);
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
          </div>}
          {JSON.stringify(this.state)}

      </div >
    );
  }
}


const mapStateToProps = state => {
  return {
    jwt: state.jwt,
    account: state.account,
    common: {
      data: {
        states: state.common.data.states
      }
    }
  };
}


export default connect(mapStateToProps)(
  withRouter(CustomerDetails));