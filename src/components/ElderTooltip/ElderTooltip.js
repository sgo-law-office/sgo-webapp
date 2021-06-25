import React from "react";
import { connect } from "react-redux";
import moment from 'moment'
import { Tooltip } from "@material-ui/core";


class ElderTooltip extends React.Component {

    render() {
        if (this.props.deathDate) {
            return <Tooltip title="Falecido" arrow>
                <div style={{
                    display: "inline",
                    padding: "3px",
                    marginLeft: "6px",
                    cursor: "default",
                    verticalAlign: "inherit",
                    justifyContent: "center"
                }}>
                    <img style={{ height: "25px" }} src="/death-ribbon-png.png" alt="Falecido" />
                </div>
            </Tooltip>;
        }

        if (this.props.birthDate && moment().diff(this.props.birthDate, 'years') >= this.props.displayAge) {
            return <Tooltip title="Idoso" arrow>
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
            </Tooltip>;
        }
        return <div></div>;
    }
}

const mapStateToProps = state => {
    return {
        displayAge: state.common.config.elderTooltipDisplayAge
    };
}


export default connect(mapStateToProps)(ElderTooltip);