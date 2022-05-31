import moment from 'moment';

export const getNow = () => moment().toISOString();
export const isToDay = (date) => moment().diff(date, 'days') == 0;
export const isYesterday = (date) => moment().diff(date, 'days') == 1;
export const isThisMonth = (date) => moment().diff(date, 'months') == 0;

export default getNow;
