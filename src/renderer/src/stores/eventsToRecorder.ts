export const useEventsToRecorderStore = () => {
  const _eventsToRecorderKey: string = 'eventsToRecorder'

  function setEventsToRecorder(newEventsToRecorder: never) {
    sessionStorage.setItem(_eventsToRecorderKey, JSON.stringify(newEventsToRecorder))
  }

  function getEventsToRecorder() {
    return JSON.parse(sessionStorage.getItem(_eventsToRecorderKey))
  }

  return { setEventsToRecorder, getEventsToRecorder }
}
