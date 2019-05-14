export * from './state'

export interface Auth {
  uid?: string | undefined
  // unsubscribeAuthObserver: firebase.Unsubscribe;
  unsubscribeAuthObserver?: any | null
}

export interface Common {
  sidebar: Sidebar
  title: string
  layout: string
  dialog: Dialog
  snackbar: Snackbar
  error: Error
}

export interface Sidebar {
  visible: boolean
}

export interface Dialog {
  visible: boolean
  text: string
}

export interface Snackbar {
  visible: boolean
  text: string
  timeout: number
  color: string
}

export interface Error {
  code?: string
  level?: number
  message: string
}

export interface Page {
  pages: string[]
}

// todo refactor to have story wrapper + story interface
export interface Story {
  story: any
}

// todo refactor to have user wrapper + user interface
export interface User {
  user: any
}
