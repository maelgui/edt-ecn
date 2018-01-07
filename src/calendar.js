const ical = require('ical-generator');
const request = require('request-promise');
const libxmljs = require('libxmljs');
const moment = require('moment-timezone');
const crypto = require('crypto');
const Filter = require('./filter');

const FILTER = 'Groupe';
const WARN_MESSAGE = "(!) Ce calendrier n'est peut être pas à jour. Les filtres sont désactivés par sécurité."

const dateFromCourseTime = function(date, hour) {
	let parsed = hour.split(':').map((i) => parseInt(i, 10));
	let new_date = moment(date);
	new_date.hours(parsed[0]);
	new_date.minutes(parsed[1]);
	return new_date;
};

const safeGet = function(node, xpaths, fallback) {
	fallback = typeof fallback === 'undefined' ? '' : fallback;
	let res = fallback;
	xpaths.some((xpath) => {
		try {
			res = node.get(xpath).text();
			return true;
		} catch (e) {
			return false;
		}
	});
	return res;
};

exports.listOnlineCalendars = function(type) {
	if (typeof type === 'undefined') {
		type = 'g';
	}
	let url = 'http://website.ec-nantes.fr/sites/edtemps/finder.xml';
	return request(url).then(function(body) {
		let doc = libxmljs.parseXml(body);
		return doc.find('/finder/resource')
			.filter((node) => node.get('link').attr('href').value()[0] === type)
			.map((node) => {
				let names = node.get('name').text().split(',');
				let id = node.get('link').attr('href').value().split('.').shift();
				return {
					id: id,
					name: names[0].trim(),
					display: typeof names[1] !== 'undefined' ? names[1].trim() : ''
				};
			});
	});
};

exports.getIdFromName = function(name) {
	return exports.listOnlineCalendars()
		.then((calendars) => calendars.find((cal) => cal.name.toLowerCase() === name.toLowerCase()))
		.then((cal) => cal.id);
};

const mapNodeToCalendar = function(node, dates) {
	const reg = /(\w+) \(\1\)/i;
	let day = parseInt(node.get('day').text(), 10);
	let week = parseInt(node.get('prettyweeks').text(), 10);
	let date = dates[week][day];
	let description = safeGet(node, ['notes']);
	let organizer = safeGet(node, ['resources/staff/item']).split(' ').shift();
	let subject = safeGet(node, ['resources/module/item', 'notes']).split('-').shift();
	if (reg.test(subject)) {
		subject = subject.split(' ').shift();
	}
	let location = safeGet(node, ['resources/room/item']);
	if (reg.test(location)) {
		location = location.split(' ').shift();
	}
	subject = subject.trim();
	let full_subject = safeGet(node, ['category']) + ' ' + subject;
	return {
		start: dateFromCourseTime(date, node.get('starttime').text()),
		end: dateFromCourseTime(date, node.get('endtime').text()),
		subject: subject,
		full_subject: full_subject.trim(),
		location: location,
		description: description,
		organizer: organizer
	}
}

exports.getOnlineCalendar = function(id) {
	const url = 'http://website.ec-nantes.fr/sites/edtemps/' + id + '.xml';
	return request(url).then(function(body) {
		let doc = libxmljs.parseXml(body);
		let dates = [];
		doc.find('/timetable/span').map((node) => {
			let index = parseInt(node.get('title').text(), 10);
			dates[index] = node.find('day/date').map((date) => moment.tz(date, 'DD/MM/YYYY', 'Europe/Paris'));
		});
		return doc.find('//event')
			.map(node => mapNodeToCalendar(node, dates))
			.sort((a, b) => a.start - b.start);
	});
};

exports.getSubjects = function(events) {
	return events
		.map((e) => e = { subject: e.subject, date: e.start })
		.sort((a, b) => {
			let bool = a.subject < b.subject || a.subject == b.subject && a.date < b.date
			return bool ? -1 : 1;
		})
		.filter((e, pos, arr) => (e.subject.length && (!pos || e.subject != arr[pos - 1].subject)))
		.sort((a, b) => (a.date < b.date ? -1 : 1))
		.reduce((final, e, index) => {
			final[e.subject] = index;
			return final;
		}, {});
};

const getSimpleCustomCalendar = function(id) {
	let [calid, filter_withsum] = id.split('-');
	if (typeof filter_withsum === 'undefined') {
		return exports.getOnlineCalendar(calid);
	}
	let [filter_enc, checksum] = filter_withsum.split('_');
	let filter = Filter.parse(filter_enc);
	return exports.getOnlineCalendar(calid)
		.then((events) => {
			let subjects = exports.getSubjects(events);
			let warn = typeof checksum !== 'undefined' && checkSubjects(filter, subjects, checksum);
			if (warn) {
				return events.map(e => Object.assign(e, {
						description: e.description + WARN_MESSAGE
					}));
			}
			return events
				.filter((event) => {
					let pos = subjects[event.subject];
					return filter.test(pos);
				});
		});
};

exports.getCustomCalendar = function(id) {
	return Promise.all(id
			.split('+')
			.map(getSimpleCustomCalendar))
		.then(all => all.reduce((acc, events) => acc.concat(events), []));
};

const makeChecksum = function(indexed_subjects, length) {
	let str = Object.keys(indexed_subjects).slice(0, length).join(',');
	return crypto.createHash('sha1').update(str).digest('hex').substr(0, 6);
};

const checkSubjects = function(filter, subjects, checksum) {
	let length;
	if (checksum.indexOf('l') > -1) { // old checksum format!
		let [l, c] = checksum.split('l');
		length = parseInt(l, 10);
		checksum = c;
	} else {
		length = filter.length();
	}
	return checksum !== makeChecksum(subjects, length);
};

exports.createFilter = function(id, indices, subjects) {
	let filter = Filter.from(indices);
	return id + '-' + filter.toString() + '_' + makeChecksum(subjects, filter.length());
};

exports.calendarToIcs = function(events) {
	let cal = ical({
        domain: 'ec-nantes.fr',
        name: 'EDT',
        timezone: 'Europe/Paris',
        prodId: { company: 'ec-nantes.fr', product: 'edt' },
    });
	events.forEach((event) => {
		cal.createEvent({
			start: event.start.tz('UTC').toDate(),
			end: event.end.tz('UTC').toDate(),
			summary: event.full_subject,
			description: event.description,
			location: event.location,
			// organizer: {
			// 	name: event.organizer,
			// 	email: ''
			// }
		});
    });
    return cal.toString();
};