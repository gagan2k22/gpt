const normalizeToMMM = (header) => {
    if (!header) throw new Error('Empty header');
    const s = header.trim().replace(/\s+/g, ' ');
    const short = s.match(/^([A-Za-z]{3})/);
    if (short) {
        const cap = short[1][0].toUpperCase() + short[1].slice(1).toLowerCase();
        const map = { Jan: 'Jan', Feb: 'Feb', Mar: 'Mar', Apr: 'Apr', May: 'May', Jun: 'Jun', Jul: 'Jul', Aug: 'Aug', Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Dec' };
        if (map[cap]) return map[cap];
    }
    const full = s.toLowerCase();
    const fullMap = { january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr', may: 'May', june: 'Jun', july: 'Jul', august: 'Aug', september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec' };
    for (const k of Object.keys(fullMap)) {
        if (full.startsWith(k)) return fullMap[k];
    }
    throw new Error(`Invalid month header: ${header}`);
};

module.exports = { normalizeToMMM };
