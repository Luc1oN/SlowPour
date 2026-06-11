import { useState } from 'react'

const KEY = 'whiskey_night_user_name'

export function useUserName() {
  const [userName, setUserNameState] = useState(() => localStorage.getItem(KEY) || '')

  const saveName = (name) => {
    localStorage.setItem(KEY, name)
    setUserNameState(name)
  }

  return { userName, saveName }
}
