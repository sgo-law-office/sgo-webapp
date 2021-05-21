import {
  //msal
  LOGIN_TOKEN_SUCCESS, LOGOUT_SUCCESS,

  // setup
  SUCCESS_GRAPH_USER_DATA, ERROR_GRAPH_USER_DATA,
  SUCCESS_FETCH_ACCOUNT, ERROR_FETCH_ACCOUNT,
  SUCCESS_FETCH_COMPANIES, ERROR_FETCH_COMPANIES,
  SUCCESS_ACCOUNT_CREATE, ERROR_ACCOUNT_CREATE,

  SUCCESS_FETCH_LAWYERS, ERROR_FETCH_LAWYERS,
  SUCCESS_FETCH_COURTS, ERROR_FETCH_COURTS,
  SUCCESS_FETCH_PHONES, ERROR_FETCH_PHONES, SUCCESS_FETCH_PROCESS_ACTIONS, ERROR_FETCH_PROCESS_ACTIONS

} from './actions';

const initialState = {
  account: null,
  jwt: null,
  err: null,
  graph: {
    account: null,
    err: null
  },
  common: {
    data: {
      companies: null,
      states: [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
      ]
    },
    config: {
      elderTooltipDisplayAge: 60
    }
  }
};

export default function (state = initialState, action) {
  switch (action.type) {
    // msal
    case LOGIN_TOKEN_SUCCESS:
      return {
        ...state,
        err: null,
        jwt: action.payload.jwtIdToken
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        err: null,
        jwt: null
      };

    // setup
    case SUCCESS_GRAPH_USER_DATA:
      return {
        ...state,
        graph: {
          ...state.graph,
          account: action.payload
        }
      };
    case ERROR_GRAPH_USER_DATA:
      return {
        ...state,
        graph: {
          err: action.payload
        }
      }

    case SUCCESS_FETCH_COMPANIES:
      return {
        ...state,
        common: {
          ...state.common,
          data: {
            ...state.common.data,
            companies: action.payload
          }
        }
      }

    case SUCCESS_FETCH_LAWYERS:
      return {
        ...state,
        common: {
          ...state.common,
          data: {
            ...state.common.data,
            lawyers: action.payload
          }
        }
      }

    case SUCCESS_FETCH_COURTS:
      return {
        ...state,
        common: {
          ...state.common,
          data: {
            ...state.common.data,
            courts: action.payload
          }
        }
      }

    case SUCCESS_FETCH_PHONES:
      return {
        ...state,
        common: {
          ...state.common,
          data: {
            ...state.common.data,
            phones: action.payload
          }
        }
      }

    case SUCCESS_FETCH_PROCESS_ACTIONS:
      return {
        ...state,
        common: {
          ...state.common,
          data: {
            ...state.common.data,
            processActions: action.payload
          }
        }
      }

    case SUCCESS_FETCH_ACCOUNT:
    case SUCCESS_ACCOUNT_CREATE:
      return {
        ...state,
        account: action.payload
      }

    case ERROR_FETCH_ACCOUNT:
      return state;

    case ERROR_FETCH_COMPANIES:
    case ERROR_FETCH_LAWYERS:
    case ERROR_FETCH_COURTS:
    case ERROR_FETCH_PHONES:
    case ERROR_FETCH_PROCESS_ACTIONS:
    case ERROR_ACCOUNT_CREATE:
      return {
        ...state,
        err: action.payload
      }

    default:
      return state;
  }
}