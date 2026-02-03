import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('home page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Filter for critical and serious violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    // Log all violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:')
      accessibilityScanResults.violations.forEach(v => {
        console.log(`- [${v.impact}] ${v.id}: ${v.description}`)
        console.log(`  Help: ${v.helpUrl}`)
      })
    }

    expect(criticalViolations).toHaveLength(0)
  })

  test('profile form should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations in profile form:')
      accessibilityScanResults.violations.forEach(v => {
        console.log(`- [${v.impact}] ${v.id}: ${v.description}`)
      })
    }

    expect(criticalViolations).toHaveLength(0)
  })

  test('menu page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/')

    // Create a profile first
    await page.getByRole('button', { name: 'Crear Primer Perfil' }).click()
    await page.getByPlaceholder('Ej: María').fill('Test')

    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - 7)
    await page.locator('input[type="date"]').fill(birthDate.toISOString().split('T')[0])

    await page.getByPlaceholder('Ej: 25').fill('25')
    await page.getByPlaceholder('Ej: 120').fill('120')
    await page.getByRole('button', { name: 'Guardar Perfil' }).click()

    // Navigate to menu
    await page.locator('h3:has-text("Test")').click()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations in menu page:')
      accessibilityScanResults.violations.forEach(v => {
        console.log(`- [${v.impact}] ${v.id}: ${v.description}`)
      })
    }

    expect(criticalViolations).toHaveLength(0)
  })
})
