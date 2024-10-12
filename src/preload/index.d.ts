import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getGroups: () => Promise<any>
      getRepos: (groupId: number) => Promise<any>
      downloadRepos: (groupId) => Promise<any>
      saveConfig: (config) => void
    }
  }
}
