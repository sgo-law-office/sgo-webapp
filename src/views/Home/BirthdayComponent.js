import { Table, TableBody, TableCell, TableRow, Tooltip } from "@material-ui/core";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import Moment from "react-moment";
import moment from 'moment'

import { withRouter } from "react-router-dom";
import CakeIcon from '@material-ui/icons/Cake';


import { authRequestInterceptor, authRequestInterceptorOnError, authResponseInterceptorOnError, authResponseInterceptor } from "auth/interceptor";
import { loadingRequestInterceptor, loadingRequestInterceptorOnError, loadingResponseInterceptor, loadingResponseInterceptorOnError } from "components/Loading/interceptor";
import Axios from "axios";
import { connect } from "react-redux";
import ElderTooltip from "components/ElderTooltip/ElderTooltip";


const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


class BirthdayComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            birthdays: {
                loading: true,
                err: false,
                data: {
                    limit: 5,
                    offset: 0,
                    total: 0,
                    data: []
                }
            }
        };
    }

    componentDidMount() {
        this.loadBirthdays();
    }

    loadBirthdays() {
        const now = new Date();
        const fifteenDaysAhead = new Date();
        fifteenDaysAhead.setDate(now.getDate() + 15)

        axios.get("/api/customers/birthdays", {
            headers: {
                'Accept': 'application/json'
            },
            params: {
                company_id: this.props.account ? this.props.account.companyId : null,
                start: now.toISOString().split('T')[0],
                end: fifteenDaysAhead.toISOString().split('T')[0]
            }
        })
            .then(res => {
                if (res.status == 200) {
                    this.setState({
                        birthdays: {
                            ...this.state.birthdays,
                            loading: false,
                            data: {
                                ...this.state.birthdays.data,
                                ...res.data
                            }
                        }
                    });
                } else {
                    this.setState({
                        birthdays: {
                            ...this.state.birthdays,
                            loading: false,
                            err: true
                        }
                    });
                }
            })
            .catch(err => {
                this.setState({
                    birthdays: {
                        ...this.state.birthdays,
                        loading: false,
                        err: true
                    }
                });
            });
    }

    render() {
        return (
            <GridContainer>
                <GridItem xs={12}>
                    <h4 style={{ marginTop: "0" }}> <CakeIcon style={{ verticalAlign: "sub", marginRight: "8px" }} /> Aniversariantes
                    {this.state.birthdays.loading && <img style={{ height: "22px", marginLeft: "10px" }} src="/load-small.gif" alt="Carregando..." />}</h4>
                </GridItem>

                <GridItem xs={12}>
                    {!this.state.birthdays.loading && this.state.birthdays.err && <p style={{ textAlign: "center" }}>Não foi possível carregar os próximos aniversários</p>}
                    {!this.state.birthdays.loading && !this.state.birthdays.err && this.state.birthdays.data.total === 0 && <p style={{ textAlign: "center" }}>Nenhum aniversário nos próximos dias</p>}
                    {!this.state.birthdays.loading && this.state.birthdays.data.total > 0 &&
                        <Table>
                            <TableBody>
                                {this.state.birthdays.data.data.map((e, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell style={{ width: "70%" }}><a href={"/admin/customers/" + e.id} onClick={ev => { ev.preventDefault(); this.props.history.push("/admin/customers/" + e.id) }}>{e.name} <ElderTooltip birthDate={e.birthDate} /></a></TableCell>
                                            <TableCell style={{ textAlign: "center" }}>
                                                <Tooltip title={moment(e.birthDate).format("DD [de] MMMM")} arrow>
                                                    <div>
                                                        {moment().isSame(new Date().getUTCFullYear() + "-" + e.birthDate.split("-")[1] + "-" + e.birthDate.split("-")[2], 'day') && <div>Hoje &#127881;</div>}
                                                        {!moment().isSame(new Date().getUTCFullYear() + "-" + e.birthDate.split("-")[1] + "-" + e.birthDate.split("-")[2], 'day') &&
                                                            <Moment from={moment().startOf('day')}>
                                                                {new Date().getUTCFullYear() + "-" + e.birthDate.split("-")[1] + "-" + e.birthDate.split("-")[2]}
                                                            </Moment>}
                                                    </div>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    }

                </GridItem>
            </GridContainer>
        );
    }
}

const mapStateToProps = state => {
    return {
        account: state.account
    };
}

export default connect(mapStateToProps)(
    withRouter(BirthdayComponent));