import React from "react";
import PropTypes from 'prop-types';

import CustomInput from "components/CustomInput/CustomInput";
import { connect } from "react-redux";
import { fetchCompanies } from "store/actions";

class CompanySelect extends React.Component {

    componentDidMount() {
        this.props.fetchCompanies();
    }

    render() {
        const { classes, inputProps, formControlProps, ...other } = this.props;
        return (
            <div>
                {this.props.common.data.companies &&
                    <CustomInput select={true} {...other}
                        formControlProps={formControlProps}
                        inputProps={inputProps}>
                        {this.props.common.data.companies.map((e, i) => {
                            return (<option value={e.id} key={i}>{e.name}</option>)
                        })}
                    </CustomInput>}
            </div>
        );
    }
}

CompanySelect.propTypes = {
    formControlProps: PropTypes.object,
    inputProps: PropTypes.object
}

CompanySelect.defaultProps = {
    formControlProps: {
        fullWidth: true
    }
}

const mapStateToProps = state => {
    return {
        common: {
            data: {
                companies: state.common.data.companies
            }
        }
    };
}

const mapDispatchToProps = dispatch => ({
    fetchCompanies: (callback) => dispatch(fetchCompanies(callback))
})


export default connect(mapStateToProps, mapDispatchToProps)(CompanySelect);