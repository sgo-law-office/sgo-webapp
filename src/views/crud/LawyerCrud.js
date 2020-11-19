import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { fetchCompanies, fetchLawyers } from "store/actions";
import Button from "components/CustomButtons/Button.js";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import CompanySelect from "components/CompanySelect/CompanySelect";
import CustomInput from "components/CustomInput/CustomInput";
import SearchIcon from '@material-ui/icons/Search';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';


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


class LawyerCrud extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dialog: {
                display: false,
                query: {
                    companyId: null
                },
                data: {
                    accounts: []
                }
            }
        };
    }

    componentDidMount() {
        this.props.fetchCompanies();
        this.props.fetchLawyers(this.props.account.companyId);

        this.setState({
            dialog: {
                ...this.state.dialog,
                query: {
                    ...this.state.dialog.query,
                    companyId: this.props.account.companyId
                }
            }
        });
    }

    searchAccounts(companyId) {
        axios.get("/api/accounts/filter?companyId=" + (companyId || this.state.dialog.query.companyId), {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    this.setState({
                        dialog: {
                            ...this.state.dialog,
                            data: {
                                accounts: res.data.data
                            }
                        }
                    });
                } else {
                    this.setState({

                    });
                }
            })
            .catch(err => {
                this.setState({

                });
            });
    }

    selectAccount(account) {
        axios.post("/api/lawyers", {
            accountId: account.id
        }, {
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
                        }
                    });
                    this.props.fetchLawyers(this.state.dialog.query.companyId);
                } else {
                    this.setState({

                    });
                }
            })
            .catch(err => {
                this.setState({

                });
            });
    }

    removeLawyer(lawyer) {
        axios.delete("/api/lawyers/" + lawyer.accountId, {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    this.props.fetchLawyers(this.state.dialog.query.companyId);
                } else {
                    this.setState({

                    });
                }
            })
            .catch(err => {
                this.setState({

                });
            });
    }

    render() {
        const lawyers = this.props.lawyers;
        return (
            <div>


                <Dialog fullWidth maxWidth="sm" open={this.state.dialog.display} onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
                    <DialogTitle>Adicionar advogado</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <p>Busca de usuários do sistema</p>
                            <GridContainer>
                                <GridItem sm={12} md={10}>
                                    <CompanySelect id="companyId" labelText="Unidade"
                                        inputProps={{
                                            onChange: e => {
                                                this.setState({
                                                    dialog: {
                                                        ...this.state.dialog,
                                                        query: {
                                                            ...this.state.dialog.query,
                                                            companyId: e.target.value
                                                        }
                                                    }
                                                });
                                                this.searchAccounts(e.target.value);
                                            },
                                            value: this.state.dialog.query.companyId
                                        }} />
                                </GridItem>

                                <GridItem sm={12} md={2} lg={2}>
                                    <CustomInput>
                                        <Button color="primary" justIcon round
                                            onClick={e => this.searchAccounts()}>
                                            <SearchIcon /></Button>
                                    </CustomInput>
                                </GridItem>

                            </GridContainer>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ textAlign: "center", width: "70%" }}>Nome do usuário</TableCell>
                                        <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {this.props.lawyers && this.state.dialog.data && this.state.dialog.data.accounts && this.state.dialog.data.accounts.length > 0 &&
                                        this.state.dialog.data.accounts
                                            .filter(el => lawyers.data.filter(la => la.accountId == el.id).length == 0)
                                            .map((prop, key) => {
                                                return (
                                                    <TableRow key={key}>
                                                        <TableCell style={{ padding: "5px 16px", width: "70%" }}>{prop.name}</TableCell>
                                                        <TableCell style={{ textAlign: "center" }}>
                                                            <Tooltip title="Selecionar" arrow>
                                                                <span>
                                                                    <Button justIcon round color="transparent" onClick={e => this.selectAccount(prop)}>
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
                        <Button color="transparent" autoFocus onClick={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>




                <h3>Cadastros de Advogados</h3>

                <p>&nbsp;</p>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                        <Card>
                            <CardBody>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ width: "40%", textAlign: "center" }}>Nome do Advogado</TableCell>
                                            <TableCell style={{ width: "40%", textAlign: "center" }}>Unidade</TableCell>
                                            <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {this.props.companies && this.props.lawyers && this.props.lawyers.data.length > 0 && this.props.lawyers.data.map((prop, key) => {
                                            return (
                                                <TableRow key={key}>
                                                    <TableCell style={{ width: "40%" }}>{prop.name}</TableCell>
                                                    <TableCell style={{ width: "40%" }}>{this.props.companies.filter(el => el.id == prop.companyId).map((el, idx) => el.name)}</TableCell>


                                                    <TableCell style={{ padding: "5px 16px", textAlign: "center" }}>
                                                        <Tooltip title="Remover advogado" arrow>
                                                            <span>
                                                                <Button justIcon round color="transparent"
                                                                    onClick={e => this.removeLawyer(prop)}>
                                                                    <DeleteIcon />

                                                                </Button>
                                                            </span>
                                                        </Tooltip>

                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {!(this.props.lawyers && this.props.lawyers.data && this.props.lawyers.data.length > 0) &&
                                    <div style={{ width: "100%" }}>
                                        <h4 style={{ textAlign: "center" }}>Nenhum advogado encontrado.</h4>
                                        <span><ArrowDownwardIcon />Clique em <span style={{ fontWeight: "bold" }}>Adicionar advogado</span> para criar um novo advogado.</span>
                                    </div>}


                            </CardBody>
                        </Card>
                    </GridItem>
                </GridContainer>

                <div style={{ margin: "15px 0" }}>
                    <Button onClick={e => this.props.history.push("/admin/registrations")}>Voltar</Button>
                    <Button color="success" onClick={e => { this.setState({ dialog: { ...this.state.dialog, display: true } }); this.searchAccounts() }}>Adicionar advogado</Button>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        account: state.account,
        companies: state.common.data.companies,
        lawyers: state.common.data.lawyers
    };
}

const mapDispatchToProps = dispatch => ({
    fetchCompanies: (callback) => dispatch(fetchCompanies(callback, true)),
    fetchLawyers: (companyId, callback) => dispatch(fetchLawyers(companyId, callback, true))
})

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(LawyerCrud));