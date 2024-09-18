export enum TypeReminderEnum {
  TASK = 'Tarea',
  EVENT = 'Evento',
  SPECIAL_EVENT = 'Evento Especial'
}

export interface TasksInterface {
  type: TypeReminderEnum
  title: string
  description?: string
  specialDate: Date
}
