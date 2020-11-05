import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";

import Button from "components/CustomButtons/Button";
import SearchIcon from '@material-ui/icons/Search';
import Axios from "axios";
import {
    authRequestInterceptor, authRequestInterceptorOnError,
    authResponseInterceptor, authResponseInterceptorOnError
} from "auth/interceptor";
import { loadingRequestInterceptor } from "components/Loading/interceptor";
import { loadingRequestInterceptorOnError } from "components/Loading/interceptor";
import { loadingResponseInterceptor } from "components/Loading/interceptor";
import { loadingResponseInterceptorOnError } from "components/Loading/interceptor";
import { connect } from "react-redux";


const axios = Axios.create();
axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorOnError);
axios.interceptors.response.use(authResponseInterceptor, authResponseInterceptorOnError);

axios.interceptors.request.use(loadingRequestInterceptor, loadingRequestInterceptorOnError);
axios.interceptors.response.use(loadingResponseInterceptor, loadingResponseInterceptorOnError);


class AddressComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            validCepInput: true,
            addressFromCep: this.getInitialAddressFromCepState()
        }
    }

    getInitialAddressFromCepState() {
        return {
            streetName: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: ""
        };
    }

    getInitialDataAddressState() {
        return {
            zipCode: "",
            streetName: "",
            streetNumber: "",
            streetNumberComplement: "",
            neighborhood: "",
            city: "",
            state: "SP",
        }
    }

    cepInputKeyPress(e) {
        if (e.key === 'Enter') {
            this.fetchCep();
        }
    }

    fetchCep() {
        if (this.props.data.address.zipCode.length === 9) {
            axios.get('/api/cep?cep=' + this.props.data.address.zipCode.replace(/^\D+/g, ''), {
                headers: {
                    "Accept": "application/json"
                }
            })
                .then(res => {
                    if (res.status == 200) {
                        const { data } = res;
                        if (data.state) {

                            this.props.onChange({
                                ...this.props.data.address,
                                zipCode: data.zipCode,
                                streetName: data.streetName,
                                neighborhood: data.neighborhood,
                                city: data.city,
                                state: data.state
                            });
                        } else {
                            this.setState({ validCepInput: false });
                            this.props.onChange(this.getInitialDataAddressState());
                        }
                    } else {
                        this.setState({ validCepInput: false });
                        this.props.onChange(this.getInitialDataAddressState());
                    }
                })
                .catch(err => {
                    this.setState({ validCepInput: false });
                    this.props.onChange(this.getInitialDataAddressState());
                })
        }
    }

    changeCep(e) {
        var sanitizedValue = e.target.value.substring(0, 9).replace(/^(\d{5})(\d).*/, '$1-$2');

        this.props.onChange({
            ...this.props.data.address,
            zipCode: sanitizedValue
        });

        this.setState({ validCepInput: true });
    }

    render() {
        return (
            <div>

                <GridContainer>
                    <GridItem xs={6} sm={6} md={4} lg={2}>
                        <CustomInput id="address-cep" labelText="CEP" style={{ width: "100%" }}
                            error={!this.state.validCepInput}
                            formControlProps={{ fullWidth: false, style: { width: "100%" } }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.zipCode,
                                onChange: this.changeCep.bind(this),
                                onKeyPress: this.cepInputKeyPress.bind(this),
                            }} />
                    </GridItem>
                    <GridItem xs={6} sm={3} md={2} lg={1}>
                        {this.props.editing &&
                            <CustomInput>
                                <Button color="primary"
                                    disabled={!this.props.editing || this.props.data.address.zipCode.length !== 9}
                                    onClick={this.fetchCep.bind(this)}><SearchIcon /> Buscar</Button>
                            </CustomInput>}
                    </GridItem>

                </GridContainer>

                <GridContainer>

                    <GridItem xs={12} sm={12} md={6} lg={6}>
                        <CustomInput id="streetName" labelText="Rua"
                            formControlProps={{ fullWidth: true }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.streetName,
                                onChange: (e) => this.props.onChange({
                                    ...this.props.data.address,
                                    streetName: e.target.value
                                })
                            }} />
                    </GridItem>

                    <GridItem xs={6} sm={6} md={3} lg={3}>
                        <CustomInput id="streetNumber" labelText="Número"
                            formControlProps={{ fullWidth: true }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.streetNumber,
                                onChange: (e) => this.props.onChange({
                                    ...this.props.data.address,
                                    streetNumber: e.target.value
                                })
                            }} />
                    </GridItem>

                    <GridItem xs={6} sm={6} md={3} lg={3}>
                        <CustomInput id="streetNumberComplement" labelText="Complemento"
                            formControlProps={{ fullWidth: true }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.streetNumberComplement,
                                onChange: (e) => this.props.onChange({
                                    ...this.props.data.address,
                                    streetNumberComplement: e.target.value
                                })
                            }} />
                    </GridItem>

                    <GridItem xs={12} sm={12} md={5} lg={5}>
                        <CustomInput id="neighborhood" labelText="Bairro"
                            formControlProps={{ fullWidth: true }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.neighborhood,
                                onChange: (e) => this.props.onChange({
                                    ...this.props.data.address,
                                    neighborhood: e.target.value

                                })
                            }} />
                    </GridItem>

                    <GridItem xs={9} sm={8} md={5} lg={5}>
                        <CustomInput id="city" labelText="Cidade"
                            formControlProps={{ fullWidth: true }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.city,
                                onChange: (e) => this.props.onChange({
                                    ...this.props.data.address,
                                    city: e.target.value
                                })
                            }} />
                    </GridItem>

                    <GridItem xs={3} sm={4} md={2} lg={2}>
                        <CustomInput id="state" labelText="Estado" select={true}
                            formControlProps={{ fullWidth: true }}
                            labelProps={{ shrink: true }}
                            inputProps={{
                                disabled: !this.props.editing,
                                value: this.props.data.address.state,
                                onChange: (e) => this.props.onChange({
                                    ...this.props.data.address,
                                    state: e.target.value
                                }
                                )
                            }}>
                            {this.props.common.data.states.map((e, i) => {
                                return (<option value={e} key={i}>{e}</option>)
                            })}
                        </CustomInput>
                    </GridItem>
                </GridContainer>


            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        common: {
            data: {
                states: state.common.data.states
            }
        }
    };
}


export default connect(mapStateToProps)(AddressComponent);