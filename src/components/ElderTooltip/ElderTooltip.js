import React from "react";
import { connect } from "react-redux";
import moment from 'moment'
import { Tooltip } from "@material-ui/core";


class ElderTooltip extends React.Component {

    render() {
        return (
            (this.props.birthDate && moment().diff(this.props.birthDate, 'years') >= this.props.displayAge)
                ? (<Tooltip title="Idoso" arrow>
                    <div style={{
                        display: "inline",
                        backgroundColor: "rgba(20, 20, 220, 0.5)",
                        boxShadow: "1px 1px 3px 0px rgba(20, 20, 220, 0.4)",
                        borderRadius: "5px",
                        padding: "3px",
                        marginLeft: "3px",
                        cursor: "default",
                        fontWeight: "bold",
                        color: "white"
                    }}>
                        {moment().diff(this.props.birthDate, 'years') >= this.props.displayAge && <small>60+</small>}
                    </div>
                </Tooltip>)

                : (<div></div>)
        );
    }
}

const mapStateToProps = state => {
    return {
        displayAge: state.common.config.elderTooltipDisplayAge
    };
}


export default connect(mapStateToProps)(ElderTooltip);