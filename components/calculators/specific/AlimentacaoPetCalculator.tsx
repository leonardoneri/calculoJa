"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface AlimentacaoPetCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const alimentacaoPetSchema = z.object({
  petType: z.enum(["dog", "cat"], {
    errorMap: () => ({ message: "Selecione o tipo de animal" }),
  }),
  weight: z.number().positive("O peso deve ser maior que zero"),
  age: z.enum(["puppy", "adult", "senior"], {
    errorMap: () => ({ message: "Selecione a faixa etária" }),
  }),
  activityLevel: z.enum(["low", "moderate", "high"], {
    errorMap: () => ({ message: "Selecione o nível de atividade" }),
  }),
  bodyCondition: z.enum(["underweight", "ideal", "overweight"], {
    errorMap: () => ({ message: "Selecione a condição corporal" }),
  }),
  foodType: z.enum(["dry", "wet", "raw"], {
    errorMap: () => ({ message: "Selecione o tipo de alimento" }),
  }),
  foodCalories: z.number().positive("As calorias por 100g devem ser maiores que zero").optional(),
})

export default function AlimentacaoPetCalculator({
  onInputChange,
  onCalculate,
  config,
}: AlimentacaoPetCalculatorProps) {
  const [petType, setPetType] = useState<string>("dog")
  const [weight, setWeight] = useState<string>("")
  const [age, setAge] = useState<string>("adult")
  const [activityLevel, setActivityLevel] = useState<string>("moderate")
  const [bodyCondition, setBodyCondition] = useState<string>("ideal")
  const [foodType, setFoodType] = useState<string>("dry")
  const [foodCalories, setFoodCalories] = useState<string>("")
  const [useCustomCalories, setUseCustomCalories] = useState<boolean>(false)
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const weightNum = Number.parseFloat(weight)
      const foodCaloriesNum = useCustomCalories ? Number.parseFloat(foodCalories) : undefined

      if (useCustomCalories && (!foodCalories || isNaN(foodCaloriesNum!) || foodCaloriesNum! <= 0)) {
        setErrors({
          foodCalories: "As calorias por 100g devem ser um número maior que zero",
        })
        return null
      }

      alimentacaoPetSchema.parse({
        petType,
        weight: weightNum,
        age,
        activityLevel,
        bodyCondition,
        foodType,
        foodCalories: foodCaloriesNum,
      })

      setErrors({})
      return { weightNum, foodCaloriesNum }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return null
    }
  }

  const calculateFeedingAmount = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const { weightNum, foodCaloriesNum } = validatedInput

    // Base calorie needs per kg of body weight
    const baseCaloriesPerKg = 0

    // Calculate Resting Energy Requirement (RER)
    // RER = 70 * (body weight in kg)^0.75
    const rer = 70 * Math.pow(weightNum, 0.75)

    // Calculate Daily Energy Requirement (DER) based on pet type, age, and activity level
    let der = rer
    let derMultiplier = 1

    if (petType === "dog") {
      // Multipliers for dogs
      if (age === "puppy") {
        derMultiplier = 3.0 // Puppies need more energy
      } else if (age === "adult") {
        if (activityLevel === "low") {
          derMultiplier = 1.2
        } else if (activityLevel === "moderate") {
          derMultiplier = 1.4
        } else {
          // high activity
          derMultiplier = 1.7
        }
      } else {
        // senior
        derMultiplier = 1.1
      }
    } else {
      // Multipliers for cats
      if (age === "puppy") {
        // Kittens
        derMultiplier = 2.5
      } else if (age === "adult") {
        if (activityLevel === "low") {
          derMultiplier = 1.1
        } else if (activityLevel === "moderate") {
          derMultiplier = 1.2
        } else {
          // high activity
          derMultiplier = 1.4
        }
      } else {
        // senior
        derMultiplier = 1.0
      }
    }

    // Adjust for body condition
    if (bodyCondition === "underweight") {
      derMultiplier *= 1.2 // Increase for weight gain
    } else if (bodyCondition === "overweight") {
      derMultiplier *= 0.8 // Decrease for weight loss
    }

    der = rer * derMultiplier

    // Default calorie content per 100g of food if not provided
    let caloriesPerHundredGrams = foodCaloriesNum || 0

    if (!useCustomCalories) {
      if (petType === "dog") {
        if (foodType === "dry") {
          caloriesPerHundredGrams = 350 // Average calories in 100g of dry dog food
        } else if (foodType === "wet") {
          caloriesPerHundredGrams = 100 // Average calories in 100g of wet dog food
        } else {
          // raw
          caloriesPerHundredGrams = 150 // Average calories in 100g of raw dog food
        }
      } else {
        // Cat food
        if (foodType === "dry") {
          caloriesPerHundredGrams = 380 // Average calories in 100g of dry cat food
        } else if (foodType === "wet") {
          caloriesPerHundredGrams = 90 // Average calories in 100g of wet cat food
        } else {
          // raw
          caloriesPerHundredGrams = 140 // Average calories in 100g of raw cat food
        }
      }
    }

    // Calculate daily feeding amount in grams
    const dailyFeedingGrams = (der / caloriesPerHundredGrams) * 100

    // Calculate daily feeding amount in cups (for dry food)
    // Approximate conversion: 1 cup of dry food = ~100g
    const dailyFeedingCups = foodType === "dry" ? dailyFeedingGrams / 100 : null

    // Calculate meals per day based on age
    let mealsPerDay = 2 // Default for adult
    if (age === "puppy") {
      mealsPerDay = petType === "dog" ? 3 : 4 // Puppies/kittens need more frequent meals
    } else if (age === "senior") {
      mealsPerDay = 2 // Seniors typically eat 2 meals
    }

    // Calculate amount per meal
    const gramsPerMeal = dailyFeedingGrams / mealsPerDay
    const cupsPerMeal = dailyFeedingCups ? dailyFeedingCups / mealsPerDay : null

    // Water needs (ml per day)
    // Approximate: 50-70ml per kg of body weight
    const waterNeeds = weightNum * 60

    const calculationResult = {
      petType,
      weight: weightNum,
      age,
      activityLevel,
      bodyCondition,
      foodType,
      caloriesPerHundredGrams,
      rer: Math.round(rer),
      der: Math.round(der),
      derMultiplier,
      dailyFeedingGrams: Math.round(dailyFeedingGrams),
      dailyFeedingCups: dailyFeedingCups ? Number.parseFloat(dailyFeedingCups.toFixed(2)) : null,
      mealsPerDay,
      gramsPerMeal: Math.round(gramsPerMeal),
      cupsPerMeal: cupsPerMeal ? Number.parseFloat(cupsPerMeal.toFixed(2)) : null,
      waterNeeds: Math.round(waterNeeds),
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("petType", petType)
    onInputChange("weight", weightNum)
    onInputChange("age", age)
    onInputChange("activityLevel", activityLevel)
    onInputChange("bodyCondition", bodyCondition)
    onInputChange("foodType", foodType)
    onInputChange("foodCalories", caloriesPerHundredGrams)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (weight) {
      const weightNum = Number.parseFloat(weight)
      const foodCaloriesNum = useCustomCalories ? Number.parseFloat(foodCalories) : undefined

      if (
        !isNaN(weightNum) &&
        weightNum > 0 &&
        (!useCustomCalories || (foodCaloriesNum && !isNaN(foodCaloriesNum) && foodCaloriesNum > 0))
      ) {
        calculateFeedingAmount()
      }
    }
  }, [petType, weight, age, activityLevel, bodyCondition, foodType, foodCalories, useCustomCalories])

  // Get labels for display
  const getPetTypeLabel = (type: string): string => {
    return type === "dog" ? "Cão" : "Gato"
  }

  const getAgeLabel = (ageValue: string): string => {
    switch (ageValue) {
      case "puppy":
        return petType === "dog" ? "Filhote (até 1 ano)" : "Filhote (até 1 ano)"
      case "adult":
        return petType === "dog" ? "Adulto (1-7 anos)" : "Adulto (1-10 anos)"
      case "senior":
        return petType === "dog" ? "Sênior (8+ anos)" : "Sênior (11+ anos)"
      default:
        return ""
    }
  }

  const getActivityLevelLabel = (level: string): string => {
    switch (level) {
      case "low":
        return "Baixa (sedentário, pouco exercício)"
      case "moderate":
        return "Moderada (passeios regulares)"
      case "high":
        return "Alta (muito ativo, exercício intenso)"
      default:
        return ""
    }
  }

  const getBodyConditionLabel = (condition: string): string => {
    switch (condition) {
      case "underweight":
        return "Abaixo do peso"
      case "ideal":
        return "Peso ideal"
      case "overweight":
        return "Acima do peso"
      default:
        return ""
    }
  }

  const getFoodTypeLabel = (type: string): string => {
    switch (type) {
      case "dry":
        return "Ração seca"
      case "wet":
        return "Ração úmida"
      case "raw":
        return "Alimentação natural/crua"
      default:
        return ""
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="petType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Animal
          </label>
          <select
            id="petType"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            className="calculator-input"
          >
            <option value="dog">Cão</option>
            <option value="cat">Gato</option>
          </select>
          {errors.petType && <p className="text-red-500 text-sm mt-1">{errors.petType}</p>}
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
            Peso (kg)
          </label>
          <input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 10"
            className="calculator-input"
            min="0.1"
            step="0.1"
          />
          {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Faixa Etária
          </label>
          <select id="age" value={age} onChange={(e) => setAge(e.target.value)} className="calculator-input">
            <option value="puppy">{petType === "dog" ? "Filhote (até 1 ano)" : "Filhote (até 1 ano)"}</option>
            <option value="adult">{petType === "dog" ? "Adulto (1-7 anos)" : "Adulto (1-10 anos)"}</option>
            <option value="senior">{petType === "dog" ? "Sênior (8+ anos)" : "Sênior (11+ anos)"}</option>
          </select>
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Nível de Atividade
          </label>
          <select
            id="activityLevel"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="calculator-input"
          >
            <option value="low">Baixa (sedentário, pouco exercício)</option>
            <option value="moderate">Moderada (passeios regulares)</option>
            <option value="high">Alta (muito ativo, exercício intenso)</option>
          </select>
          {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel}</p>}
        </div>

        <div>
          <label htmlFor="bodyCondition" className="block text-sm font-medium text-gray-700 mb-1">
            Condição Corporal
          </label>
          <select
            id="bodyCondition"
            value={bodyCondition}
            onChange={(e) => setBodyCondition(e.target.value)}
            className="calculator-input"
          >
            <option value="underweight">Abaixo do peso</option>
            <option value="ideal">Peso ideal</option>
            <option value="overweight">Acima do peso</option>
          </select>
          {errors.bodyCondition && <p className="text-red-500 text-sm mt-1">{errors.bodyCondition}</p>}
        </div>

        <div>
          <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Alimento
          </label>
          <select
            id="foodType"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="calculator-input"
          >
            <option value="dry">Ração seca</option>
            <option value="wet">Ração úmida</option>
            <option value="raw">Alimentação natural/crua</option>
          </select>
          {errors.foodType && <p className="text-red-500 text-sm mt-1">{errors.foodType}</p>}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center mb-2">
            <input
              id="useCustomCalories"
              type="checkbox"
              checked={useCustomCalories}
              onChange={(e) => setUseCustomCalories(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useCustomCalories" className="ml-2 block text-sm text-gray-700">
              Usar valor calórico personalizado
            </label>
          </div>

          {useCustomCalories && (
            <div>
              <label htmlFor="foodCalories" className="block text-sm font-medium text-gray-700 mb-1">
                Calorias por 100g de alimento
              </label>
              <input
                id="foodCalories"
                type="number"
                value={foodCalories}
                onChange={(e) => setFoodCalories(e.target.value)}
                placeholder="Ex: 350"
                className="calculator-input"
                min="1"
                step="1"
              />
              {errors.foodCalories && <p className="text-red-500 text-sm mt-1">{errors.foodCalories}</p>}
            </div>
          )}
        </div>
      </div>

      <button onClick={calculateFeedingAmount} className="calculator-button">
        Calcular Quantidade de Alimento
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="bg-blue-50 p-6 rounded-md border border-blue-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Quantidade Diária</p>
                <p className="text-3xl font-bold text-blue-700">{result.dailyFeedingGrams}g</p>
                {result.dailyFeedingCups && (
                  <p className="text-sm text-gray-500 mt-1">
                    Aproximadamente {result.dailyFeedingCups} xícaras por dia
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Por Refeição</p>
                <p className="text-3xl font-bold text-green-700">{result.gramsPerMeal}g</p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.mealsPerDay} refeições por dia
                  {result.cupsPerMeal && ` (${result.cupsPerMeal} xícaras por refeição)`}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Necessidade de Água</p>
                <p className="text-3xl font-bold text-purple-700">{result.waterNeeds}ml</p>
                <p className="text-sm text-gray-500 mt-1">Água fresca diariamente</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">Detalhes do Cálculo:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Necessidade Energética em Repouso (RER):</span> {result.rer} kcal/dia
                </li>
                <li>
                  <span className="font-medium">Necessidade Energética Diária (DER):</span> {result.der} kcal/dia
                </li>
                <li>
                  <span className="font-medium">Multiplicador utilizado:</span> {result.derMultiplier.toFixed(2)}x
                </li>
                <li>
                  <span className="font-medium">Valor calórico do alimento:</span> {result.caloriesPerHundredGrams}{" "}
                  kcal/100g
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h4 className="font-medium mb-2">Informações do Pet:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Tipo:</span> {getPetTypeLabel(result.petType)}
                </li>
                <li>
                  <span className="font-medium">Peso:</span> {result.weight} kg
                </li>
                <li>
                  <span className="font-medium">Faixa etária:</span> {getAgeLabel(result.age)}
                </li>
                <li>
                  <span className="font-medium">Nível de atividade:</span> {getActivityLevelLabel(result.activityLevel)}
                </li>
                <li>
                  <span className="font-medium">Condição corporal:</span> {getBodyConditionLabel(result.bodyCondition)}
                </li>
                <li>
                  <span className="font-medium">Tipo de alimento:</span> {getFoodTypeLabel(result.foodType)}
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Dicas de Alimentação</p>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>
                Divida a quantidade diária em {result.mealsPerDay} refeições ({result.gramsPerMeal}g por refeição).
              </li>
              <li>Mantenha horários regulares para alimentação.</li>
              <li>Sempre disponibilize água fresca e limpa (aproximadamente {result.waterNeeds}ml por dia).</li>
              <li>
                Monitore o peso e a condição corporal do seu pet e ajuste a quantidade de alimento conforme necessário.
              </li>
              <li>Introduza mudanças na dieta gradualmente ao longo de 7-10 dias para evitar problemas digestivos.</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Aviso Importante</p>
            <p className="text-sm text-yellow-700">
              Esta calculadora fornece apenas uma estimativa. As necessidades nutricionais individuais podem variar com
              base em fatores como raça, estado de saúde, ambiente e nível de atividade específico. Consulte sempre um
              médico veterinário para recomendações personalizadas sobre a alimentação do seu pet.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
