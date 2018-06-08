import { openingJsonRequest } from 'utils/api';

import statuses from 'containers/Opening/data/OpeningTerminalStatuses.json';

export const types = {
	CALL_SEND: 'OPENING/CALL_SEND',
	CALL_FAIL: 'OPENING/CALL_FAIL',
	AUTH_DONE: 'OPENING/AUTH_DONE',
	TOKEN_DONE: 'OPENING/TOKEN_DONE',
	TERMS_DONE: 'OPENING/TERMS_DONE',
	RESET_ERROR: 'OPENING/RESET_ERROR',
	DICT_CHANGED: 'OPENING/DICT_CHANGED',
	SESSION_DONE: 'OPENING/SESSION_DONE',
	FORM_CHANGED: 'OPENING/FORM_CHANGED',
	EMPTY_REGDATA: 'OPENING/EMPTY_REGDATA',
	STATUS_CHANGED: 'OPENING/STATUS_CHANGED',
	REGDATA_FETCHED: 'OPENING/REGDATA_FETCHED',
	CONFIRMED_CHANGED: 'OPENING/CONFIRMED_CHANGED',
	FORM_CHANGED_SILENTLY: 'OPENING/FORM_CHANGED_SILENTLY'
};

export const actions = {

	callSend: uri => ({ type: types.CALL_SEND, uri }),

	callFail: error => ({ type: types.CALL_FAIL, error }),

	getStatus: () => openingJsonRequest({
		uri: 'quiz/status',
		callback: ({ ...rest }) => ({ type: types.STATUS_CHANGED, ...rest })
	}),

	postStatus: command => openingJsonRequest({
		uri: `quiz/${ command }`,
		method: 'post',
		callback: ({ ...rest }) => ({ type: types.STATUS_CHANGED, ...rest })
	}),

	getToken: ({ phone, regno }) => openingJsonRequest({
		uri: 'quiz/id',
		method: 'post',
		data: { phone, regno },
		callback: ({ token }) => localStorage.setItem('token', token) || { type: types.TOKEN_DONE }
	}),

	getAuth: ({ code }) => openingJsonRequest({
		uri: 'quiz/auth',
		method: 'post',
		data: { code },
		callback: ({ token }) => localStorage.setItem('token', token) || { type: types.AUTH_DONE }
	}),

	getRegdata: () => openingJsonRequest({
		uri: 'quiz/regdata',
		callback: ({ lines }) => Object.keys(lines).length === 1 ? { lines: {}, type: types.EMPTY_REGDATA } : { lines, type: types.REGDATA_FETCHED }
	}),

	deleteSession: () => openingJsonRequest({
		uri: 'quiz/session',
		method: 'delete',
		callback: () => localStorage.removeItem('token') || ({ type: types.SESSION_DONE })
	}),

	getForm: () => openingJsonRequest({
		uri: 'quiz/form',
		callback: ({ ...rest }) => ({ type: types.FORM_CHANGED, ...rest })
	}),

	postForm: data => openingJsonRequest({
		uri: 'quiz/form',
		method: 'post',
		data,
		errors: { 423: statuses.rejected },
		callback: ({ ...rest }) => ({ type: types.FORM_CHANGED, ...rest })
	}),

	postFormSilently: data => openingJsonRequest({
		uri: 'quiz/form',
		method: 'post',
		data,
		errors: { 423: statuses.rejected },
		callback: ({ ...rest }) => ({ type: types.FORM_CHANGED_SILENTLY, ...rest })
	}),

	getDict: type => openingJsonRequest({
		uri: `dictionary/${ type }`,
		callback: ({ list }) => ({ type: types.DICT_CHANGED, dict: { type, data: list } })
	}),

	resetError: () => ({ type: types.RESET_ERROR })
};

const initialState = {
	auth: false,
	token: false,
	status: null,
	confirmed: false,
	account: null,
	hasError: false,
	isFetching: false,
	isEmptyRegdata: null,
	values: {},
	silentValues: {}
};

export default (state = initialState, action) => {

	switch (action.type) {

		case types.CALL_SEND: return {
			...state,
			hasError: false,
			isFetching: true
		};

		case types.CALL_FAIL: return {
			...state,
			hasError: true,
			isFetching: false
		};

		case types.STATUS_CHANGED: return {
			...state,
			status: action.status,
			reason: action.reason,
			confirmed: action.confirmed,
			tariff: action.tariff,
			account: action.account,
			regno: action.regno,
			auth: true,
			isFetching: false
		};

		case types.TOKEN_DONE: return {
			...state,
			token: true,
			isFetching: false
		};

		case types.AUTH_DONE: return {
			...state,
			auth: true,
			isFetching: false
		};

		case types.SESSION_DONE: return {
			...initialState
		};

		case types.REGDATA_FETCHED: return {
			...state,
			values: {
				...initialState.values,
				...action.lines
			},
			isFetching: false,
			isEmptyRegdata: false
		};

		case types.EMPTY_REGDATA: return {
			...state,
			isFetching: false,
			isEmptyRegdata: true
		};

		case types.FORM_CHANGED: return {
			...state,
			values: {
				...initialState.values,
				...action.lines
			},
			isFetching: false
		};

		case types.FORM_CHANGED_SILENTLY: return {
			...state,
			silentValues: {
				...initialState.silentValues,
				...action.lines
			},
			isFetching: false
		};

		case types.DICT_CHANGED: return {
			...state,
			[action.dict.type]: action.dict.data,
			isFetching: false
		};

		case types.RESET_ERROR: return {
			...state,
			hasError: false
		};

		default: return state;
	}
};
