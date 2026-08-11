(() => {
  const TIME_ZONE = 'America/Sao_Paulo';

  function getSaoPauloDateISO(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function shiftISODate(isoDate, days) {
    const [year, month, day] = String(isoDate).split('-').map(Number);
    const shifted = new Date(Date.UTC(year, month - 1, day + Number(days)));
    return [shifted.getUTCFullYear(), String(shifted.getUTCMonth() + 1).padStart(2, '0'), String(shifted.getUTCDate()).padStart(2, '0')].join('-');
  }

  window.MMSDate = Object.freeze({ TIME_ZONE, getSaoPauloDateISO, shiftISODate });
})();
