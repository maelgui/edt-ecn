import {AppState} from './reducers';
import {parse} from 'date-fns';
import {eventId} from './event';

export function getCalendar(id) {
	return (dispatch) => {
		dispatch({type: 'LOAD_START'});
		return fetch(`/api/calendar/custom/${id}`)
			.then(res => res.json())
			.then(events => events.map(e => ({...e, start: parse(e.start), end: parse(e.end), id: eventId(e) })))
			.then(events => dispatch({type: 'SET_CALENDAR', events}))
			.then(_ => dispatch({type: 'LOAD_END'}));
	};
}

export function next() {
    return (dispatch, getState) => {
    	let isPhone = getState().responsive.isPhone;
    	dispatch(isPhone ? {type: 'NEXT_DAY'} : {type: 'NEXT_WEEK'});
	}
}

export function prev() {
    return (dispatch, getState) => {
        let isPhone = getState().responsive.isPhone;
		dispatch(isPhone ? {type: 'PREV_DAY'} : {type: 'PREV_WEEK'});
    }
}

export function today() {
	return {type: 'TODAY'};
}

export function toggleMenu() {
	return {type: 'TOGGLE_MENU'};
}