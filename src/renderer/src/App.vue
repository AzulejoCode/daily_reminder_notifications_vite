<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Daily Reminder Notifications</div>
  <div class="text">
    Añade tus
    <span class="vue">tareas</span>
    y/o
    <span class="vue">eventos</span>
    especiales y te las
    <span class="ts">Recordaré</span>
  </div>
  <p class="tip">
    A continuación se mostrarán todos los <code>eventos</code> o <code>tareas</code> que quieres que
    te recuerde:
  </p>
  <table v-if="listTasksComputed.length > 0">
    <tr>
      <th>Tipo</th>
      <th>Título</th>
      <th>Descripción</th>
      <th>Fecha</th>
      <th>Configuración ⚙️</th>
    </tr>
    <tr v-for="(task, task_index) in listTasksComputed">
      <td>
        <select
          :id="task_index + 'f_input_type'"
          :name="task_index + 'f_input_type'"
          :disabled="!listIndexTasksEditable.includes(task_index)"
          :value="task.type"
        >
          <option
            v-for="(typeEvent, typeEventKey) in TypeReminderEnum"
            :key="task_index + typeEventKey"
            :value="typeEvent"
          >
            {{ typeEvent }}
          </option>
        </select>
      </td>
      <td>
        <input
          id="f_input_title"
          name="f_input_title"
          type="text"
          :readonly="!listIndexTasksEditable.includes(task_index)"
          :value="task.title"
        />
      </td>
      <td>
        <input
          id="f_input_description"
          name="f_input_description"
          type="text"
          :readonly="!listIndexTasksEditable.includes(task_index)"
          :value="task.description"
        />
      </td>
      <td>
        <input
          id="f_input_special_date"
          name="f_input_special_date"
          type="date"
          :readonly="!listIndexTasksEditable.includes(task_index)"
          :value="formattedDate(task.specialDate)"
        />
      </td>
      <td>
        <input
          v-show="!listIndexTasksEditable.includes(task_index)"
          id="f_input_edit"
          name="f_input_edit"
          type="button"
          value="✏️"
          @click="setToEdit(task_index)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_save_changes"
          name="f_input_save_changes"
          type="button"
          value="✅"
          @click="saveChanges(task_index)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_discarg_changes"
          name="f_input_discarg_changes"
          type="button"
          value="🚨"
          @click="cancelChanges(task_index)"
        />
      </td>
    </tr>
  </table>
  <table v-else>
    <tr>
      <th>Aun no tienes nada guardado 🗑️!</th>
    </tr>
  </table>
  <div class="actions">
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="sendNotification()">Show Notification</a>
    </div>
  </div>
  <Versions />
</template>
<script setup lang="ts">
import Versions from './components/Versions.vue'
import { computed, onMounted, ref } from 'vue'
import imgNotificationUrl from './assets/electron.png'
import { TasksInterface, TypeReminderEnum } from './util/EventReminder'

import { useEventsToRecorderStore } from './stores/eventsToRecorder'

function formattedDate(dateToFormat: string) {
  const dateParsed = new Date(dateToFormat)
  console.warn(dateParsed)
  console.assert(dateParsed instanceof Date)
  // Convertimos la fecha al formato YYYY-MM-DD
  return dateParsed.toISOString().substring(0, 10)
}

const showNotificatoinHandle = (title: string, body: string) => {
  if (!Notification.permission) {
    alert('⚠️ No puedo notificarte nada!')
  }

  const notification = new Notification(title, {
    body: body,
    icon: imgNotificationUrl
  })
  notification.onshow
}

interface RemainingTimeInterface {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function remainingTime(specialDate: Date): RemainingTimeInterface {
  // Fecha actual
  const currentDate = new Date()

  // Obtener la remainingTime en milisegundos
  const remainingTime = specialDate.getTime() - currentDate.getTime()

  // Calcular días
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))

  // Calcular horas restantes
  const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  // Calcular minutos restantes
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))

  // Calcular segundos restantes
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

