export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = error => reject(error)
  })
}

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.replace(/^data:.+;base64,/, "")
}
