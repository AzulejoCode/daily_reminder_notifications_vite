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
      <th>Vence</th>
      <th>Recordar ⏰</th>
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
          id="f_input_interval_recorder"
          name="f_input_interval_recorder"
          type="text"
          :readonly="!listIndexTasksEditable.includes(task_index)"
          :value="msToTime(task.intervalRecorder)"
        />
      </td>
      <td style="border-right: none">
        <input
          v-show="!listIndexTasksEditable.includes(task_index)"
          id="f_input_edit"
          name="f_input_edit"
          type="button"
          style="width: 100%"
          value="✏️"
          @click="setToEdit(task_index)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_save_changes"
          name="f_input_save_changes"
          type="button"
          style="width: 50%"
          value="✅"
          @click="saveChanges(task_index)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_discarg_changes"
          name="f_input_discarg_changes"
          type="button"
          style="width: 50%"
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
      <a
        target="_blank"
        rel="noreferrer"
        @click="
          () => {
            listTasksComputed.forEach((task) => {
              sendNotification(task)
            })
          }
        "
        >Show Notification</a
      >
    </div>
  </div>
  <Versions />
</template>
<script setup lang="ts">
import Versions from './components/Versions.vue'
import { computed, onMounted, Ref, ref } from 'vue'
import imgNotificationUrl from './assets/electron.png'
import { TasksInterface, TypeReminderEnum } from './util/EventReminder'

import { useEventsToRecorderStore } from './stores/eventsToRecorder'

function formattedDate(dateToFormat: string | Date) {
  const dateParsed = new Date(dateToFormat)
  console.warn(dateParsed)
  console.assert(dateParsed instanceof Date)
  // Convertimos la fecha al formato YYYY-MM-DD
  return dateParsed.toISOString().substring(0, 10)
}

function msToTime(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)

  // Formato de dos dígitos para horas, minutos y segundos
  const hoursStr = hours < 10 ? '0' + hours : hours
  const minutesStr = minutes < 10 ? '0' + minutes : minutes
  const secondsStr = seconds < 10 ? '0' + seconds : seconds

  return hoursStr + ':' + minutesStr + ':' + secondsStr
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
  setTimeout(
    () => {
      notification.close()
    },
    timeToMiliseconds(0, 0, 10)
  )
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
  description: string
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
  return `${prefixMessage} ${daysMessage} ${hoursMessage} ${minutesMessage} ${secondsMessage} para ${description}.`
}

function sendNotification(task: TasksInterface) {
  const specialDay: Date = new Date(task.specialDate)
  const { days, hours, minutes, seconds }: RemainingTimeInterface = remainingTime(specialDay)

  showNotificatoinHandle(
    task.title,
    armMessageBodyNotification(days, hours, minutes, seconds, task.description ?? '')
  )
}

function timeToMiliseconds(hours: number = 0, minutes: number = 0, seconds: number = 0) {
  const hoursToMiliseconds = hours * 60 * 60 * 1000 // Convertir horas a milisegundos
  const minutesToMiliseconds = minutes * 60 * 1000 // Convertir minutos a milisegundos
  const secondsToMiliseconds = seconds * 1000 // Convertir segundos a milisegundos

  return hoursToMiliseconds + minutesToMiliseconds + secondsToMiliseconds
}

const { setEventsToRecorder, getEventsToRecorder } = useEventsToRecorderStore()

const listTasksRef = ref([])
const listIndexTasksEditable: Ref<number[]> = ref([])

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
  listTasksComputed.value.forEach((task) => {
    const timeInterval: number = task.intervalRecorder >= 1000 ? task.intervalRecorder : 1000
    setInterval(() => {
      sendNotification(task)
    }, timeInterval)
  })
}

onMounted(() => {
  const preChargeEvents: TasksInterface[] = [
    {
      type: TypeReminderEnum.EVENT,
      title: 'Día libre 🥳',
      specialDate: new Date('2024-09-31T23:59:59'),
      intervalRecorder: timeToMiliseconds(1, 0, 0)
    },
    {
      type: TypeReminderEnum.SPECIAL_EVENT,
      title: 'Fin jornada laboral 😏',
      description: 'DESCANSARRRR 😎🏖️',
      specialDate: new Date('2024-09-18T18:00:00'),
      intervalRecorder: timeToMiliseconds(0, 59, 0)
    }
  ]
  setEventsToRecorder(preChargeEvents)
  console.log(getEventsToRecorder())
  listTasksRef.value = getEventsToRecorder()
  programNotifications()
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

td {
  border-right: 1px solid var(--ev-c-text-1);
}

td:has(> select:disabled),
td:has(> input:disabled),
td:has(> input:read-only) {
  border-right: 1px solid var(--ev-c-text-2);
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
