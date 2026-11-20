// Advent of Code | 2015 | Day 15 | Science for Hungry People
// https://adventofcode.com/2015/day/15

type Ingredients = { [key: string]: { [key: string]: number } }

type IngredientQuantities = { [key: string]: number }

const processData = (data: string[]) => {
  return data.reduce((ingredients, dataRow) => {
    const [name, properties] = dataRow.split(': ')
    ingredients[name] = {}
    properties.split(', ').forEach(property => {
      const [propertyName, value] = property.split(' ')
      ingredients[name][propertyName] = parseInt(value)
    })
    return ingredients
  }, {} as Ingredients)
}

const scoreIngredientList = (ingredients: Ingredients, quantities: IngredientQuantities) => {
  const properties = {
    capacity: 0,
    durability: 0,
    flavor: 0,
    texture: 0,
    calories: 0,
  }
  Object.keys(quantities).forEach(ingredient => {
    const quantity = quantities[ingredient]
    Object.keys(properties).forEach(property => {
      properties[property as keyof typeof properties] += ingredients[ingredient][property] * quantity
    })
  })
  Object.keys(properties).forEach(property => {
    properties[property as keyof typeof properties] = Math.max(0, properties[property as keyof typeof properties])
  })
  const score = Object.keys(properties).reduce((score, property) => {
    return property === 'calories' ? score : score * properties[property as keyof typeof properties]
  }, 1)
  return [score, properties['calories']]
}

// Every way to split `total` teaspoons across the given ingredients, for any number of ingredients
const generateQuantities = (names: string[], total: number): IngredientQuantities[] => {
  const [first, ...rest] = names
  if (!rest.length) {
    return [{ [first]: total }]
  }
  const combinations: IngredientQuantities[] = []
  for (let amount = 0; amount <= total; amount++) {
    generateQuantities(rest, total - amount).forEach(quantities => {
      combinations.push({ [first]: amount, ...quantities })
    })
  }
  return combinations
}

export const partOne = (input: string) => {
  const data = input.split('\n')
  const ingredients = processData(data)
  let maxScore = 0
  let bestIngredients: IngredientQuantities | null = null
  generateQuantities(Object.keys(ingredients), 100).forEach(quantities => {
    const [score, calories] = scoreIngredientList(ingredients, quantities)
    maxScore = Math.max(maxScore, score)
    if (maxScore === score) {
      bestIngredients = quantities
    }
  })
  return maxScore
}

export const partTwo = (input: string) => {
  const data = input.split('\n')
  const ingredients = processData(data)
  let maxScore = 0
  let bestIngredients: IngredientQuantities | null = null
  generateQuantities(Object.keys(ingredients), 100).forEach(quantities => {
    const [score, calories] = scoreIngredientList(ingredients, quantities)
    if (calories === 500) {
      maxScore = Math.max(maxScore, score)
      if (maxScore === score) {
        bestIngredients = quantities
      }
    }
  })
  return maxScore
}
