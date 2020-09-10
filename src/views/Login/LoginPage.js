import React from "react";

import Card from "components/Card/Card.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import Button from "components/CustomButtons/Button.js";

import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";

import logo from "assets/img/sgo/sgo-logo-max.png";

export default class LoginPage extends React.Component {

  render() {
    const { loading, login } = this.props;
    return (
      <Container maxWidth="sm">
        <Grid container style={{ width: "100%", paddingTop: "2em" }}>
          <Grid item style={{ width: "100%" }}>
            <Card profile style={{ width: "100%" }}>
              <CardAvatar>
                <a href="#sg-logo" onClick={e => e.preventDefault()}>
                  <img src={logo} alt="Logo SGO Advogados" />
                </a>
              </CardAvatar>
              <CardBody>
                <h6>Salustiano, Garcia &amp; Oliveira Advogados</h6>
                <h4>Bem vindo ao sistema administrado SGO Advogados.</h4>

                {!loading &&
                  <div>
                    <p>É preciso entrar para acessar ao sistema.</p>
                    <Button color="success" onClick={login}>Entrar</Button>
                  </div>
                }

                {loading &&
                  <div>
                    <p>Carregando...</p>
                  </div>
                }
              </CardBody>
            </Card>
          </Grid>
        </Grid>
      </Container>
    )
  }
}