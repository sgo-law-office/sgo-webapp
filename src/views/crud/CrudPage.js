import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import CompanyCrud from "./CompanyCrud";
import LawyerCrud from "./LawyerCrud";
import CourtCrud from "./CourtCrud";
import PhoneCrud from "./PhoneCrud";


class CrudPage extends React.Component {

    render() {
        return (
            <Switch>
                <Route path="/admin/registrations/companies" component={() => (<CompanyCrud />)}></Route>
                <Route path="/admin/registrations/lawyers" component={() => (<LawyerCrud />)}></Route>
                <Route path="/admin/registrations/courts" component={() => (<CourtCrud />)}></Route>
                <Route path="/admin/registrations/phones" component={() => (<PhoneCrud />)}></Route>
                <Route path="/admin/registrations">
                    <div>
                        <h3>Cadastros internos</h3>
                        <p>Selecione uma das opções de cadastros internos do sistema administrativo abaixo para ir para a página.</p>

                        <GridContainer>
                            <GridItem>
                                <ul>
                                    <li><a href="/admin/registrations/companies" onClick={e => { e.preventDefault(); this.props.history.push("/admin/registrations/companies") }}>Unidades e Departamentos</a></li>
                                    <li><a href="/admin/registrations/lawyers" onClick={e => { e.preventDefault(); this.props.history.push("/admin/registrations/lawyers") }}>Advogados</a></li>
                                    <li><a href="/admin/registrations/courts" onClick={e => { e.preventDefault(); this.props.history.push("/admin/registrations/courts") }}>Varas</a></li>
                                    <li><a href="/admin/registrations/phones" onClick={e => { e.preventDefault(); this.props.history.push("/admin/registrations/phones") }}>Telefones Úteis</a></li>
                                </ul>
                            </GridItem>
                        </GridContainer>
                    </div>

                </Route>
            </Switch>
        );
    }
}

export default withRouter(CrudPage);