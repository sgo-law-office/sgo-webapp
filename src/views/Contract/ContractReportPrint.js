import React from "react";
import ReactToPrint from "react-to-print";
import PrintIcon from '@material-ui/icons/Print';
import Button from "components/CustomButtons/Button";
import { Tooltip } from "@material-ui/core";

import ContractReportComponentToPrint from "./ContractReportComponentToPrint";



class ContractReportPrint extends React.Component {
    render() {
        return (
            <Tooltip title="Imprimir" arrow>
                <span>
                    <ReactToPrint trigger={() => <Button justIcon round color="transparent"><PrintIcon /></Button>} content={() => this.componentRef} />
                    <ContractReportComponentToPrint ref={(el) => (this.componentRef = el)} content={this.props.content} />
                </span>
            </Tooltip>
        );
    }
}

export default ContractReportPrint;
