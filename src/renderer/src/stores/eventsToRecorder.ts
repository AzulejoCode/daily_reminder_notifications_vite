import { TasksInterface } from '../util/EventReminder'

export const useEventsToRecorderStore = () => {
  const _eventsToRecorderKey: string = 'eventsToRecorder'

  function setEventsToRecorder(newEventsToRecorder: TasksInterface[]) {
    sessionStorage.setItem(_eventsToRecorderKey, JSON.stringify(newEventsToRecorder))
  }

  function getEventsToRecorder() {
    return JSON.parse(sessionStorage.getItem(_eventsToRecorderKey) ?? '')
  }

  return { setEventsToRecorder, getEventsToRecorder }
}
