import React from "react";
import Moment from 'react-moment';

// @material-ui/core components
import { withStyles } from '@material-ui/styles';

import Search from "@material-ui/icons/Search";

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import { NativeSelect, InputLabel, Table, TableHead, TableRow, TableCell, TableBody } from "@material-ui/core";
import { connect } from "react-redux";
import { fetchCompanies } from "store/actions";
import CardFooter from "components/Card/CardFooter";
import CompanySelect from "components/CompanySelect/CompanySelect";

import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';

import Tooltip from '@material-ui/core/Tooltip';
import ListIcon from '@material-ui/icons/List';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';


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



const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);



const styles = theme => ({
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
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
      lineHeight: "1"
    }
  },
  searchWrapper: {
    width: "100%"
  },
  margin: {
    margin: "0"
  }
});


class CustomerSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayMoreFilters: false,
      params: {
        name: "",
        code: "",
        companyId: null,
        mail: "",
        city: "",
        taxPayerIdentifier: "",
        idCard: "",
        active: "true",
        pagination: {
          limit: 1,
          offset: 0
        }
      },
      data: {
        limit: 20,
        offset: 0,
        total: 0,
        customers: []
      }
    }

    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.setState({
      params: {
        ...this.state.params,
        companyId: this.props.account ? this.props.account.companyId : null
      }
    });
    this.search(0);
  }

  search(offset = 0, limit = 1) {
    if (!this.props.account.companyId) {
      return;
    }

    const params = {
      offset: offset,
      limit: limit,
      companyId: this.props.account.companyId,
      active: this.state.params.active
    };

    if (this.state.params.name && this.state.params.name.trim().length > 0) {
      params.name = this.state.params.name;
    }

    if (this.state.params.code && this.state.params.code.trim().length > 0) {
      params.code = this.state.params.code;
    }

    if (this.state.params.mail && this.state.params.mail.trim().length > 0) {
      params.mail = this.state.params.mail;
    }
    
    if (this.state.params.city && this.state.params.city.trim().length > 0) {
      params.city = this.state.params.city;
    }

    if (this.state.params.taxPayerIdentifier && this.state.params.taxPayerIdentifier.trim().length > 0) {
      params.taxPayerIdentifier = this.state.params.taxPayerIdentifier;
    }

    if (this.state.params.idCard && this.state.params.idCard.trim().length > 0) {
      params.idCard = this.state.params.idCard;
    }


    axios.get('/api/customers', {
      headers: {
        "Accept": "application/json"
      },
      params
    })
      .then(res => {
        this.setState({
          data: {
            ...this.state.data,
            limit: res.data.limit,
            offset: res.data.offset,
            total: res.data.total,
            customers: res.data.data || []
          }
        })
      })
      .catch(err => {

      });

  }

  openDetails(customer) {
    this.props.history.push('/admin/customers/' + customer.id);
  }

  openAttendances(customer) {
    this.props.history.push('/admin/attendances/' + customer.id);

  }

  openPayments(customer) {
    this.props.history.push('/admin/payments/' + customer.id);

  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <GridContainer>

          <GridItem sm={12} md={5} lg={5}>
            <CustomInput
              formControlProps={{
                fullWidth: true,
                className: classes.margin + " " + classes.search
              }}
              inputProps={{
                placeholder: "Nome",
                onChange: e => this.setState({ params: { ...this.state.params, name: e.target.value } }),
                value: this.state.params.name
              }}
            />
          </GridItem>

          <GridItem sm={12} md={2} lg={2}>
            <CustomInput
              formControlProps={{
                fullWidth: true,
                className: classes.margin + " " + classes.search
              }}
              inputProps={{
                placeholder: "Código",
                "width": "100%",
                onChange: e => this.setState({ params: { ...this.state.params, code: e.target.value } }),
                value: this.state.params.code
              }}
            />
          </GridItem>

          <GridItem sm={12} md={4} lg={4}>
            <CompanySelect id="companyId" labelText="Unidade"
              formControlProps={{
                fullWidth: true,
                className: classes.margin + " " + classes.search
              }}
              onChange={e => this.setState({ params: { ...this.state.params, companyId: e.target.value } })}
              value={this.state.params.companyId} />
          </GridItem>

          <GridItem sm={12} md={1} style={{ textAlign: "center" }}>
            <Button color="white" color="primary" justIcon round onClick={e=> this.search(0)}>
              <Search />
            </Button>
          </GridItem>

        </GridContainer>

        <a href="#" onClick={(e) => {
          this.setState({ displayMoreFilters: !this.state.displayMoreFilters });
          e.preventDefault();
        }}>
          <small>Exibir {this.state.displayMoreFilters && "menos"} {!this.state.displayMoreFilters && "mais"} filtros</small></a>

        {this.state.displayMoreFilters &&
          <GridContainer>
            <GridItem sm={12} md={6} lg={3}>
              <CustomInput
                formControlProps={{
                  fullWidth: true,
                  className: classes.margin + " " + classes.search
                }}
                inputProps={{
                  placeholder: "E-mail",
                  inputProps: {
                    "width": "100%",
                    onChange: e => this.setState({ params: { ...this.state.params, mail: e.target.value } }),
                    value: this.state.params.mail
                  }
                }}
              />
            </GridItem>

            <GridItem sm={12} md={6} lg={3}>
              <CustomInput
                formControlProps={{
                  fullWidth: true,
                  className: classes.margin + " " + classes.search
                }}
                inputProps={{
                  placeholder: "Cidade",
                  inputProps: {
                    "width": "100%",
                    onChange: e => this.setState({ params: { ...this.state.params, city: e.target.value } }),
                    value: this.state.params.city
                  }
                }}
              />
            </GridItem>

            <GridItem sm={12} md={6} lg={2}>
              <CustomInput
                formControlProps={{
                  fullWidth: true,
                  className: classes.margin + " " + classes.search
                }}
                inputProps={{
                  placeholder: "CPF",
                  inputProps: {
                    "width": "100%",
                    onChange: e => this.setState({ params: { ...this.state.params, taxPayerIdentifier: e.target.value } }),
                    value: this.state.params.taxPayerIdentifier
                  }
                }}
              />
            </GridItem>

            <GridItem sm={12} md={6} lg={2}>
              <CustomInput
                formControlProps={{
                  fullWidth: true,
                  className: classes.margin + " " + classes.search
                }}
                inputProps={{
                  placeholder: "RG",
                  inputProps: {
                    "width": "100%",
                    onChange: e => this.setState({ params: { ...this.state.params, idCard: e.target.value } }),
                    value: this.state.params.idCard
                  }
                }}
              />
            </GridItem>

            <GridItem sm={12} md={3} lg={2}>
              <CustomInput select={true} labelText="Status"
                inputProps={{
                  onChange: e => this.setState({ params: { ...this.state.params, active: e.target.value } }),
                  value: this.state.params.active
                }}
                formControlProps={{
                  fullWidth: true,
                  className: classes.margin + " " + classes.search
                }}>
                <option value={"true"}>Ativo</option>
                <option value={"false"}>Desativado</option>
              </CustomInput>
            </GridItem>

          </GridContainer>}


        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardBody>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Código</TableCell>
                      {/* <TableCell>Cidade</TableCell> */}
                      <TableCell>Status</TableCell>
                      <TableCell>Criado em</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.data.customers && this.state.data.customers.length > 0 && this.state.data.customers.map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell>{prop.name}</TableCell>
                          <TableCell>{prop.code}</TableCell>
                          {/* <TableCell>{prop.address.city}</TableCell> */}
                          <TableCell>{prop.active ? "Ativo" : "Desativado"}</TableCell>
                          <TableCell><Moment date={prop.createdAt} format="DD/MM/YYYY" /></TableCell>
                          <TableCell>
                            <Tooltip title="Detalhes" arrow>
                              <span>
                                <Button justIcon round color="transparent"
                                  onClick={e => this.openDetails(prop)}>
                                  <PersonOutlineIcon />
                                  
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title="Atendimentos" arrow>
                              <span>
                                <Button justIcon round color="transparent"
                                  onClick={e => this.openAttendances(prop)}>
                                  <ListIcon />
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title="Pagamentos" arrow>
                              <span>
                                <Button justIcon round color="transparent"
                                  onClick={e => this.openPayments(prop)}>
                                  <AttachMoneyIcon />
                                </Button>
                              </span>
                            </Tooltip>

                            
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {this.state.data.customers.length == 0 &&
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <h4>Nenhum cliente cadastrado, clique em <span style={{ fontWeight: "bold" }}>Adicionar</span> para criar um novo cliente.</h4>
                  </div>}

                <GridContainer>
                  <GridItem sm={12} style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex" }}>

                      <Tooltip title="Início" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.data.offset == 0}
                            onClick={e => this.search(0)}>
                            <SkipPreviousIcon /></Button>
                        </div>
                      </Tooltip>
                      <Tooltip title="Anterior" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.data.offset == 0}
                            onClick={e => this.search(this.state.data.offset - this.state.data.limit)}>
                            <NavigateBeforeIcon /></Button>
                        </div>
                      </Tooltip>

                      <p>Exibindo {Math.min(this.state.data.total, this.state.data.offset + this.state.data.limit)} de {this.state.data.total}</p>

                      <Tooltip title="Próxima" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.data.offset + this.state.data.limit >= this.state.data.total}
                            onClick={e => this.search(this.state.data.offset + this.state.data.limit)}>
                            <NavigateNextIcon /></Button>
                        </div>
                      </Tooltip>

                      <Tooltip title="Última" arrow>
                        <div>
                          <Button justIcon round color="transparent"
                            disabled={this.state.data.offset + this.state.data.limit >= this.state.data.total}
                            onClick={e => this.search(this.state.data.total - this.state.data.limit)}>
                            <SkipNextIcon /></Button>
                        </div>
                      </Tooltip>

                    </div>
                  </GridItem>
                </GridContainer>



              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>

        <Button color="success" onClick={e => this.props.history.push("/admin/customers/create")}>Adicionar</Button>

      </div>
    );
  }
}


const mapStateToProps = state => {
  return {
    account: state.account
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(CustomerSearch));