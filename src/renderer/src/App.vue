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

  <table v-if="listTasksRefModel.length > 0">
    <tr>
      <th>Tipo</th>
      <th>Título</th>
      <th>Descripción</th>
      <th>Vence</th>
      <th>Recordar ⏰</th>
      <th>Configuración ⚙️</th>
    </tr>
    <tr v-for="(task, task_index) in listTasksRefModel" :key="task_index + task.type">
      <td>
        <select
          :id="task_index + 'f_input_type'"
          v-model="task.type"
          :name="task_index + 'f_input_type'"
          :disabled="!listIndexTasksEditable.includes(task_index)"
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
          v-model="task.title"
          name="f_input_title"
          type="text"
          :readonly="!listIndexTasksEditable.includes(task_index)"
        />
      </td>
      <td>
        <input
          id="f_input_description"
          v-model="task.description"
          name="f_input_description"
          type="text"
          :readonly="!listIndexTasksEditable.includes(task_index)"
        />
      </td>
      <td>
        <input
          id="f_input_special_date"
          v-model="task.specialDate"
          v-date-directive="task.specialDate"
          name="f_input_special_date"
          type="date"
          :readonly="!listIndexTasksEditable.includes(task_index)"
        />
      </td>
      <td>
        <input
          id="f_input_interval_recorder_hours"
          v-model="task.intervalRecorder.hours"
          v-time-directive.hours="task.intervalRecorder.hours"
          style="width: 45px"
          name="f_input_interval_recorder_hours"
          min="0"
          type="number"
          :readonly="!listIndexTasksEditable.includes(task_index)"
        />:
        <input
          id="f_input_interval_recorder_minutes"
          v-model="task.intervalRecorder.minutes"
          v-time-directive.minutes="task.intervalRecorder.minutes"
          style="width: 45px"
          name="f_input_interval_recorder_minutes"
          min="0"
          type="number"
          :readonly="!listIndexTasksEditable.includes(task_index)"
        />:
        <input
          id="f_input_interval_recorder_seconds"
          v-model="task.intervalRecorder.seconds"
          v-time-directive.seconds="task.intervalRecorder.seconds"
          style="width: 45px"
          name="f_input_interval_recorder_seconds"
          min="0"
          type="number"
          :readonly="!listIndexTasksEditable.includes(task_index)"
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
          @click="setToEdit(task_index, task)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_save_changes"
          name="f_input_save_changes"
          type="button"
          style="width: 33%"
          value="✅"
          @click="saveChanges(task_index)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_discarg_changes"
          name="f_input_discarg_changes"
          type="button"
          style="width: 33%"
          value="🚨"
          @click="cancelChanges(task_index)"
        />
        <input
          v-show="listIndexTasksEditable.includes(task_index)"
          id="f_input_delete"
          name="f_input_delete"
          type="button"
          style="width: 33%"
          value="🗑️"
          @click="deleteTask(task_index)"
        />
      </td>
    </tr>
    <tr>
      <td>
        <select id="f_input_type_add" v-model="taskAdd.type" name="f_input_type_add">
          <option
            v-for="(typeEvent, typeEventKey) in TypeReminderEnum"
            :key="'task_index_add' + typeEventKey"
            :value="typeEvent"
          >
            {{ typeEvent }}
          </option>
        </select>
      </td>
      <td>
        <input
          id="f_input_title_add"
          v-model="taskAdd.title"
          name="f_input_title_add"
          type="text"
          required
        />
      </td>
      <td>
        <input
          id="f_input_description_add"
          v-model="taskAdd.description"
          name="f_input_description_add"
          type="text"
        />
      </td>
      <td>
        <input
          id="f_input_special_date_add"
          v-model="taskAdd.specialDate"
          v-date-directive="taskAdd.specialDate"
          name="f_input_special_date_add"
          type="date"
          required
        />
      </td>
      <td>
        <input
          id="f_input_interval_recorder_hours_add"
          v-model="taskAdd.intervalRecorder.hours"
          v-time-directive.hours="taskAdd.intervalRecorder.hours"
          style="width: 45px"
          name="f_input_interval_recorder_hours_add"
          min="0"
          type="number"
          required
        />:
        <input
          id="f_input_interval_recorder_minutes_add"
          v-model="taskAdd.intervalRecorder.minutes"
          v-time-directive.minutes="taskAdd.intervalRecorder.minutes"
          style="width: 45px"
          name="f_input_interval_recorder_minutes_add"
          min="0"
          type="number"
          required
        />:
        <input
          id="f_input_interval_recorder_seconds_add"
          v-model="taskAdd.intervalRecorder.seconds"
          v-time-directive.seconds="taskAdd.intervalRecorder.seconds"
          style="width: 45px"
          name="f_input_interval_recorder_seconds_add"
          min="0"
          type="number"
          required
        />
      </td>
      <td style="border-right: none">
        <input
          id="f_input_add"
          name="f_input_add"
          type="button"
          style="width: 100%"
          value="➕"
          @click="addTask"
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

