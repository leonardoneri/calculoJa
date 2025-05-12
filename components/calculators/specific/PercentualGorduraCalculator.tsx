"use client"

import { useState, useEffect } from "react"
import { z } from "zod"

interface PercentualGorduraCalculatorProps {
  onInputChange: (name: string, value: any) => void
  onCalculate: (result: any) => void
  config: any
}

const percentualGorduraSchema = z.object({
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),
  age: z
    .number()
    .int()
    .positive("A idade deve ser um número inteiro positivo")
    .max(120, "A idade deve ser menor que 120"),
  height: z.number().positive("A altura deve ser maior que zero"),
  weight: z.number().positive("O peso deve ser maior que zero"),
  method: z.enum(["navy", "bmi", "skinfold"], {
    errorMap: () => ({ message: "Selecione o método de cálculo" }),
  }),
  waist: z.number().positive("A circunferência da cintura deve ser maior que zero").optional(),
  neck: z.number().positive("A circunferência do pescoço deve ser maior que zero").optional(),
  hip: z.number().positive("A circunferência do quadril deve ser maior que zero").optional(),
  triceps: z.number().nonnegative("A dobra cutânea do tríceps deve ser maior ou igual a zero").optional(),
  subscapular: z.number().nonnegative("A dobra cutânea subescapular deve ser maior ou igual a zero").optional(),
  suprailiac: z.number().nonnegative("A dobra cutânea suprailíaca deve ser maior ou igual a zero").optional(),
  abdominal: z.number().nonnegative("A dobra cutânea abdominal deve ser maior ou igual a zero").optional(),
  thigh: z.number().nonnegative("A dobra cutânea da coxa deve ser maior ou igual a zero").optional(),
})

