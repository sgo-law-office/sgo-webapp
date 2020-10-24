import React from "react";

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

class HelpPage extends React.Component {

    render() {

        return (
            <div>
                <h3>Em que posso ajudar?</h3>

                <p>Escolha uma das opções abaixo</p>

                <GridContainer>
                    <GridItem lg={6} style={{ marginLeft: "10px", marginTop: "20px" }}>

                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <h4>Não encontrei uma funcionalidade</h4>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography style={{ textAlign: "justify" }}>
                                    O sistema Administrativo SGO Advogados é um sistema em constante desenvolvimento, novas funcionalidades estão sendo desenvolvidas e serão disponibilizadas assim que validadas.<br /><br />
                                    As funcionalidades disponíveis atualmente são:
                                    <ul>
                                        <li><a href="/admin/customers" onClick={e => { e.preventDefault(); this.props.history.push("/admin/customers") }}>Clientes</a> - Buscar, Visualizar, Adicionar, Editar, Desativar/Ativar</li>
                                        <li><a href="/admin/attendances" onClick={e => { e.preventDefault(); this.props.history.push("/admin/attendances") }}>Atendimentos</a> - Visualizar, Adicionar</li>
                                        <li><a href="/admin/contracts" onClick={e => { e.preventDefault(); this.props.history.push("/admin/contracts") }}>Contratos</a> - Em desenvolvimento</li>
                                        <li><a href="/admin/processes" onClick={e => { e.preventDefault(); this.props.history.push("/admin/processes") }}>Processos</a> - Em desenvolvimento</li>
                                        <li><a href="/admin/schedules" onClick={e => { e.preventDefault(); this.props.history.push("/admin/schedules") }}>Agendamentos</a> - Em desenvolvimento</li>
                                        <li><a href="/admin/payments" onClick={e => { e.preventDefault(); this.props.history.push("/admin/payments") }}>Pagamentos</a> - Em desenvolvimento</li>
                                        <li><a href="/admin/me" onClick={e => { e.preventDefault(); this.props.history.push("/admin/me") }}>Perfil</a> - Visualizar</li>
                                        <li><a href="/admin/help" onClick={e => { e.preventDefault(); this.props.history.push("/admin/help") }}>Ajuda</a> - Essa página</li>
                                    </ul>
                                    Se a funcionalidade que você não encontrou não estiver mapeada para desenvolvimento, entre em contato com o responsável pelo sistema para que o mesmo informe a equipe de desenvolvimento da nova necessidade.
                                </Typography>

                            </AccordionDetails>
                        </Accordion>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2a-content"
                                id="panel2a-header"
                            >
                                <h4>Gostaria de sugerir uma melhoria</h4>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography style={{ textAlign: "justify" }}>
                                    Ótimo! Construimos o melhor produto com feedbacks de quem usa ele no dia a dia! <br /><br />
                                Entre em contato com o responsável pelo sistema para que o mesmo informe a equipe de desenvolvimento da sugestão de melhoria.</Typography>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel3a-content"
                                id="panel3a-header"
                            >
                                <h4>Encontrei um problema</h4>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography style={{ textAlign: "justify" }}>
                                    Que pena, mas problemas acontecem. Construimos o melhor produto com feedbacks de quem usa ele no dia a dia! <br /><br />
                                    Entre em contato com o responsável pelo sistema para que o mesmo informe a equipe de desenvolvimento sobre o problema. Não se esqueça de adicionar evidências do problema, como reproduzir e outras dicas para nos ajudar na correção.</Typography>
                            </AccordionDetails>
                        </Accordion>

                    </GridItem>
                </GridContainer>



            </div>
        );
    }
}

export default HelpPage;