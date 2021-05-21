import React from "react";
import Moment from "react-moment";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import logo from "assets/img/sgo/sgo-logo-max.png";
import './ContractReportComponentToPrint.css';


class ContractReportComponentToPrint extends React.Component {
    render() {
        return (
            <div className='print-source'>

                <div style={{ width: "100%", display: "block", height: "150px" }}>
                    <img src={logo} alt="Logo SGO Advogados" style={{ height: "150px", float: "left" }} />
                    <h2 style={{ textAlign: "center", padding: "40px 30px 0 130px" }}>Salustiano, Garcia &amp; Oliveira Advogados</h2>
                </div>

                <div style={{ margin: "40px 30px" }}>
                    <GridContainer>

                        <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
                            Dados do registro
                        </GridItem>

                        <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
                            <span>Cliente: </span>
                            <span style={{ fontWeight: "bold" }}>
                                {this.props.content.contract.customerName}
                            </span>
                        </GridItem>

                        <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
                            <span>Advogado: </span>
                            <span style={{ fontWeight: "bold" }}>
                                {this.props.content.contract.lawyerName}
                            </span>
                        </GridItem>

                        <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
                            <span>Data do relato: </span>
                            <span style={{ fontWeight: "bold" }}>
                                <Moment date={this.props.content.report.createdAt} format="DD [de] MMMM [de] YYYY" />
                            </span>
                        </GridItem>

                    </GridContainer>

                    {this.props.content.report.type === "REPORT" && <h4 style={{ textAlign: "center" }}>Registro de Relato</h4>}

                    <h4>{this.props.content.report.title}</h4>

                    <div style={{ margin: "0 0 100px 0", whiteSpace: "pre-line" }}>
                        {this.props.content.report.description}
                    </div>

                    <div style={{ padding: "0 30%", width: "40%" }}>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ borderBottom: "1px solid black" }}></div>
                                    <div>{this.props.content.contract.customerName}</div>
                                    <div><Moment date={this.props.content.report.createdAt} format="DD [de] MMMM [de] YYYY" /></div>
                                </div>
                            </GridItem>
                        </GridContainer>
                    </div>
                </div>
            </div>

        );
    }
}

export default ContractReportComponentToPrint;