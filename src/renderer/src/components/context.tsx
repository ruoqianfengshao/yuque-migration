import { createContext, useContext } from 'react'

type ConfigInfo = {
  domain?: string
  token?: string
  value?: string
}

export const ConfigInfoContext = createContext<ConfigInfo>({})
export const ConfigInfoProvider = ConfigInfoContext.Provider

export const useConfigInfoContext = () => {
  return useContext(ConfigInfoContext)
}
