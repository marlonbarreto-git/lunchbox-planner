import { test, expect } from '@playwright/test'

test.describe('LunchBox Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display welcome screen with create profile button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'LunchBox Planner' })).toBeVisible()
    await expect(page.getByText('Comienza agregando un perfil')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear Primer Perfil' })).toBeVisible()
  })

  test('should show profile form when clicking create button', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()

    await expect(page.getByRole('heading', { name: 'Nuevo Perfil' })).toBeVisible()
    await expect(page.getByPlaceholder('Ej: María')).toBeVisible()
    await expect(page.getByPlaceholder('Ej: 25')).toBeVisible()
    await expect(page.getByPlaceholder('Ej: 120')).toBeVisible()
  })

  test('should validate required fields in profile form', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    await expect(page.getByText('El nombre es requerido')).toBeVisible()
  })

  test('should create a child profile successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()

    // Fill out the form using placeholders
    await page.getByPlaceholder('Ej: María').fill('María')

    // Calculate a date that makes the child 7 years old
    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 7)
    const dateStr = birthDate.toISOString().split('T')[0]
    await page.locator('input[type="date"]').fill(dateStr)

    await page.getByPlaceholder('Ej: 25').fill('25')
    await page.getByPlaceholder('Ej: 120').fill('120')

    // Select activity level
    await page.getByRole('button', { name: 'Moderada' }).click()

    // Submit form
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Verify profile was created
    await expect(page.getByText('María')).toBeVisible()
    await expect(page.getByText('Perfiles (1)')).toBeVisible()
  })

  test('should navigate to menu tab after clicking profile card', async ({ page }) => {
    // Create a profile first
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Juan')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 8)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('28')
    await page.getByPlaceholder('Ej: 120').fill('130')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Click on profile card to select it (click on the name)
    await page.getByRole('heading', { name: 'Juan' }).click()

    // Should navigate to menu tab
    await expect(page.getByText('Requerimientos de Juan')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generar Menú Semanal' })).toBeVisible()
  })

  test('should generate weekly menu', async ({ page }) => {
    // Create and select a profile
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Ana')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 6)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('22')
    await page.getByPlaceholder('Ej: 120').fill('115')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Click on profile card
    await page.getByRole('heading', { name: 'Ana' }).click()

    // Generate menu
    await page.getByRole('button', { name: 'Generar Menú Semanal' }).click()

    // Wait for menu to appear
    await expect(page.getByText('Menú Semanal')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Lunes')).toBeVisible()
    await expect(page.getByText('Viernes')).toBeVisible()
    await expect(page.getByText('Resumen Semanal')).toBeVisible()
  })

  test('should show shopping list tab after generating menu', async ({ page }) => {
    // Create, select profile and generate menu
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Carlos')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 10)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('35')
    await page.getByPlaceholder('Ej: 120').fill('140')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Click on profile card
    await page.getByRole('heading', { name: 'Carlos' }).click()

    await page.getByRole('button', { name: 'Generar Menú Semanal' }).click()

    // Wait for menu
    await expect(page.getByText('Menú Semanal')).toBeVisible({ timeout: 5000 })

    // Click on shopping list tab
    await page.getByRole('button', { name: 'Lista de Compras' }).click()

    // Verify shopping list is displayed
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible()
    await expect(page.getByText(/ingredientes para \d+ comidas/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copiar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Imprimir' })).toBeVisible()
  })

  test('should toggle allergies in profile form', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()

    // Toggle some allergies
    await page.getByRole('button', { name: 'gluten' }).click()
    await page.getByRole('button', { name: 'lácteos' }).click()

    // Verify they are selected (have red styling)
    const glutenButton = page.getByRole('button', { name: 'gluten' })
    await expect(glutenButton).toHaveClass(/bg-red-100/)

    // Toggle off
    await page.getByRole('button', { name: 'gluten' }).click()
    await expect(glutenButton).not.toHaveClass(/bg-red-100/)
  })

  test('should delete a profile', async ({ page }) => {
    // Create a profile
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Pedro')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 5)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('20')
    await page.getByPlaceholder('Ej: 120').fill('110')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Verify profile exists
    await expect(page.getByRole('heading', { name: 'Pedro' })).toBeVisible()

    // Delete the profile (trash icon button)
    await page.getByRole('button', { name: 'Eliminar perfil' }).click()

    // Verify profile is gone and empty state is shown
    await expect(page.getByRole('heading', { name: 'Pedro' })).not.toBeVisible()
    await expect(page.getByText('Comienza agregando un perfil')).toBeVisible()
  })

  test('should show nutritional requirements based on profile', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Sofía')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 9)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('30')
    await page.getByPlaceholder('Ej: 120').fill('135')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Click on profile card (using text locator for the name)
    await page.locator('h3:has-text("Sofía")').click()

    // Check nutritional info is displayed
    await expect(page.getByText('Requerimientos de Sofía')).toBeVisible()
    // Check that the nutritional summary card is visible
    await expect(page.locator('.grid.grid-cols-2')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generar Menú Semanal' })).toBeVisible()
  })

  test('should allow regenerating menu', async ({ page }) => {
    // Create, select profile
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Luis')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 7)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('26')
    await page.getByPlaceholder('Ej: 120').fill('122')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Click on profile card
    await page.locator('h3:has-text("Luis")').click()

    // Generate initial menu
    await page.getByRole('button', { name: 'Generar Menú Semanal' }).click()
    await expect(page.getByText('Lunes')).toBeVisible({ timeout: 5000 })

    // Click regenerate
    await page.getByRole('button', { name: 'Regenerar' }).click()

    // Menu should still be visible after regeneration (wait for loading to complete)
    await expect(page.getByText('Lunes')).toBeVisible({ timeout: 5000 })
  })

  test('should have disabled menu and shopping tabs without profile/menu', async ({ page }) => {
    // Menu tab should be disabled without selecting a profile
    const menuTab = page.getByRole('button', { name: 'Menú Semanal' })
    await expect(menuTab).toHaveClass(/opacity-50/)
    await expect(menuTab).toBeDisabled()

    // Shopping tab should be disabled without a menu
    const shoppingTab = page.getByRole('button', { name: 'Lista de Compras' })
    await expect(shoppingTab).toHaveClass(/opacity-50/)
    await expect(shoppingTab).toBeDisabled()
  })

  test('should display footer with data policy info', async ({ page }) => {
    await expect(page.getByText(/Todos tus datos se guardan localmente/)).toBeVisible()
    await expect(page.getByText(/FAO\/OMS e ICBF Colombia/)).toBeVisible()
  })
})