function armMessageBodyNotification(
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
  title: string
) {
  console.warn({ days, hours, minutes, seconds })

  const prefixMessage: string = days + hours + minutes + seconds <= 4 ? 'Queda' : 'Quedan'
  let daysMessage: string = days == 1 ? `${days} día,` : ''
  daysMessage = days > 1 ? `${days} días,` : daysMessage
  let hoursMessage: string = hours == 1 ? `${hours} hora,` : ''
  hoursMessage = hours > 1 ? `${hours} horas,` : hoursMessage
  let minutesMessage: string = minutes == 1 ? `${minutes} minuto,` : ''
  minutesMessage = minutes > 1 ? `${minutes} minutos,` : minutesMessage
  let secondsMessage: string = seconds == 1 ? `${seconds} segundo` : ''
  secondsMessage = seconds > 1 ? `${seconds} segundos` : secondsMessage
  return `${prefixMessage} ${daysMessage} ${hoursMessage} ${minutesMessage} ${secondsMessage} para ${title}.`
}

function sendNotification() {
  listTasksComputed.value.forEach((task) => {
    const specialDay: Date = new Date(task.specialDate)
    const { days, hours, minutes, seconds }: RemainingTimeInterface = remainingTime(specialDay)
    const title: string = task.title

    showNotificatoinHandle(title, armMessageBodyNotification(days, hours, minutes, seconds, title))
  })
}

function timeToMiliseconds(hours: number = 0, minutes: number = 0, seconds: number = 0) {
  const hoursToMiliseconds = hours * 60 * 60 * 1000 // Convertir horas a milisegundos
  const minutesToMiliseconds = minutes * 60 * 1000 // Convertir minutos a milisegundos
  const secondsToMiliseconds = seconds * 1000 // Convertir segundos a milisegundos

  return hoursToMiliseconds + minutesToMiliseconds + secondsToMiliseconds
}

const { setEventsToRecorder, getEventsToRecorder } = useEventsToRecorderStore()

const listTasksRef = ref([])
const listIndexTasksEditable = ref([])

function setToEdit(indexTask: number) {
  listIndexTasksEditable.value[indexTask] = indexTask
}

function saveChanges(indexTask: number) {
  delete listIndexTasksEditable.value[indexTask]
}

function cancelChanges(indexTask: number) {
  delete listIndexTasksEditable.value[indexTask]
}

const listTasksComputed = computed((): TasksInterface[] => {
  return listTasksRef.value ?? []
})

function programNotifications() {
  const intervalCalculated: number = timeToMiliseconds(0, 5, 0)
  const timeInterval: number = intervalCalculated >= 1000 ? intervalCalculated : 1000
  setInterval(sendNotification, timeInterval)
}

onMounted(() => {
  const preChargeEvents: TasksInterface[] = [
    {
      type: TypeReminderEnum.EVENT,
      title: 'Día libre 🥳',
      specialDate: new Date('2024-09-31T23:59:59')
    },
    {
      type: TypeReminderEnum.TASK,
      title: 'Dormir 😴',
      specialDate: new Date('2024-09-17T23:59:59')
    }
  ]
  setEventsToRecorder(preChargeEvents)
  console.log(getEventsToRecorder())
  listTasksRef.value = getEventsToRecorder()
  //programNotifications()
})
</script>

<style scoped>
table {
  background-color: var(--ev-button-alt-bg);
  border-radius: 20px;
  padding: 20px;
}

th {
  color: var(--ev-button-alt-text);
  font-weight: 600;
}

td > input {
  background-color: transparent;
  outline: none;
  border: none;
}

input {
  color: var(--ev-button-alt-text);
}

select {
  color: var(--ev-button-alt-text);
  background-color: transparent;
  border: none;
}

select:disabled,
input:read-only {
  color: var(--ev-c-text-2);
  background-color: transparent;
  border: none;
}

::-webkit-calendar-picker-indicator {
  filter: invert();
  background-color: transparent;
}

input[type='button'] {
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  border: 1px solid var(--ev-button-alt-text);
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
  color: var(--ev-button-alt-text);
  background-color: var(--ev-button-alt-bg);
}

input[type='button']:hover {
  background-color: var(--ev-c-text-2);
}
</style>
