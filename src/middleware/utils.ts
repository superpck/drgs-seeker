import moment from 'moment';

export const randomString = async (length: number, format = 'AlphaNumeric') => {
  // format AlphaNumeric=String+number, Special=AlphaNumeric+Special characters
  length = Math.max(1, Math.min(1024, length));
  let result = '';
  const characters1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characters2 = '@ABCDEFGHIJKLMNOPQRSTUVWXYZ-*^abcdefghijklmnopqrstuvwxyz0123456789!$_';
  const characters = format?.substring(0, 1).toUpperCase() == 'S' ? characters2 : characters1;
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
export const dateLen = async (date1: any, date2: any = moment()) => {
  if (date1 === undefined || date1 === null || date1 === '0000-00-00' || date1 === '0000-00-00 00:00:00' || date1 === 'Invalid Date' ||
    date2 === undefined || date2 === null || date2 === '0000-00-00' || date2 === '0000-00-00 00:00:00' || date2 === 'Invalid Date') {
    return false;
  }
  if (!date1 || !date2) {
    return null;
  }

  date1 = moment(date1);
  date2 = moment(date2);
  const duration: any = moment.duration(moment(date2).diff(moment(date1)));
  return {
    days: Math.floor(duration['_milliseconds'] / 1000 / 60 / 60 / 24),
    year: duration['_data']['years'],
    month: duration['_data']['months'],
    day: duration['_data']['days'],
    hour: duration['_data']['hours'],
    minute: duration['_data']['minutes'],
    second: duration['_data']['seconds']
  }
}
export const thaiDateArray = (date: any = moment()) => {
  const thaiMonthAbbr = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const txtMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม', 'กรุณาเลือกเดือน'];
  const thDow = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const thDowAbbr = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const nMonth = moment(date).get('month');
  return {
    dow: moment(date).format('d'),
    day: moment(date).get('date'),
    month: nMonth,
    year: moment(date).get('year'),
    thDow: thDow[+moment(date).format('d')],
    thDowAbbr: thDowAbbr[+moment(date).format('d')],
    thMonth: txtMonth[nMonth],
    thMonthAbbr: thaiMonthAbbr[nMonth],
    thYear: (+moment(date).get('year') + 543)
  };
};
export const thaiDate = (date: any = moment()) => {
  return moment(date).get('date') + '/' + (+moment(date).get('month') + 1) + '/' + (+moment(date).get('year') + 543);
};
export const thaiDateAbbr = (date: any = moment(), withYear = true) => {
  const dateArray: any = thaiDateArray(date);
  return dateArray.day + ' ' + dateArray.thMonthAbbr +
    (withYear ? (' ' + dateArray.thYear) : '');
};
export const thaiDateFull = (date = moment(), withYear = true) => {
  const dateArray: any = thaiDateArray(date);
  return 'วัน' + dateArray.thDow + ' ที่ ' + dateArray.day + ' ' + dateArray.thMonth +
    (withYear ? (' พ.ศ.' + dateArray.thYear) : '');
};
export const timeMinute = (date = moment()) => {
  return moment(date).format('HH:mm');
};
export const timeSecond = (date = moment()) => {
  return moment(date).format('HH:mm:ss');
};
export const sleep = (ms: number = 1000): Promise<void> => {
  const milliseconds = ms < 60 ? ms * 1000 : ms;
  const MAX_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const clampedMs = Math.min(Math.max(milliseconds, 100), MAX_DELAY_MS);
  
  return new Promise(resolve => setTimeout(resolve, clampedMs));
};

