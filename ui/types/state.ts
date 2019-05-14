import { Auth, Common, Page, Story, User } from '~/types'

export interface RootState {
  auth: Auth
  common: Common
  page: Page
  story: Story
  user: User
}
