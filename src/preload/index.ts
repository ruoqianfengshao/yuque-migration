import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getGroups: (): Promise<any> => ipcRenderer.invoke('getGroups'),
  getRepos: (groupId: number): Promise<any> => ipcRenderer.invoke('getRepos', groupId),
  downloadRepos: (repoUrl: string): Promise<any> => ipcRenderer.invoke('downloadRepos', repoUrl),
  saveConfig: (config: any): Promise<void> => ipcRenderer.invoke('saveConfig', config),
  getConfig: (): Promise<void> => ipcRenderer.invoke('getConfig'),
  importBook: (props: any): Promise<any> => ipcRenderer.invoke('importBook', props)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
