import { createContext, useContext } from 'react'

type ConfigInfo = {
  domain?: string
  token?: string
  value?: string
}

const defaultConfig = await window.api.getConfig()
export const ConfigInfoContext = createContext<ConfigInfo>(defaultConfig)
export const ConfigInfoProvider = ConfigInfoContext.Provider

export const useConfigInfoContext = () => {
  return useContext(ConfigInfoContext)
}
