import { test, expect } from '@playwright/test'

test.describe('LunchBox Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display landing page with feature cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /LunchBox Planner/i })).toBeVisible()
    await expect(page.getByText(/Planifica almuerzos escolares/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Comenzar ahora/i })).toBeVisible()

    // Feature cards
    await expect(page.getByText('Perfiles personalizados')).toBeVisible()
    await expect(page.getByText('Menús semanales')).toBeVisible()
    await expect(page.getByText('155+ recetas')).toBeVisible()
    await expect(page.getByText('Lista de compras')).toBeVisible()
  })

  test('should navigate to profiles view when clicking start button', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()

    await expect(page.getByRole('heading', { name: 'Perfiles', exact: true })).toBeVisible()
    await expect(page.getByText('Sin perfiles todavía')).toBeVisible()
  })

  test('should show profile form when clicking create button', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()

    await expect(page.getByRole('heading', { name: 'Nuevo perfil' })).toBeVisible()
    await expect(page.getByPlaceholder('Ej: María')).toBeVisible()
  })

  test('should validate required fields in profile form', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('El nombre es requerido')).toBeVisible()
  })

  test('should create a child profile successfully', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()

    await page.getByPlaceholder('Ej: María').fill('María')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 7)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('25')
    await page.getByPlaceholder('Ej: 120').fill('120')

    await page.getByRole('button', { name: /Moderada/i }).click()
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('María')).toBeVisible()
    await expect(page.getByText('1 perfil creado')).toBeVisible()
  })

  test('should navigate to menu view after selecting profile', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByPlaceholder('Ej: María').fill('Juan')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 8)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('28')
    await page.getByPlaceholder('Ej: 120').fill('130')
    await page.getByRole('button', { name: 'Guardar' }).click()

    // Click profile card
    await page.locator('h3:has-text("Juan")').click()

    await expect(page.getByText('Menú de Juan')).toBeVisible()
    await expect(page.getByRole('button', { name: /Generar menú semanal/i })).toBeVisible()
  })

  test('should generate weekly menu', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByPlaceholder('Ej: María').fill('Ana')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 6)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('22')
    await page.getByPlaceholder('Ej: 120').fill('115')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.locator('h3:has-text("Ana")').click()
    await page.getByRole('button', { name: /Generar menú semanal/i }).click()

    await expect(page.getByText('Lunes')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Viernes')).toBeVisible()
    await expect(page.getByText('Resumen de la semana')).toBeVisible()
  })

  test('should show shopping list after generating menu', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByPlaceholder('Ej: María').fill('Carlos')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 10)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('35')
    await page.getByPlaceholder('Ej: 120').fill('140')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.locator('h3:has-text("Carlos")').click()
    await page.getByRole('button', { name: /Generar menú semanal/i }).click()
    await expect(page.getByText('Lunes')).toBeVisible({ timeout: 5000 })

    // Navigate to shopping
    await page.getByRole('button', { name: /Compras/i }).click()

    await expect(page.getByRole('heading', { name: 'Lista de compras' })).toBeVisible()
    await expect(page.getByText(/ingredientes para \d+ comidas/)).toBeVisible()
  })

  test('should toggle allergies in profile form', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()

    await page.getByRole('button', { name: 'gluten' }).click()
    await page.getByRole('button', { name: 'lácteos' }).click()

    const glutenButton = page.getByRole('button', { name: 'gluten' })
    await expect(glutenButton).toHaveClass(/ring-2/)

    await page.getByRole('button', { name: 'gluten' }).click()
    await expect(glutenButton).not.toHaveClass(/ring-2/)
  })

  test('should delete a profile', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByPlaceholder('Ej: María').fill('Pedro')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 5)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('20')
    await page.getByPlaceholder('Ej: 120').fill('110')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Pedro')).toBeVisible()

    await page.getByRole('button', { name: 'Eliminar perfil' }).click()

    await expect(page.getByText('Pedro')).not.toBeVisible()
    await expect(page.getByText('Sin perfiles todavía')).toBeVisible()
  })

  test('should show nutritional requirements', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByPlaceholder('Ej: María').fill('Sofía')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 9)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('30')
    await page.getByPlaceholder('Ej: 120').fill('135')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.locator('h3:has-text("Sofía")').click()

    await expect(page.getByText('Menú de Sofía')).toBeVisible()
    await expect(page.getByText('Requerimientos nutricionales')).toBeVisible()
  })

  test('should regenerate menu', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()
    await page.getByRole('button', { name: /Crear primer perfil/i }).click()
    await page.getByPlaceholder('Ej: María').fill('Luis')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 7)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('26')
    await page.getByPlaceholder('Ej: 120').fill('122')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.locator('h3:has-text("Luis")').click()
    await page.getByRole('button', { name: /Generar menú semanal/i }).click()
    await expect(page.getByText('Lunes')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /Regenerar/i }).click()

    await expect(page.getByText('Lunes')).toBeVisible({ timeout: 5000 })
  })

  test('should have disabled nav tabs without profile/menu', async ({ page }) => {
    await page.getByRole('button', { name: /Comenzar ahora/i }).click()

    const menuTab = page.getByRole('button', { name: /Menú/i })
    await expect(menuTab).toHaveClass(/opacity-40/)
    await expect(menuTab).toBeDisabled()

    const shoppingTab = page.getByRole('button', { name: /Compras/i })
    await expect(shoppingTab).toHaveClass(/opacity-40/)
    await expect(shoppingTab).toBeDisabled()
  })

  test('should toggle dark mode', async ({ page }) => {
    // Start in light mode
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    // Toggle to dark
    await page.getByRole('button', { name: /modo oscuro/i }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Toggle back to light
    await page.getByRole('button', { name: /modo claro/i }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('should display trust section with sources', async ({ page }) => {
    await expect(page.getByText(/FAO\/OMS/)).toBeVisible()
    await expect(page.getByText(/ICBF Colombia/)).toBeVisible()
    await expect(page.getByText(/USDA/)).toBeVisible()
  })
})
