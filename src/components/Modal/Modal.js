import React from "react";
import { Backdrop, Fade, Modal } from "@material-ui/core";

class CustomModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true
        }
    }

    render() {
        const { open, onClose } = this.props;

        return (
            <div>

                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    //className={classes.modal}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    open={open}
                    onClose={() => {
                        this.setState({
                            open: false
                        })
                        if (onClose) {
                            onClose();
                        }
                    }}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >

                    <Fade in={open}>
                        <div style={{
                            minWidth: '200px',
                            backgroundColor: "white",
                            border: '10px solid white',
                            borderRadius: '5px',
                            //boxShadow: theme.shadows[5],
                            padding: '1em',
                        }}>
                            <h2 id="transition-modal-title">Title</h2>
                            <p id="transition-modal-description">description</p>
                        </div>
                    </Fade>
                </Modal>



            </div>
        );
    }
}

export default CustomModal;