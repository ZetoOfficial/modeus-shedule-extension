class Person {
  constructor(id, firstName, lastName, middleName, fullName) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.fullName = fullName;
  }
}

class Room {
  constructor(id, name, capacity, projectorAvailable, building) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.projectorAvailable = projectorAvailable;
    this.building = building;
  }
}

class Event {
  constructor(id, module, moduleShort, topic, type, room, duration, start, end, state, organizers, team) {
    this.id = id;
    this.module = module;
    this.moduleShort = moduleShort;
    this.topic = topic;
    this.type = type;
    this.room = room;
    this.duration = duration;
    this.start = new Date(start);
    this.end = new Date(end);
    this.state = state;
    this.organizers = organizers;
    this.team = team;
  }

  get organizer() {
    return this.organizers.length > 0 ? this.organizers[0] : null;
  }
}

function convertEvents(responseJson) {
  if (!responseJson || !responseJson._embedded || !responseJson._embedded.events) {
    return [];
  }

  const events = [];
  const { events: eventList, persons, rooms, "event-rooms": eventRooms } = responseJson._embedded;

  eventList.forEach(eventData => {
    const module = findModule(responseJson, eventData._links['course-unit-realization'].href);
    const room = findRoom(eventData, eventRooms, rooms);
    const organizers = findOrganizers(eventData, responseJson._embedded["event-attendees"], persons);
    const team = findTeam(eventData, responseJson._embedded["lesson-realization-teams"]);

    const event = new Event(
      eventData.id,
      module.name,
      module.nameShort,
      eventData.name,
      eventData._links.type.href,
      room,
      calculateDuration(eventData.start, eventData.end),
      eventData.start,
      eventData.end,
      eventData.holdingStatus.name,
      organizers,
      team
    );

    events.push(event);
  });

  // Сортировка по времени начала события
  events.sort((a, b) => a.start - b.start);

  return events;
}

function findModule(responseJson, moduleHref) {
  const module = responseJson._embedded["course-unit-realizations"].find(mod => mod._links.self.href === moduleHref);
  return module || { name: "Unknown", nameShort: "Unknown" };
}

function findRoom(event, eventRooms, rooms) {
  const eventRoomData = eventRooms.find(er => er._links.event.href === event._links.self.href);
  if (eventRoomData) {
    const roomData = rooms.find(r => r._links.self.href === eventRoomData._links.room.href);
    if (roomData) {
      return new Room(
        roomData.id,
        roomData.name,
        roomData.workingCapacity,
        roomData.projectorAvailable,
        roomData.building.nameShort
      );
    }
  }
  return null;
}

function findOrganizers(event, eventAttendees, persons) {
  const attendees = eventAttendees.filter(att => att._links.event.href === event._links.self.href);
  const organizerIds = attendees.map(att => att._links.person.href);
  return persons.filter(person => organizerIds.includes(person._links.self.href));
}

function findTeam(event, lessonRealizationTeams) {
  const teamData = lessonRealizationTeams.find(team => team._links.self.href === event._links["lesson-realization-team"].href);
  return teamData ? teamData.name : null;
}

function calculateDuration(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  return (endTime - startTime) / 60000; // Duration in minutes
}
