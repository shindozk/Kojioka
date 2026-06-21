export interface ServerStatus {
  serverStatus: 'online' | 'offline'
  uptime: string
  cpu: CpuInfo
  memory: MemoryInfo
  disk: DiskInfo
  songsStorage: StorageInfo
  activeTasks: number
  activeDownloads: number
  memoryLevel: 'normal' | 'warning' | 'critical' | 'emergency'
}

export interface CpuInfo {
  model: string
  cores: number
  hostCores: number
  usage: number
  loadAverage: [number, number, number]
}

export interface MemoryInfo {
  total: string
  used: string
  free: string
}

export interface DiskInfo {
  total: number
  free: number
  used: number
}

export interface StorageInfo {
  count: number
  size: string
}
