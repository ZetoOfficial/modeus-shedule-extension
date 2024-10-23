console.log("Content script loaded");

function addDownloadButton() {
  const toolbarRightElement = document.querySelector('.fc-toolbar .fc-right');

  if (toolbarRightElement) {
    if (toolbarRightElement.querySelector('.download-schedule-div')) {
      return;
    }

    console.log("Toolbar right element found, creating download div");

    const downloadDiv = document.createElement('div');
    downloadDiv.textContent = 'Скачать расписание';
    downloadDiv.className = 'download-schedule-div';

    // Стили div, чтобы он выглядел как кнопка и был выровнен по центру
    downloadDiv.style.display = 'inline-block';
    downloadDiv.style.padding = '3.5px 10px';
    downloadDiv.style.fontSize = '14px';
    downloadDiv.style.border = '1px solid #b2bec4';
    downloadDiv.style.borderRadius = '4px';
    downloadDiv.style.backgroundColor = '#ffffff';
    downloadDiv.style.cursor = 'pointer';
    downloadDiv.style.textAlign = 'center';
    downloadDiv.style.userSelect = 'none';
    downloadDiv.style.marginRight = '95px';

    downloadDiv.addEventListener('click', () => {
      console.log("Download div clicked");

      // Получаем данные из sessionStorage напрямую
      const token = sessionStorage.getItem('id_token');
      const claims = JSON.parse(sessionStorage.getItem('id_token_claims_obj'));
      const urlParams = new URLSearchParams(window.location.search);
      const calendarParam = urlParams.get('calendar');
      const calendar = calendarParam ? JSON.parse(decodeURIComponent(calendarParam)) : null;

      if (!token || !claims || !calendar || !calendar.date) {
        console.error("Failed to retrieve token, person_id, or calendar date");
        return;
      }

      const personId = claims.person_id;
      const { timeMin, timeMax } = getWeekTimeRangeFromDate(calendar.date);
      console.log("Week range from URL date:", timeMin, timeMax);

      // Запрос на получение данных расписания
      fetch(`https://utmn.modeus.org/schedule-calendar-v2/api/calendar/events/search?tz=Asia/Tyumen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "size": 500,
          "timeMin": timeMin,
          "timeMax": timeMax,
          "attendeePersonId": [personId]
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log("Fetched schedule data:", data);

          // Преобразование данных в объекты событий
          const events = convertEvents(data);

          // Создание контента для файла .ics
          const icsContent = createICS(events);

          // Форматирование дат для имени файла
          const formattedTimeMin = formatDateForFilename(timeMin);
          const formattedTimeMax = formatDateForFilename(timeMax);
          const fileName = `schedule_${formattedTimeMin}_${formattedTimeMax}.ics`;

          // Сохранение данных в файл .ics
          const blob = new Blob([icsContent], { type: 'text/calendar' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          console.log("Schedule data saved and download initiated");
        })
        .catch(error => console.error("Error fetching schedule data:", error));
    });

    // Настраиваем родительский элемент для центрирования
    toolbarRightElement.style.display = 'flex';
    toolbarRightElement.style.alignItems = 'center';

    // Вставляем div перед первым дочерним элементом, т.е. перед элементом select
    toolbarRightElement.insertBefore(downloadDiv, toolbarRightElement.firstChild);
    console.log("Download div added to toolbar right");
  } else {
    console.error("Toolbar right element not found");
  }
}

// Периодическая проверка и добавление кнопки
setInterval(addDownloadButton, 50);

