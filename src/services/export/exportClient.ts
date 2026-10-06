import { fetchWithResilience } from '../http/fetchWithResilience'
import { INITIATIVE_NAME } from '../../config/initiativeResolver'
import { logger } from '../logging/logger'

export type ExportResponse = {
  requestId: string
  status: 'accepted' | 'error'
}

export const requestExport = async (): Promise<ExportResponse | null> => {
  try {
    const response = await fetchWithResilience('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ initiativeName: INITIATIVE_NAME })
    })

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Export failed')
    return null
  }
}
