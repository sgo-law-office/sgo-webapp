import React from "react";
import { withRouter } from "react-router-dom";
import Button from "components/CustomButtons/Button.js";

class FolderDetails extends React.Component {

    render() {
        return (
            <div>
                <h4>Em construção</h4>
                <p>Ajude a desenvolver essa página enviando conselhos, sugestões ou outros.</p>
                <Button onClick={e => this.props.history.goBack()}>Voltar</Button>
            </div>
        );
    }
}


export default withRouter(FolderDetails);
