import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { fetchProcessActions } from "store/actions";
import Button from "components/CustomButtons/Button.js";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import CustomInput from "components/CustomInput/CustomInput";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
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


class ProcessActionCrud extends React.Component {

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
                    notes: ""
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
        this.props.fetchProcessActions((actions) => this.setState({ pagination: { ...this.state.pagination, total: actions.total } }));
    }

    createProcessAction() {
        if (!this.state.dialog.data.name || this.state.dialog.data.name.trim().length === 0) {
            this.setState({
                notification: {
                    ...this.state.notification,
                    display: true,
                    severity: "danger",
                    message: "O nome da ação é obrigatório."
                }
            });
            return;
        }

        axios.post("/api/process-actions", this.state.dialog.data, {
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
                            message: "Ação criada com sucesso."
                        }
                    });
                    this.props.fetchProcessActions((processActions) => this.setState({ pagination: { ...this.state.pagination, total: processActions.total } }));
                } else {
                    this.setState({
                        notification: {
                            ...this.state.notification,
                            display: true,
                            severity: "danger",
                            message: "Falha ao criar ação, tente novamente."
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
                        message: "Falha ao criar ação, tente novamente."
                    }
                });
            });
    }

    updateProcessAction() {
        if (!this.state.dialog.data.name || this.state.dialog.data.name.trim().length === 0 || !this.state.dialog.data.id) {
            this.setState({
                notification: {
                    ...this.state.notification,
                    display: true,
                    severity: "danger",
                    message: "O nome da ação é obrigatório."
                }
            });
            return;
        }

        axios.put("/api/process-actions/" + this.state.dialog.data.id, this.state.dialog.data, {
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
                            message: "Ação alterada com sucesso."
                        }
                    });
                    this.props.fetchProcessActions((processActions) => this.setState({ pagination: { ...this.state.pagination, total: processActions.total } }));
                } else {
                    this.setState({
                        notification: {
                            ...this.state.notification,
                            display: true,
                            severity: "danger",
                            message: "Falha ao atualizar ação, tente novamente."
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
                        message: "Falha ao atualizar ação, tente novamente."
                    }
                });
            });
    }



    removeProcessAction(processAction) {
        axios.delete("/api/process-actions/" + processAction.id, {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => {
                if (res.status == 200) {
                    this.props.fetchProcessActions();
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
                    <DialogTitle>{this.state.dialog.data.id ? "Alterar Ação de Processo" : "Adicionar Ação de Processo"}</DialogTitle>
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
                        {this.state.dialog.data.id && <Button color="warning" autoFocus onClick={() => this.updateProcessAction()}>Salvar Modificações</Button>}
                        {!this.state.dialog.data.id && <Button color="success" autoFocus onClick={() => this.createProcessAction()}>Adicionar</Button>}

                        <Button color="transparent" autoFocus onClick={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>Cancelar</Button>
                    </DialogActions>
                </Dialog>



                <h3>Cadastros de Ações de Processos</h3>
                <p style={{ maxWidth: "70%" }}>Pré-cadastrar ações de processos facilitam no cadastro de um processo.<br />
                As ações cadastradas aqui poderão ser escolhidas no momento da criação de um processo (não necessariamente se limitando somente às cadastradas).</p>

                <p>&nbsp;</p>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                        <Card>
                            <CardBody>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ width: "40%", textAlign: "center" }}>
                                                <CustomInput
                                                    labelText="Nome"
                                                    formControlProps={{ fullWidth: true, style: { marginTop: "0" } }}
                                                    inputProps={{
                                                        value: this.state.filter.name,
                                                        onChange: e => this.setState({ filter: { ...this.state.filter, name: e.target.value }, pagination: { ...this.state.pagination, offset: 0 } })
                                                    }} />
                                            </TableCell>
                                            <TableCell style={{ width: "40%", textAlign: "center" }}>Observações</TableCell>
                                            <TableCell style={{ textAlign: "center" }}>Ações</TableCell>
                                        </TableRow>
                                    </TableHead>
                                </Table>

                                <div style={{ maxHeight: "500px", overflow: "auto", width: "100%" }}>
                                    <Table>
                                        <TableBody>
                                            {this.props.processActions && this.props.processActions.data.length > 0 && this.props.processActions.data
                                                .filter(el => this.state.filter.name.trim().length == 0 || el.name.toLowerCase().search(this.state.filter.name.toLowerCase().trim()) != -1)
                                                .slice(this.state.pagination.offset, this.state.pagination.offset + this.state.pagination.limit)
                                                .map((prop, key) => {
                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell style={{ width: "40%" }}>{prop.name}</TableCell>
                                                            <TableCell style={{ width: "40%" }}>{prop.notes}</TableCell>

                                                            <TableCell style={{ padding: "5px 16px", textAlign: "center" }}>
                                                                <Tooltip title="Remover ação" arrow>
                                                                    <span>
                                                                        <Button justIcon round color="transparent"
                                                                            onClick={e => this.removeProcessAction(prop)}>
                                                                            <DeleteOutlineIcon />

                                                                        </Button>
                                                                    </span>
                                                                </Tooltip>

                                                                <Tooltip title="Editar ação" arrow>
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

                                {!(this.props.processActions && this.props.processActions.data && this.props.processActions.data.length > 0) &&
                                    <div style={{ width: "100%" }}>
                                        <h4 style={{ textAlign: "center" }}>Nenhuma ação de processo encontrada.</h4>
                                        <span><ArrowDownwardIcon />Clique em <span style={{ fontWeight: "bold" }}>Adicionar ação</span> para criar uma nova ação de processo.</span>
                                    </div>}


                            </CardBody>
                        </Card>
                    </GridItem>
                </GridContainer>

                <div style={{ margin: "15px 0" }}>
                    <Button onClick={e => this.props.history.push("/admin/registrations")}>Voltar</Button>
                    <Button color="success" onClick={e => { this.setState({ dialog: { ...this.state.dialog, display: true, data: { id: null, name: "", notes: "" } } }); }}>Adicionar ação</Button>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        processActions: state.common.data.processActions
    };
}

const mapDispatchToProps = dispatch => ({
    fetchProcessActions: (callback) => dispatch(fetchProcessActions(callback, true))
})

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(ProcessActionCrud));