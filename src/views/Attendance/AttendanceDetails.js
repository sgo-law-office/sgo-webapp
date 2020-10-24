import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { withRouter } from "react-router-dom";
import CustomInput from "components/CustomInput/CustomInput";
import { Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Paper, Tab, Tabs, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";

import Button from "components/CustomButtons/Button";
import { connect } from "react-redux";

import {
    authRequestInterceptor, authRequestInterceptorOnError,
    authResponseInterceptor, authResponseInterceptorOnError
} from "auth/interceptor";
import {
    loadingRequestInterceptor,
    loadingRequestInterceptorOnError,
    loadingResponseInterceptor,
    loadingResponseInterceptorOnError
} from "components/Loading/interceptor";


import Notification from "components/Notifications/Notification";
import DescriptionIcon from '@material-ui/icons/Description';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import Moment from "react-moment";
import AttendanceHistoryComponent from "./AttendanceHistoryComponent";
import AttendanceCreate from "./AttendanceCreate";

import Axios from "axios";
import { Gavel } from "@material-ui/icons";
const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);



class AttendanceDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            creating: false,
            editing: false,
            notFound: false,
            idFromUrl: null,

            data: this.getInitialDataState(),

            tabs: {
                value: 0,
                historyCount: null
            },

            validations: {

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
            customerId: null,
            customerName: "",
            createdByName: "",
            status: "",
            contractsSummary: {
                total: 0,
                open: 0
            },
            paymentsSummary: {
                total: 0,
                open: 0
            },
            schedulesSummary: {
                total: 0,
                open: 0
            }
        };
    }

    componentDidMount() {
        const data = this.props.attendance || { ...this.state.data };

        this.setState({
            creating: this.props.history.location.pathname === "/admin/attendances/create",
            editing: this.props.history.location.pathname === "/admin/attendances/create",
            data
        });

        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            this.loadAttendance();
        }
    }

    loadAttendance(force) {
        if (force || (this.props.match && this.props.match.params.id && !this.state.data.id)) {
            axios.get("/api/attendances/" + this.props.match.params.id + ":summary", this.state.data, {
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
                            data: {
                                ...this.state.data,
                                ...res.data
                            }
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

    render() {
        return (
            <div>

                <Dialog open={this.state.dialog.display} onClose={() => { this.setState({ dialog: { ...this.state.dialog, display: false } }) }}>
                    <DialogTitle>{this.state.dialog.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{this.state.dialog.message}</DialogContentText>
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
                        <GridItem sm={12} style={{ textAlign: "center", marginTop: "50px" }}>
                            <h2>Não foi possível encontrar o atendimento</h2>
                            <Button onClick={e => this.props.history.push("/admin/attendances")}>Voltar</Button>
                        </GridItem>
                    </GridContainer>
                }

                {!this.state.notFound &&
                    <div>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12}>

                                {this.state.creating && <AttendanceCreate />}

                                {!this.state.creating &&
                                    <div>
                                        <GridContainer>

                                            <GridItem sm={12} md={12} lg={6}>
                                                <span>Atendimento ao cliente</span>
                                                <Tooltip title="Detalhes do cliente" arrow>
                                                    <h2 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "0 0 12px", cursor: "pointer" }}
                                                        onClick={e => this.props.history.push("/admin/customers/" + this.state.data.customerId)}>{this.state.data.customerName}</h2>
                                                </Tooltip>

                                                <small>Status </small>
                                                <p style={{ color: "green", fontSize: "1.2em", margin: "0" }}>{this.state.data.status == "CREATED" ? "Iniciado" : ""}</p>

                                            </GridItem>

                                            <GridItem sm={4} md={4} lg={2}>
                                                <Paper elevation={2} style={{ height: "100%", padding: "15px 20px 5px 20px", textAlign: "right" }}>
                                                    <GridContainer>


                                                        <GridItem sm={6} style={{ textAlign: "center" }}>

                                                            <GridContainer>
                                                                <GridItem sm={12}>
                                                                    <span style={{ fontSize: "72px", lineHeight: "72px", color: "#5a5a5a" }}>
                                                                        {this.state.data.schedulesSummary ? this.state.data.schedulesSummary.open : <img style={{ height: "60px" }} src="/load-small.gif" alt="Carregando..." />}
                                                                    </span>
                                                                </GridItem>
                                                                <GridItem sm={12}>
                                                                    <small>Retornos Agendados</small>
                                                                </GridItem>
                                                            </GridContainer>

                                                        </GridItem>


                                                        <GridItem sm={6}>
                                                            <GridContainer>
                                                                <GridItem sm={12}>
                                                                    <Tooltip title="Ver Agendamentos" arrow>
                                                                        <a href="#" onClick={e => this.props.history.push('/admin/contracts')}>
                                                                            <ScheduleIcon fontSize="large" />
                                                                        </a>
                                                                    </Tooltip>

                                                                </GridItem>
                                                                <GridItem sm={12} style={{ marginTop: "10px" }}>
                                                                    <span style={{ whiteSpace: "nowrap" }}>
                                                                        <span style={{ fontWeight: "bold" }}>
                                                                            {this.state.data.schedulesSummary ? this.state.data.schedulesSummary.total : <img style={{ height: "17px" }} src="/load-small.gif" alt="Carregando..." />}
                                                                        </span>
                                                                            &nbsp;total</span>
                                                                </GridItem>
                                                            </GridContainer>
                                                        </GridItem>
                                                    </GridContainer>

                                                </Paper>
                                            </GridItem>

                                            <GridItem sm={4} md={4} lg={2}>
                                                <Paper elevation={2} style={{ height: "100%", padding: "15px 20px 5px 20px", textAlign: "right" }}>
                                                    <GridContainer>

                                                        <GridItem sm={6} style={{ textAlign: "center" }}>

                                                            <GridContainer>
                                                                <GridItem sm={12}>
                                                                    <span style={{ fontSize: "72px", lineHeight: "72px", color: "#5a5a5a" }}>
                                                                        {this.state.data.contractsSummary ? this.state.data.contractsSummary.open : <img style={{ height: "60px" }} src="/load-small.gif" alt="Carregando..." />}
                                                                    </span>
                                                                </GridItem>
                                                                <GridItem sm={12}>
                                                                    <small>Contratos Abertos</small>
                                                                </GridItem>
                                                            </GridContainer>


                                                        </GridItem>


                                                        <GridItem sm={6}>
                                                            <GridContainer>
                                                                <GridItem sm={12}>
                                                                    <Tooltip title="Ver Contratos" arrow>
                                                                        <a href="#" onClick={e => this.props.history.push('/admin/contracts')}>
                                                                            <DescriptionIcon fontSize="large" />
                                                                        </a>
                                                                    </Tooltip>
                                                                </GridItem>
                                                                <GridItem sm={12} style={{ marginTop: "10px" }}>
                                                                    <span style={{ whiteSpace: "nowrap" }}>
                                                                        <span style={{ fontWeight: "bold" }}>
                                                                            {this.state.data.contractsSummary ? this.state.data.contractsSummary.total : <img style={{ height: "17px" }} src="/load-small.gif" alt="Carregando..." />}
                                                                        </span>
                                                                        &nbsp;total</span>
                                                                </GridItem>
                                                            </GridContainer>
                                                        </GridItem>
                                                    </GridContainer>

                                                </Paper>
                                            </GridItem>

                                            <GridItem sm={4} md={4} lg={2}>
                                                <Paper elevation={2} style={{ height: "100%", padding: "15px 20px 5px 20px", textAlign: "right" }}>
                                                    <GridContainer>


                                                        <GridItem sm={6} style={{ textAlign: "center" }}>

                                                            <GridContainer>
                                                                <GridItem sm={12}>
                                                                    <span style={{ fontSize: "72px", lineHeight: "72px", color: "#5a5a5a" }}>
                                                                        {this.state.data.paymentsSummary ? this.state.data.paymentsSummary.open : <img style={{ height: "60px" }} src="/load-small.gif" alt="Carregando..." />}
                                                                    </span>
                                                                </GridItem>
                                                                <GridItem sm={12}>
                                                                    <small>Processos Pendentes</small>
                                                                </GridItem>
                                                            </GridContainer>


                                                        </GridItem>


                                                        <GridItem sm={6}>
                                                            <GridContainer>
                                                                <GridItem sm={12}>
                                                                    <Tooltip title="Ver Pagamentos" arrow>
                                                                        <a href="#" onClick={e => this.props.history.push('/admin/processes')}>
                                                                            <Gavel fontSize="large" />
                                                                        </a>
                                                                    </Tooltip>

                                                                </GridItem>
                                                                <GridItem sm={12} style={{ marginTop: "10px" }}>
                                                                    <span style={{ whiteSpace: "nowrap" }}>
                                                                        <span style={{ fontWeight: "bold" }}>
                                                                            {this.state.data.paymentsSummary ? this.state.data.paymentsSummary.total : <img style={{ height: "17px" }} src="/load-small.gif" alt="Carregando..." />}
                                                                        </span>
                                                                            &nbsp;total</span>
                                                                </GridItem>
                                                            </GridContainer>
                                                        </GridItem>
                                                    </GridContainer>

                                                </Paper>
                                            </GridItem>

                                        </GridContainer>

                                        <div style={{ marginTop: "45px", marginBottom: "45px" }}>

                                            <GridContainer>
                                                <GridItem sm={12} md={6} lg={3}>
                                                    <CustomInput formControlProps={{ fullWidth: true }}>
                                                        <p style={{ textAlign: "center" }}>Atendimento Iniciado em</p>
                                                    </CustomInput>
                                                </GridItem>

                                                <GridItem sm={12} md={6} lg={3}>
                                                    <CustomInput formControlProps={{ fullWidth: true }}>
                                                        <p style={{ fontWeight: "bold" }}>
                                                            <Moment date={this.state.data.createdAt} format="DD/MM/YYYY" />
                                                        </p>
                                                    </CustomInput>
                                                </GridItem>

                                                <GridItem sm={12} md={6} lg={3}>
                                                    <CustomInput formControlProps={{ fullWidth: true }}>
                                                        <p style={{ textAlign: "center" }}>Atendimento Iniciado por</p>
                                                    </CustomInput>
                                                </GridItem>

                                                <GridItem sm={12} md={6} lg={3}>
                                                    <CustomInput formControlProps={{ fullWidth: true }}>
                                                        <p style={{ fontWeight: "bold" }}>
                                                            {this.state.data.createdByName}
                                                        </p>
                                                    </CustomInput>
                                                </GridItem>

                                            </GridContainer>



                                        </div>


                                        <Card style={{ marginTop: "45px", marginBottom: "45px" }}>
                                            <CardBody>
                                                <Tabs value={this.state.tabs.value} onChange={(e, v) => this.setState({ tabs: { ...this.state.tabs, value: v } })}>
                                                    <Tab label={"Histórico" + (this.state.tabs.historyCount === null ? "" : " (" + this.state.tabs.historyCount + ")")} />
                                                </Tabs>
                                                <Divider style={{ width: "100%" }} />


                                                <div role="tabpanel" hidden={this.state.tabs.value !== 0}>
                                                    {!this.state.data.id && <h1 style={{ textAlign: "center" }}><img style={{ height: "100px" }} src="/load-small.gif" alt="Carregando..." /></h1>}
                                                    {this.state.data.id && <AttendanceHistoryComponent attendanceId={this.state.data.id} loadCallback={data => this.setState({ tabs: { ...this.state.tabs, historyCount: data.total } })} />}
                                                </div>

                                            </CardBody>
                                        </Card>


                                    </div>}


                                {!this.state.creating && !this.state.editing && <div>
                                    <Button onClick={e => this.props.history.goBack()}>Voltar</Button>
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
    withRouter(AttendanceDetails));