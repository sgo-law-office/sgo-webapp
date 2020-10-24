
import Notification from "components/Notifications/Notification";
import React from "react";
import { connect } from "react-redux";

class GeneralNotification extends React.Component {
   
    render() {
        return (
            <Notification
                //severity={this.state.notification.severity}
                //message={this.state.notification.message}
                //open={this.state.notification.display}
                open={this.props.err || this.props.graph.err}
                onClose={() => {
                    // this.setState({
                    //     notification: {
                    //         ...this.state.notification,
                    //         display: false,
                    //         severity: "",
                    //         message: ""
                    //     }
                    // });
                }}
            />
        );
    }
}


const mapStateToProps = state => {
    return {
        err: state.err,
        graph: {
            err: state.graph.err
        }
    };
}

// const mapDispatchToProps = dispatch => ({
//     fetchCompanies: (callback) => dispatch(fetchCompanies(callback)),
//     createAccount: (account) => dispatch(createAccount(account))
// })

export default connect(mapStateToProps)(GeneralNotification);
