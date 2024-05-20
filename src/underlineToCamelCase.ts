export function underlineToCamelCaseWord(wordWithUnderline: string): string {
  return wordWithUnderline.replace(/_([a-z])/g, (match, group: string) => group.toUpperCase())
}

export function underlineToCamelCase(object: any) {
  if (!object) return null
  const camelCaseObject: any = {};
  for (const key of Object.keys(object)) {
    const keyCamelCase = underlineToCamelCaseWord(key)
    const value = object[key]
    camelCaseObject[keyCamelCase] = value
  }
  return camelCaseObject
}

