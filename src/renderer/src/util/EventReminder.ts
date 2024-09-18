export enum TypeReminderEnum {
  TASK = 'Tarea',
  EVENT = 'Evento'
}

export interface TasksInterface {
  type: TypeReminderEnum
  title: string
  description?: string
  specialDate: Date
}
