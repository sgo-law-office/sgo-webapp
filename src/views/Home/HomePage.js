import { Card, Divider, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import Moment from "react-moment";

import { withRouter } from "react-router-dom";
import { AssignmentOutlined, ScheduleOutlined, SearchOutlined } from "@material-ui/icons";


import { authRequestInterceptor, authRequestInterceptorOnError, authResponseInterceptorOnError, authResponseInterceptor } from "auth/interceptor";
import { loadingRequestInterceptor, loadingRequestInterceptorOnError, loadingResponseInterceptor, loadingResponseInterceptorOnError } from "components/Loading/interceptor";
import Axios from "axios";
import { connect } from "react-redux";
import BirthdayComponent from "./BirthdayComponent";


const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


class HomePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      attendances: {
        loading: true,
        err: false,
        data: {
          limit: 5,
          offset: 0,
          total: 0,
          data: []
        }
      },

      schedules: {
        loading: true,
        err: false,
        data: {
          limit: 5,
          offset: 0,
          total: 0,
          data: []
        }
      },
    };
  }
  componentDidMount() {

  }

  render() {
    return (
      <div>

        <GridContainer>
          <GridItem xs={12}>
            <h1 style={{ textAlign: "right", margin: "0" }}><Moment locale="pt-br" format="dddd" /></h1>
            <h3 style={{ textAlign: "right", marginTop: "0" }}><small><Moment format="D" /> de <Moment locale="pt-br" format="MMMM" /></small></h3>
          </GridItem>
        </GridContainer>


        <GridContainer>

          {/* <GridItem xs={12} sm={12} md={12} lg={6} style={{ marginBottom: "30px" }}>

            <Card>
              <CardBody style={{ paddingBottom: "30px" }}>
                <GridContainer>
                  <GridItem xs={12}>
                    <a href="/admin/attendances" onClick={e => { e.preventDefault(); this.props.history.push("/admin/attendances") }} style={{ float: "right" }}><small>Ver todos</small></a>
                    <h4 style={{ marginTop: "0" }}><AssignmentOutlined style={{ verticalAlign: "sub", marginRight: "8px" }} /> Atendimentos</h4>
                  </GridItem>

                  <GridItem xs={12}>
                    <h4 style={{ margin: "0" }}>Pendências</h4>
                  </GridItem>

                  <GridItem xs={12}>
                    <p style={{ textAlign: "center" }}>Nenhum atendimento com pendência</p>
                  </GridItem>

                  <GridItem xs={12}>
                    <Divider />
                  </GridItem>

                  <GridItem xs={12}>
                    <h4 style={{ marginBottom: "0" }}>Em aberto</h4>
                  </GridItem>

                  <GridItem xs={12}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "20%", textAlign: "center" }}>Cobrança</TableCell>
                          <TableCell style={{ width: "30%" }}>Danilo Perassoli de Souza</TableCell>
                          <TableCell style={{ textAlign: "center" }}>Quarta, 14 às 14:30</TableCell>
                          <TableCell style={{ width: "10%" }}>
                            <Tooltip title="Selecionar" arrow>
                              <SearchOutlined style={{ cursor: "pointer" }} fontSize="small" />
                            </Tooltip>

                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <p style={{ textAlign: "center" }}>Nenhum atendimento em aberto</p>
                  </GridItem>

                </GridContainer>

              </CardBody>
            </Card>

          </GridItem>


          <GridItem xs={12} sm={12} md={12} lg={6} style={{ marginBottom: "30px" }}>

            <Card>
              <CardBody style={{ paddingBottom: "30px" }}>
                <GridContainer>
                  <GridItem xs={12}>
                    <a href="/admin/attendances" onClick={e => { e.preventDefault(); this.props.history.push("/admin/schedules") }} style={{ float: "right" }}><small>Ver todos</small></a>
                    <h4 style={{ marginTop: "0" }}> <ScheduleOutlined style={{ verticalAlign: "sub", marginRight: "8px" }} /> Agendamentos</h4>
                  </GridItem>

                  <GridItem xs={12}>
                    <h4 style={{ margin: "0" }}>Hoje</h4>
                  </GridItem>

                  <GridItem xs={12}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "20%", textAlign: "center" }}>Retorno</TableCell>
                          <TableCell style={{ width: "30%" }}>Danilo Perassoli de Souza</TableCell>
                          <TableCell style={{ textAlign: "center" }}>14:30</TableCell>
                          <TableCell style={{ width: "10%" }}>
                            <Tooltip title="Selecionar" arrow>
                              <SearchOutlined style={{ cursor: "pointer" }} fontSize="small" />
                            </Tooltip>

                          </TableCell>
                        </TableRow>

                      </TableBody>
                    </Table>
                    <p style={{ textAlign: "center" }}>Nenhum agendamento para hoje</p>
                  </GridItem>

                  <GridItem xs={12}>
                    <Divider />
                  </GridItem>

                  <GridItem xs={12}>
                    <h4 style={{ marginBottom: "0" }}>Próximos</h4>
                  </GridItem>

                  <GridItem xs={12}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "20%", textAlign: "center" }}>Cobrança</TableCell>
                          <TableCell style={{ width: "30%" }}>Danilo Perassoli de Souza</TableCell>
                          <TableCell style={{ textAlign: "center" }}>Quarta, 14 às 14:30</TableCell>
                          <TableCell style={{ width: "10%" }}>
                            <Tooltip title="Selecionar" arrow>
                              <SearchOutlined style={{ cursor: "pointer" }} fontSize="small" />
                            </Tooltip>

                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <p style={{ textAlign: "center" }}>Nenhum agendamento para os próximos dias</p>
                  </GridItem>
                </GridContainer>

              </CardBody>
            </Card>

          </GridItem> */}

          <GridItem xs={12} sm={12} md={12} lg={6} style={{ marginBottom: "30px" }}>
            <Card>
              <CardBody style={{ paddingBottom: "30px" }}>
                <BirthdayComponent />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
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
  withRouter(HomePage));