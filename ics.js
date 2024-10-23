function createICS(events) {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//zetoqqq//UTMN Schedule calendar//RU\n";

    events.forEach(event => {
        const summary = `${event.type}, ${event.moduleShort}, ${event.organizer ? event.organizer.lastName + " " + event.organizer.firstName : "Неизвестно"}`;

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `UID:${event.id}\n`;
        icsContent += `DTSTAMP:${formatDateToICS(new Date())}\n`;
        icsContent += `DTSTART:${formatDateToICS(event.start)}\n`;
        icsContent += `DTEND:${formatDateToICS(event.end)}\n`;
        icsContent += `SUMMARY:${summary}\n`;
        icsContent += `DESCRIPTION:${event.topic}; ${event.module}\n`;
        if (event.room) {
            icsContent += `LOCATION:${event.room.name}, ${event.room.building}\n`;
        }
        icsContent += `STATUS:${event.state}\n`;
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    return icsContent;
}

function formatDateToICS(date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
