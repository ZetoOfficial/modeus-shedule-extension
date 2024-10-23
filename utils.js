function getDataFromSessionStorage() {
  const token = sessionStorage.getItem('id_token');
  const claims = JSON.parse(sessionStorage.getItem('id_token_claims_obj'));
  const urlParams = new URLSearchParams(window.location.search);
  const calendarParam = urlParams.get('calendar');
  return {
    token,
    personId: claims ? claims.person_id : null,
    calendar: calendarParam ? JSON.parse(decodeURIComponent(calendarParam)) : null
  };
}

function getWeekTimeRangeFromDate(dateStr) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getUTCDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const diffToSunday = 6 - diffToMonday;

  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(date);
  sunday.setUTCDate(date.getUTCDate() + diffToSunday);
  sunday.setUTCHours(23, 59, 59, 999);

  return {
    timeMin: monday.toISOString(),
    timeMax: sunday.toISOString()
  };
}

function formatDateForFilename(dateStr) {
  const date = new Date(dateStr);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}