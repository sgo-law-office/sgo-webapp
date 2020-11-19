import { Card, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import Button from "components/CustomButtons/Button.js";
import DescriptionIcon from '@material-ui/icons/Description';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { connect } from "react-redux";
import { fetchCompanies } from "store/actions";
import { withRouter } from "react-router-dom";


class CompanyCrud extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dialog: {
        display: false
      }
    };
  }

  componentDidMount() {
    this.props.fetchCompanies();
  }

  render() {
    return (
      <div>
        <h3>Cadastros de Unidades e Departamentos</h3>

        <p>&nbsp;</p>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardBody>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "40%", textAlign: "center" }}>Unidade</TableCell>
                      <TableCell style={{ width: "40%", textAlign: "center" }}>Departamentos</TableCell>
                      {/* <TableCell style={{ textAlign: "center" }}>Ações</TableCell> */}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.props.companies && this.props.companies.length > 0 && this.props.companies.map((prop, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell style={{ width: "40%" }}>{prop.name}</TableCell>
                          <TableCell style={{ width: "40%" }}><ul>{prop.departments.map((dep, key2) => <li key={key2}>{dep}</li>)}</ul>
                          </TableCell>

                          {/* <TableCell style={{ padding: "5px 16px", textAlign: "center" }}>
                            <Tooltip title="Detalhes" arrow>
                              <span>
                                <Button justIcon round color="transparent"
                                  onClick={e => this.openDetails(prop)}>
                                  <DescriptionIcon />
                                </Button>
                              </span>
                            </Tooltip>

                          </TableCell> */}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {(!this.props.companies || this.props.companies.length === 0) &&
                  <div style={{ width: "100%" }}>
                    <h4 style={{ textAlign: "center" }}>Nenhuma unidade encontrada.</h4>
                    {/* <span><ArrowDownwardIcon />Clique em <span style={{ fontWeight: "bold" }}>Adicionar unidade</span> para criar uma nova unidade.</span> */}
                  </div>}


              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
        <div style={{ margin: "15px 0" }}>
          <Button onClick={e => this.props.history.push("/admin/registrations")}>Voltar</Button>
          {/* <Button color="success" onClick={e => e.preventDefault()}>Adicionar unidade</Button> */}
        </div>

      </div>
    );
  }
}



const mapStateToProps = state => {
  return {
    companies: state.common.data.companies
  };
}

const mapDispatchToProps = dispatch => ({
  fetchCompanies: (callback) => dispatch(fetchCompanies(callback, true))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(CompanyCrud));