export default function PercentualGorduraCalculator({
  onInputChange,
  onCalculate,
  config,
}: PercentualGorduraCalculatorProps) {
  const [gender, setGender] = useState<string>("male")
  const [age, setAge] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [method, setMethod] = useState<string>("navy")
  const [waist, setWaist] = useState<string>("")
  const [neck, setNeck] = useState<string>("")
  const [hip, setHip] = useState<string>("")
  const [triceps, setTriceps] = useState<string>("")
  const [subscapular, setSubscapular] = useState<string>("")
  const [suprailiac, setSuprailiac] = useState<string>("")
  const [abdominal, setAbdominal] = useState<string>("")
  const [thigh, setThigh] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    try {
      const ageNum = Number.parseInt(age)
      const heightNum = Number.parseFloat(height)
      const weightNum = Number.parseFloat(weight)
      const waistNum = waist ? Number.parseFloat(waist) : undefined
      const neckNum = neck ? Number.parseFloat(neck) : undefined
      const hipNum = hip ? Number.parseFloat(hip) : undefined
      const tricepsNum = triceps ? Number.parseFloat(triceps) : undefined
      const subscapularNum = subscapular ? Number.parseFloat(subscapular) : undefined
      const suprailiacNum = suprailiac ? Number.parseFloat(suprailiac) : undefined
      const abdominalNum = abdominal ? Number.parseFloat(abdominal) : undefined
      const thighNum = thigh ? Number.parseFloat(thigh) : undefined

      // Method-specific validation
      if (method === "navy" && (!waistNum || !neckNum || (gender === "female" && !hipNum))) {
        const newErrors: Record<string, string> = {}
        if (!waistNum) newErrors.waist = "A circunferência da cintura é obrigatória para o método da Marinha"
        if (!neckNum) newErrors.neck = "A circunferência do pescoço é obrigatória para o método da Marinha"
        if (gender === "female" && !hipNum)
          newErrors.hip = "A circunferência do quadril é obrigatória para mulheres no método da Marinha"
        setErrors(newErrors)
        return null
      }

      if (method === "skinfold" && (!tricepsNum || !subscapularNum || !suprailiacNum || !abdominalNum || !thighNum)) {
        const newErrors: Record<string, string> = {}
        if (!tricepsNum) newErrors.triceps = "A dobra cutânea do tríceps é obrigatória para o método de dobras cutâneas"
        if (!subscapularNum)
          newErrors.subscapular = "A dobra cutânea subescapular é obrigatória para o método de dobras cutâneas"
        if (!suprailiacNum)
          newErrors.suprailiac = "A dobra cutânea suprailíaca é obrigatória para o método de dobras cutâneas"
        if (!abdominalNum)
          newErrors.abdominal = "A dobra cutânea abdominal é obrigatória para o método de dobras cutâneas"
        if (!thighNum) newErrors.thigh = "A dobra cutânea da coxa é obrigatória para o método de dobras cutâneas"
        setErrors(newErrors)
        return null
      }

      percentualGorduraSchema.parse({
        gender,
        age: ageNum,
        height: heightNum,
        weight: weightNum,
        method,
        waist: waistNum,
        neck: neckNum,
        hip: hipNum,
        triceps: tricepsNum,
        subscapular: subscapularNum,
        suprailiac: suprailiacNum,
        abdominal: abdominalNum,
        thigh: thighNum,
      })

      setErrors({})
      return {
        ageNum,
        heightNum,
        weightNum,
        waistNum,
        neckNum,
        hipNum,
        tricepsNum,
        subscapularNum,
        suprailiacNum,
        abdominalNum,
        thighNum,
      }
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

  const calculateBodyFat = () => {
    const validatedInput = validateInput()
    if (!validatedInput) return

    const {
      ageNum,
      heightNum,
      weightNum,
      waistNum,
      neckNum,
      hipNum,
      tricepsNum,
      subscapularNum,
      suprailiacNum,
      abdominalNum,
      thighNum,
    } = validatedInput

    let bodyFatPercentage = 0
    let fatMass = 0
    let leanMass = 0
    let category = ""
    let methodDescription = ""

    // Calculate body fat percentage based on selected method
    if (method === "navy") {
      // Navy Method (US Navy Circumference Method)
      methodDescription = "Método da Circunferência (Marinha dos EUA)"
      if (gender === "male") {
        // For men: %BF = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        bodyFatPercentage =
          495 / (1.0324 - 0.19077 * Math.log10(waistNum! - neckNum!) + 0.15456 * Math.log10(heightNum)) - 450
      } else {
        // For women: %BF = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
        bodyFatPercentage =
          495 / (1.29579 - 0.35004 * Math.log10(waistNum! + hipNum! - neckNum!) + 0.221 * Math.log10(heightNum)) - 450
      }
    } else if (method === "bmi") {
      // BMI Method (Deurenberg equation)
      methodDescription = "Método do IMC (Equação de Deurenberg)"
      const bmi = weightNum / ((heightNum / 100) * (heightNum / 100))
      if (gender === "male") {
        // For men: %BF = (1.20 * BMI) + (0.23 * Age) - (10.8 * 1) - 5.4
        bodyFatPercentage = 1.2 * bmi + 0.23 * ageNum - 10.8 - 5.4
      } else {
        // For women: %BF = (1.20 * BMI) + (0.23 * Age) - (10.8 * 0) - 5.4
        bodyFatPercentage = 1.2 * bmi + 0.23 * ageNum - 5.4
      }
    } else if (method === "skinfold") {
      // Skinfold Method (Jackson-Pollock 7-site formula)
      methodDescription = "Método de Dobras Cutâneas (Jackson-Pollock)"
      // Sum of 5 skinfolds
      const sumOfSkinfolds = tricepsNum! + subscapularNum! + suprailiacNum! + abdominalNum! + thighNum!

      if (gender === "male") {
        // For men (simplified equation)
        bodyFatPercentage = 0.29288 * sumOfSkinfolds - 0.0005 * Math.pow(sumOfSkinfolds, 2) + 0.15845 * ageNum - 5.76377
      } else {
        // For women (simplified equation)
        bodyFatPercentage = 0.29669 * sumOfSkinfolds - 0.00043 * Math.pow(sumOfSkinfolds, 2) + 0.02963 * ageNum + 1.4072
      }
    }

    // Ensure body fat percentage is within reasonable limits
    bodyFatPercentage = Math.max(2, Math.min(bodyFatPercentage, 60))

    // Calculate fat mass and lean mass
    fatMass = (bodyFatPercentage / 100) * weightNum
    leanMass = weightNum - fatMass

    // Determine category based on gender and body fat percentage
    if (gender === "male") {
      if (bodyFatPercentage < 6) category = "Essencial"
      else if (bodyFatPercentage < 14) category = "Atlético"
      else if (bodyFatPercentage < 18) category = "Fitness"
      else if (bodyFatPercentage < 25) category = "Aceitável"
      else category = "Obesidade"
    } else {
      if (bodyFatPercentage < 14) category = "Essencial"
      else if (bodyFatPercentage < 21) category = "Atlético"
      else if (bodyFatPercentage < 25) category = "Fitness"
      else if (bodyFatPercentage < 32) category = "Aceitável"
      else category = "Obesidade"
    }

    const calculationResult = {
      gender,
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      method,
      methodDescription,
      bodyFatPercentage: Number.parseFloat(bodyFatPercentage.toFixed(config?.decimalPlaces || 1)),
      fatMass: Number.parseFloat(fatMass.toFixed(1)),
      leanMass: Number.parseFloat(leanMass.toFixed(1)),
      category,
    }

    setResult(calculationResult)

    // Call parent callbacks
    onInputChange("gender", gender)
    onInputChange("age", ageNum)
    onInputChange("height", heightNum)
    onInputChange("weight", weightNum)
    onInputChange("method", method)
    onCalculate(calculationResult)
  }

  // Calculate automatically when inputs change
  useEffect(() => {
    if (age && height && weight) {
      const ageNum = Number.parseInt(age)
      const heightNum = Number.parseFloat(height)
      const weightNum = Number.parseFloat(weight)

      if (
        !isNaN(ageNum) &&
        !isNaN(heightNum) &&
        !isNaN(weightNum) &&
        ageNum > 0 &&
        ageNum <= 120 &&
        heightNum > 0 &&
        weightNum > 0
      ) {
        // For Navy method, check if we have all required measurements
        if (
          method === "navy" &&
          waist &&
          neck &&
          (gender === "male" || (gender === "female" && hip)) &&
          !isNaN(Number.parseFloat(waist)) &&
          !isNaN(Number.parseFloat(neck)) &&
          (gender === "male" || (gender === "female" && !isNaN(Number.parseFloat(hip))))
        ) {
          calculateBodyFat()
        }
        // For BMI method, we already have all we need
        else if (method === "bmi") {
          calculateBodyFat()
        }
        // For Skinfold method, check if we have all required measurements
        else if (
          method === "skinfold" &&
          triceps &&
          subscapular &&
          suprailiac &&
          abdominal &&
          thigh &&
          !isNaN(Number.parseFloat(triceps)) &&
          !isNaN(Number.parseFloat(subscapular)) &&
          !isNaN(Number.parseFloat(suprailiac)) &&
          !isNaN(Number.parseFloat(abdominal)) &&
          !isNaN(Number.parseFloat(thigh))
        ) {
          calculateBodyFat()
        }
      }
    }
  }, [gender, age, height, weight, method, waist, neck, hip, triceps, subscapular, suprailiac, abdominal, thigh])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="calculator-input">
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Idade (anos)
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ex: 30"
            className="calculator-input"
            min="1"
            max="120"
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
            Método de Cálculo
          </label>
          <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className="calculator-input">
            <option value="navy">Circunferência (Marinha dos EUA)</option>
            <option value="bmi">IMC (Índice de Massa Corporal)</option>
            <option value="skinfold">Dobras Cutâneas</option>
          </select>
          {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method}</p>}
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 170"
            className="calculator-input"
            min="1"
            step="0.1"
          />
          {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
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
            placeholder="Ex: 70"
            className="calculator-input"
            min="1"
            step="0.1"
          />
          {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
        </div>
      </div>

      {/* Navy Method Fields */}
      {method === "navy" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 md:col-span-3">Medidas para o Método da Circunferência:</h3>
          <div>
            <label htmlFor="neck" className="block text-sm font-medium text-gray-700 mb-1">
              Circunferência do Pescoço (cm)
            </label>
            <input
              id="neck"
              type="number"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              placeholder="Ex: 35"
              className="calculator-input"
              min="1"
              step="0.1"
            />
            {errors.neck && <p className="text-red-500 text-sm mt-1">{errors.neck}</p>}
          </div>

          <div>
            <label htmlFor="waist" className="block text-sm font-medium text-gray-700 mb-1">
              Circunferência da Cintura (cm)
            </label>
            <input
              id="waist"
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="Ex: 80"
              className="calculator-input"
              min="1"
              step="0.1"
            />
            {errors.waist && <p className="text-red-500 text-sm mt-1">{errors.waist}</p>}
          </div>

          {gender === "female" && (
            <div>
              <label htmlFor="hip" className="block text-sm font-medium text-gray-700 mb-1">
                Circunferência do Quadril (cm)
              </label>
              <input
                id="hip"
                type="number"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                placeholder="Ex: 100"
                className="calculator-input"
                min="1"
                step="0.1"
              />
              {errors.hip && <p className="text-red-500 text-sm mt-1">{errors.hip}</p>}
            </div>
          )}
        </div>
      )}

      {/* Skinfold Method Fields */}
      {method === "skinfold" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800 md:col-span-3">
            Medidas para o Método de Dobras Cutâneas:
          </h3>
          <div>
            <label htmlFor="triceps" className="block text-sm font-medium text-gray-700 mb-1">
              Dobra Cutânea do Tríceps (mm)
            </label>
            <input
              id="triceps"
              type="number"
              value={triceps}
              onChange={(e) => setTriceps(e.target.value)}
              placeholder="Ex: 15"
              className="calculator-input"
              min="0"
              step="0.1"
            />
            {errors.triceps && <p className="text-red-500 text-sm mt-1">{errors.triceps}</p>}
          </div>

          <div>
            <label htmlFor="subscapular" className="block text-sm font-medium text-gray-700 mb-1">
              Dobra Cutânea Subescapular (mm)
            </label>
            <input
              id="subscapular"
              type="number"
              value={subscapular}
              onChange={(e) => setSubscapular(e.target.value)}
              placeholder="Ex: 17"
              className="calculator-input"
              min="0"
              step="0.1"
            />
            {errors.subscapular && <p className="text-red-500 text-sm mt-1">{errors.subscapular}</p>}
          </div>

          <div>
            <label htmlFor="suprailiac" className="block text-sm font-medium text-gray-700 mb-1">
              Dobra Cutânea Suprailíaca (mm)
            </label>
            <input
              id="suprailiac"
              type="number"
              value={suprailiac}
              onChange={(e) => setSuprailiac(e.target.value)}
              placeholder="Ex: 18"
              className="calculator-input"
              min="0"
              step="0.1"
            />
            {errors.suprailiac && <p className="text-red-500 text-sm mt-1">{errors.suprailiac}</p>}
          </div>

          <div>
            <label htmlFor="abdominal" className="block text-sm font-medium text-gray-700 mb-1">
              Dobra Cutânea Abdominal (mm)
            </label>
            <input
              id="abdominal"
              type="number"
              value={abdominal}
              onChange={(e) => setAbdominal(e.target.value)}
              placeholder="Ex: 20"
              className="calculator-input"
              min="0"
              step="0.1"
            />
            {errors.abdominal && <p className="text-red-500 text-sm mt-1">{errors.abdominal}</p>}
          </div>

          <div>
            <label htmlFor="thigh" className="block text-sm font-medium text-gray-700 mb-1">
              Dobra Cutânea da Coxa (mm)
            </label>
            <input
              id="thigh"
              type="number"
              value={thigh}
              onChange={(e) => setThigh(e.target.value)}
              placeholder="Ex: 22"
              className="calculator-input"
              min="0"
              step="0.1"
            />
            {errors.thigh && <p className="text-red-500 text-sm mt-1">{errors.thigh}</p>}
          </div>
        </div>
      )}

      <button onClick={calculateBodyFat} className="calculator-button">
        Calcular Percentual de Gordura
      </button>

      {result && (
        <div className="calculator-result">
          <h3 className="text-lg font-semibold mb-4">Resultado:</h3>

          <div className="bg-blue-50 p-6 rounded-md border border-blue-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-gray-600 mb-1">Percentual de Gordura Corporal</p>
                <p className="text-3xl font-bold text-blue-700">
                  {result.bodyFatPercentage}
                  <span className="text-xl">%</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Categoria: {result.category}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-blue-200 flex items-center justify-center bg-white">
                  <div
                    className="rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(100, result.bodyFatPercentage * 0.8)}%`,
                      height: `${Math.min(100, result.bodyFatPercentage * 0.8)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{result.methodDescription}</p>
              </div>

              <div className="text-center md:text-right mt-4 md:mt-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Massa Gorda</p>
                    <p className="text-lg font-semibold text-red-600">{result.fatMass} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Massa Magra</p>
                    <p className="text-lg font-semibold text-green-600">{result.leanMass} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-medium mb-2">Interpretação do Resultado:</h4>
              <p className="text-sm text-gray-600 mb-2">
                Seu percentual de gordura corporal de <strong>{result.bodyFatPercentage}%</strong> está na categoria{" "}
                <strong>{result.category}</strong>.
              </p>
              {result.category === "Essencial" && (
                <p className="text-sm text-gray-600">
                  Este é o nível mínimo de gordura necessário para funções fisiológicas básicas. Manter-se neste nível
                  por longos períodos pode afetar a saúde.
                </p>
              )}
              {result.category === "Atlético" && (
                <p className="text-sm text-gray-600">
                  Este nível é típico de atletas e pessoas com alto nível de condicionamento físico. Apresenta definição
                  muscular visível.
                </p>
              )}
              {result.category === "Fitness" && (
                <p className="text-sm text-gray-600">
                  Este nível indica boa forma física, com alguma definição muscular e níveis saudáveis de gordura.
                </p>
              )}
              {result.category === "Aceitável" && (
                <p className="text-sm text-gray-600">
                  Este nível é considerado saudável para a maioria das pessoas e está dentro da faixa recomendada.
                </p>
              )}
              {result.category === "Obesidade" && (
                <p className="text-sm text-gray-600">
                  Este nível indica excesso de gordura corporal, o que pode aumentar o risco de problemas de saúde como
                  doenças cardíacas, diabetes e hipertensão.
                </p>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <h4 className="font-medium mb-2">Faixas de Referência:</h4>
              <div className="text-sm">
                {gender === "male" ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Categoria</th>
                        <th className="text-right py-1">Homens</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1">Essencial</td>
                        <td className="text-right py-1">2-5%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Atlético</td>
                        <td className="text-right py-1">6-13%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Fitness</td>
                        <td className="text-right py-1">14-17%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Aceitável</td>
                        <td className="text-right py-1">18-24%</td>
                      </tr>
                      <tr>
                        <td className="py-1">Obesidade</td>
                        <td className="text-right py-1">≥25%</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Categoria</th>
                        <th className="text-right py-1">Mulheres</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1">Essencial</td>
                        <td className="text-right py-1">10-13%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Atlético</td>
                        <td className="text-right py-1">14-20%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Fitness</td>
                        <td className="text-right py-1">21-24%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1">Aceitável</td>
                        <td className="text-right py-1">25-31%</td>
                      </tr>
                      <tr>
                        <td className="py-1">Obesidade</td>
                        <td className="text-right py-1">≥32%</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-2">💡 Sobre o Método Utilizado</p>
            <p className="text-sm text-blue-700 mb-2">
              {result.methodDescription === "Método da Circunferência (Marinha dos EUA)" && (
                <>
                  O método da Marinha dos EUA utiliza medidas de circunferência corporal para estimar o percentual de
                  gordura. É um método prático e acessível, com precisão moderada.
                </>
              )}
              {result.methodDescription === "Método do IMC (Equação de Deurenberg)" && (
                <>
                  Este método utiliza o IMC junto com idade e sexo para estimar o percentual de gordura. É menos preciso
                  que outros métodos, mas serve como referência inicial.
                </>
              )}
              {result.methodDescription === "Método de Dobras Cutâneas (Jackson-Pollock)" && (
                <>
                  O método de dobras cutâneas mede a espessura do tecido adiposo subcutâneo em pontos específicos do
                  corpo. É relativamente preciso quando realizado corretamente.
                </>
              )}
            </p>
            <p className="text-sm text-blue-700">
              Lembre-se que todos os métodos fornecem estimativas e podem variar em precisão. Para resultados mais
              exatos, considere métodos como DEXA, bioimpedância ou pletismografia.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
