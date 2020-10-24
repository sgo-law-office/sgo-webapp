import React from "react";

import Snackbar from "components/Snackbar/Snackbar.js";

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

class Notification extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true
        };

    }

    getIcon(severity) {
        switch (severity) {
            case "success": return CheckCircleOutlineIcon;
            case "warning": return WarningIcon;
            case "danger": return ErrorOutlineIcon;
            case "info":
            case "primary":
            default: return undefined;
        }
    }


    render() {
        const { ttl = 5000, onClose, severity = "danger", message = "Algo de errado aconteceu, tente novamente.", open } = this.props;

        const icon = this.getIcon(severity);

        return (
            <div>
                <Snackbar
                    style={{minWidth: "600px"}}
                    place="tc"
                    color={severity}
                    icon={icon}
                    message={message}
                    open={open}
                    autoHideDuration={ttl}
                    close={onClose}
                    closeNotification={() => {
                        this.setState({ open: false });
                        if (onClose) {
                            onClose();
                        }
                    }}>
                    <div>
                        <span>{message}</span>
                    </div>
                </Snackbar>
            </div>
        );
    }
}

export default Notification;