const vDateDirective = {
  mounted: (el, binding) => {
    el.value = formattedDate(binding.value)
  },
  update: (el, binding) => {
    el.value = formattedDate(binding.value)
  },
  beforeUpdate: (el, binding) => {
    el.value = formattedDate(binding.value)
  }
}
const vTimeDirective = {
  mounted: (el, binding) => {
    if (binding.modifiers.hours) {
      el.value = binding.value
    } else if (binding.modifiers.minutes) {
      el.value = binding.value
    } else if (binding.modifiers.seconds) {
      el.value = binding.value
    }
  },
  beforeUpdate: (el, binding) => {
    if (binding.modifiers.hours) {
      el.value = binding.value
    } else if (binding.modifiers.minutes) {
      el.value = binding.value
    } else if (binding.modifiers.seconds) {
      el.value = binding.value
    }
  }
}

function formattedDate(dateToFormat: string | Date): string {
  const dateParsed = dateToFormat != '' && dateToFormat ? new Date(dateToFormat) : new Date()
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

  return { hours: hoursStr, minutes: minutesStr, seconds: secondsStr }
}

function timeToMilliseconds(hours: number, minutes: number, seconds: number): number {
  const hoursToMs = hours * 60 * 60 * 1000 // 1 hora = 3600000 ms
  const minutesToMs = minutes * 60 * 1000 // 1 minuto = 60000 ms
  const secondsToMs = seconds * 1000 // 1 segundo = 1000 ms

  return hoursToMs + minutesToMs + secondsToMs
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

const listTasksRefModel = ref<TasksInterface[]>([])
const listTasksRefModelCopy = ref<TasksInterface[]>([])
const taskAdd = ref<TasksInterface>({
  type: TypeReminderEnum.EVENT,
  title: '',
  description: undefined,
  specialDate: new Date(),
  intervalRecorder: {
    hours: 0,
    minutes: 0,
    seconds: 0
  }
})
const listIndexTasksEditable: Ref<number[]> = ref([])

function addTask() {
  if (taskAdd.value) {
    listTasksRefModel.value.push(taskAdd.value)
  }
}

function setToEdit(indexTask: number, task: TasksInterface) {
  listIndexTasksEditable.value[indexTask] = indexTask
  listTasksRefModelCopy.value[indexTask] = {
    ...task,
    intervalRecorder: { ...task.intervalRecorder }
  }
}

function saveChanges(indexTask: number) {
  delete listIndexTasksEditable.value[indexTask]
  delete listTasksRefModelCopy.value[indexTask]
}

function cancelChanges(indexTask: number) {
  delete listIndexTasksEditable.value[indexTask]
  listTasksRefModel.value[indexTask] = { ...listTasksRefModelCopy.value[indexTask] }
  delete listTasksRefModelCopy.value[indexTask]
}

function deleteTask(indexTask: number) {
  const cooopy = [...listTasksRefModel.value]
  delete cooopy[indexTask]
  delete listIndexTasksEditable.value[indexTask]
  delete listTasksRefModelCopy.value[indexTask]
  listTasksRefModel.value = cooopy.filter((task) => task != undefined)
}

const listTasksComputed = computed((): TasksInterface[] => {
  return listTasksRefModel.value ?? []
})

function programNotifications() {
  listTasksComputed.value.forEach((task) => {
    const { hours, minutes, seconds } = task.intervalRecorder
    const timeInMilliseconds = timeToMilliseconds(hours, minutes, seconds)
    const timeInterval: number = timeInMilliseconds >= 1000 ? timeInMilliseconds : 1000
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
      intervalRecorder: {
        hours: 1,
        minutes: 0,
        seconds: 0
      }
    },
    {
      type: TypeReminderEnum.SPECIAL_EVENT,
      title: 'Fin jornada laboral 😏',
      description: 'DESCANSARRRR 😎🏖️',
      specialDate: new Date('2024-09-19T18:00:00'),
      intervalRecorder: {
        hours: 0,
        minutes: 59,
        seconds: 0
      }
    },
    {
      type: TypeReminderEnum.SPECIAL_EVENT,
      title: 'Dormir 😴🛌',
      description: 'Ey, hora de ir a mimir💤 🥱️',
      specialDate: new Date('2024-09-19T22:00:00'),
      intervalRecorder: {
        hours: 0,
        minutes: 0,
        seconds: 20
      }
    }
  ]
  setEventsToRecorder(preChargeEvents)
  listTasksRefModel.value = getEventsToRecorder()
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
