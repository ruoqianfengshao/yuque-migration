const fs = require('fs')

export const checkZipSize = (filePath: string) => {
  const fileBuffer = fs.readFileSync(filePath)
  const fileSize = fileBuffer.byteLength / (1024 * 1024 * 1024)
  if (fileSize > 1) {
    return true
  }
  return false
}
