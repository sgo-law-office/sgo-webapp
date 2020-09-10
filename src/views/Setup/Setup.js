import React from "react";
import { connect } from "react-redux";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { LinearProgress } from "@material-ui/core";
import Button from "components/CustomButtons/Button.js";

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import DoneIcon from '@material-ui/icons/Done';

import NativeSelect from '@material-ui/core/NativeSelect';

import { fetchCompanies, createAccount } from 'store/actions';
import { withRouter } from "react-router-dom";


class Setup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sectionOne: true,
            sectionTwo: false,
            sectionThree: false,
            percentage: 0,
            data: {
                companyBranch: "",
                department: ""
            }
        };
    }

    componentDidMount() {
        if (!this.props.jwt) {
            this.props.history.push("/admin");
        }

        this.props.fetchCompanies(companies => {
            var data = {
                ...this.state.data,
            };

            if (companies && companies[0]) {
                data = {
                    ...data,
                    companyBranch: companies[0].id,
                    department: companies[0].departments[0]
                }
            }
            this.setState({
                companyBranches: companies,
                data: data
            });
        });
    }

    sectionOneProceed() {
        this.setState({
            sectionOne: false,
            sectionTwo: true,
            sectionThree: false,
            percentage: 66
        });
    }

    sectionTwoBack() {
        this.setState({
            sectionOne: true,
            sectionTwo: false,
            sectionThree: false,
            percentage: 33
        });
    }

    sectionTwoProceed() {
        this.setState({
            sectionOne: false,
            sectionTwo: false,
            sectionThree: true,
            percentage: 100
        });
    }

    sectionThreeBack() {
        this.setState({
            sectionOne: false,
            sectionTwo: true,
            sectionThree: false,
            percentage: 66
        });
    }

    sectionThreeComplete() {
        this.setState({
            sectionOne: false,
            sectionTwo: false,
            sectionThree: true,
            percentage: 100
        });

        this.props.createAccount({
            accountId: this.props.graph.account.id,
            name: this.props.graph.account.givenName || this.props.graph.account.displayName,
            mail: this.props.graph.account.mail,
            companyId: this.state.data.companyBranch,
            department: this.state.data.department
        });
    }

    selectCompanyBranch(e) {
        this.setState({
            data: {
                ...this.state.data,
                companyBranch: e.target.value,
                department: this.props.common.data.companies
                    ? this.props.common.data.companies.find(c => c.id == e.target.value).departments[0]
                    : null
            }
        })
    }

    selectDepartment(e) {
        this.setState({
            data: {
                ...this.state.data,
                department: e.target.value
            }
        })
    }

    render() {
        const selectedCompanyBranch = this.props.common.data.companies
            ? this.props.common.data.companies.find(e => e.id == this.state.data.companyBranch)
            : null;

        return (
            <div>
                {(this.state.sectionOne || this.state.sectionTwo || this.state.sectionThree) &&
                    <div style={{ position: "absolute", top: "0", width: "100%" }}>
                        <LinearProgress variant="determinate" value={this.state.percentage} />
                    </div>}

                {this.props.graph.account && <div>

                    {this.state.sectionOne &&
                        <GridContainer style={{ width: "100%", padding: "30px 10%" }}>
                            <GridItem sm={12}>
                                <h1>Olá {this.props.graph.account.givenName || this.props.graph.account.displayName},</h1>
                            </GridItem>

                            <GridItem sm={12}>
                                <h4>Seja bem-vindo(a) ao sistema administrativo SGO Advogados.</h4>
                                <h5>Esse guia irá te ajudar a fazer o seu primeiro acesso e personalizar a sua conta.</h5>
                            </GridItem>
                            <GridItem sm={12} style={{ textAlign: "center", marginTop: "30px" }}>
                                <Button color="primary" onClick={this.sectionOneProceed.bind(this)}
                                >Continuar &nbsp;&nbsp;<span><ArrowForwardIosIcon /></span></Button>
                            </GridItem>
                        </GridContainer>}

                    {this.state.sectionTwo &&
                        <GridContainer style={{ width: "100%", padding: "30px 10%" }}>
                            <GridItem sm={12}>
                                <h1>Onde você trabalha?</h1>
                            </GridItem>

                            <GridItem sm={12}>
                                <h5>Para uma melhor experiência, todo o conteúdo disponibilizado para cada pessoa é segmentado com base em alguns atributos, como por exemplo, sua localização.</h5>
                                <p>Não se preocupe, você continuará tendo acesso ao dados de outras unidades.</p>
                            </GridItem>

                            <GridItem sm={12}>
                                <h4>Qual sua unidade padrão?</h4>
                                {this.props.common.data.companies &&
                                    <NativeSelect value={this.state.data.companyBranch} onChange={this.selectCompanyBranch.bind(this)}>
                                        {this.props.common.data.companies.map((e, i) => {
                                            return (<option value={e.id} key={i}>{e.name}</option>)
                                        })}
                                    </NativeSelect>}
                            </GridItem>

                            <GridItem sm={6} style={{ textAlign: "right", marginTop: "30px" }}>
                                <Button onClick={this.sectionTwoBack.bind(this)}
                                ><span><ArrowBackIosIcon /></span> &nbsp;&nbsp; Voltar</Button>
                            </GridItem>
                            <GridItem sm={6} style={{ textAlign: "left", marginTop: "30px" }}>
                                <Button color="primary" onClick={this.sectionTwoProceed.bind(this)}
                                >Continuar &nbsp;&nbsp;<span><ArrowForwardIosIcon /></span></Button>
                            </GridItem>

                        </GridContainer>}

                    {this.state.sectionThree &&
                        <GridContainer style={{ width: "100%", padding: "30px 10%" }}>
                            <GridItem sm={12}>
                                <h1>Onde você trabalha?</h1>
                            </GridItem>

                            <GridItem sm={12}>
                                <h5>Para uma melhor experiência, todo o conteúdo disponibilizado para cada pessoa é segmentado com base em alguns atributos, como por exemplo, sua localização.</h5>
                                <p>Não se preocupe, você continuará tendo acesso ao dados de outras unidades.</p>
                            </GridItem>


                            <GridItem sm={12}>
                                <h4>Qual seu departamento?</h4>
                                {selectedCompanyBranch &&
                                    <NativeSelect value={this.state.data.department} onChange={this.selectDepartment.bind(this)}>
                                        {selectedCompanyBranch.departments.map((e, i) => {
                                            return (<option value={e} key={i}>{e}</option>)
                                        })}
                                    </NativeSelect>}
                            </GridItem>

                            <GridItem sm={6} style={{ textAlign: "right", marginTop: "30px" }}>
                                <Button onClick={this.sectionThreeBack.bind(this)}
                                ><span><ArrowBackIosIcon /></span> &nbsp;&nbsp; Voltar</Button>
                            </GridItem>
                            <GridItem sm={6} style={{ textAlign: "left", marginTop: "30px" }}>
                                <Button color="primary" onClick={this.sectionThreeComplete.bind(this)}
                                >Concluir &nbsp;&nbsp;<span><DoneIcon /></span></Button>
                            </GridItem>

                        </GridContainer>}
                </div>}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        jwt: state.jwt,
        account: state.account,
        graph: {
            account: state.graph.account
        },
        common: {
            data: {
                companies: state.common.data.companies
            }
        }
    };
}

const mapDispatchToProps = dispatch => ({
    fetchCompanies: (callback) => dispatch(fetchCompanies(callback)),
    createAccount: (account) => dispatch(createAccount(account))
})

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(Setup));