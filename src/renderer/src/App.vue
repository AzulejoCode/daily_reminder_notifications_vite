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
    <tr v-for="task in listTasksComputed">
      <td>{{ task.type }}</td>
      <td>{{ task.title }}</td>
      <td>{{ task.description }}</td>
      <td><input type="date" readonly :value="formattedDate(task.specialDate)" /></td>
      <td>Pronto</td>
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
</style>
