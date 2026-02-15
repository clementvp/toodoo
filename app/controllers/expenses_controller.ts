import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Expense from '#models/expense'
import ExpenseOccurrence from '#models/expense_occurrence'
import ExpenseCategory from '#models/expense_category'
import UserSetting from '#models/user_setting'
import {
  createExpenseValidator,
  updateExpenseValidator,
  correctBalanceValidator,
} from '#validators/expense_validator'
import { getExpandedExpenses } from '#services/expense_expansion_service'
import type { ExpandedExpense } from '#services/expense_expansion_service'

const toBalanceDelta = (e: ExpandedExpense): number => {
  if (e.type === 'income') return Number(e.amount)
  if (e.type === 'expense') return -Number(e.amount)
  if (e.type === 'adjustment') return Number(e.amount)
  return 0
}

export default class ExpensesController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!

    const today = DateTime.now().endOf('day')
    const windowStart = today.minus({ months: 12 })
    const windowEnd = today.plus({ months: 12 })
    const monthStart = DateTime.now().startOf('month')
    const veryOldDate = DateTime.fromISO('1970-01-01')

    const [allExpenses, userSettings, categories] = await Promise.all([
      Expense.query().where('user_id', user.id),
      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id }),
      ExpenseCategory.query().where('user_id', user.id).orderBy('id', 'asc'),
    ])

    const allOccurrences =
      allExpenses.length > 0
        ? await ExpenseOccurrence.query().whereIn(
            'expense_id',
            allExpenses.map((e) => e.id)
          )
        : []

    const displayExpenses = getExpandedExpenses(allExpenses, allOccurrences, windowStart, windowEnd)

    const baseBalance = Number(userSettings.currentBalance)

    const balanceExpenses = getExpandedExpenses(allExpenses, allOccurrences, veryOldDate, today)
    const derivedBalance =
      baseBalance + balanceExpenses.reduce((sum, e) => sum + toBalanceDelta(e), 0)

    const monthStartMinus1 = monthStart.minus({ days: 1 }).endOf('day')
    const balanceAtStartExpenses = getExpandedExpenses(
      allExpenses,
      allOccurrences,
      veryOldDate,
      monthStartMinus1
    )
    const balanceAtStartOfMonth =
      baseBalance + balanceAtStartExpenses.reduce((sum, e) => sum + toBalanceDelta(e), 0)

    return inertia.render('expenses/index', {
      expenses: displayExpenses,
      userSettings: userSettings.serialize(),
      derivedBalance: Number.parseFloat(derivedBalance.toFixed(2)),
      balanceAtStartOfMonth: Number.parseFloat(balanceAtStartOfMonth.toFixed(2)),
      categories: categories.map((c) => c.serialize()),
    })
  }

  async create({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createExpenseValidator)

    await Expense.create({
      userId: user.id,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId ?? null,
      date: DateTime.fromJSDate(data.date),
      recurrenceType: data.recurrenceType ?? 'none',
      recurrenceEndDate: data.recurrenceEndDate
        ? DateTime.fromJSDate(data.recurrenceEndDate)
        : null,
    })

    session.flash('success', 'Transaction ajoutée avec succès')
    return response.redirect().back()
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(updateExpenseValidator)

    const expense = await Expense.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (expense.recurrenceType !== 'none' && data.occurrenceDate) {
      // Override a single occurrence
      await ExpenseOccurrence.updateOrCreate(
        { expenseId: expense.id, date: data.occurrenceDate },
        {
          amount: data.amount !== undefined ? data.amount : null,
          categoryId: data.categoryId !== undefined ? data.categoryId : null,
          status: 'active',
        }
      )
    } else {
      // Update the expense directly
      await expense
        .merge({
          ...(data.type !== undefined && { type: data.type }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.date !== undefined && { date: DateTime.fromJSDate(data.date) }),
        })
        .save()
    }

    return response.redirect().back()
  }

  async correctBalance({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(correctBalanceValidator)

    const veryOldDate = DateTime.fromISO('1970-01-01')
    const today = DateTime.now().endOf('day')

    const [allExpenses, userSettings] = await Promise.all([
      Expense.query().where('user_id', user.id),
      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id }),
    ])

    const allOccurrences =
      allExpenses.length > 0
        ? await ExpenseOccurrence.query().whereIn(
            'expense_id',
            allExpenses.map((e) => e.id)
          )
        : []

    const balanceExpenses = getExpandedExpenses(allExpenses, allOccurrences, veryOldDate, today)
    const derivedBalance =
      Number(userSettings.currentBalance) +
      balanceExpenses.reduce((sum, e) => sum + toBalanceDelta(e), 0)

    const adjustment = Number(data.targetBalance) - derivedBalance

    if (Math.abs(adjustment) < 0.01) {
      session.flash('info', 'Le solde est déjà correct, aucune correction nécessaire')
      return response.redirect().back()
    }

    await Expense.create({
      userId: user.id,
      type: 'adjustment',
      amount: Number.parseFloat(adjustment.toFixed(2)),
      categoryId: null,
      date: DateTime.fromJSDate(data.date),
      recurrenceType: 'none',
      recurrenceEndDate: null,
    })

    session.flash('success', 'Solde corrigé avec succès')
    return response.redirect().back()
  }

  async delete({ params, auth, response, session }: HttpContext) {
    const user = auth.user!

    const expense = await Expense.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await expense.delete()

    session.flash('success', 'Transaction supprimée')
    return response.redirect().back()
  }

  async deleteOccurrence({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const occurrenceDate = request.input('occurrenceDate') as string

    const expense = await Expense.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await ExpenseOccurrence.updateOrCreate(
      { expenseId: expense.id, date: occurrenceDate },
      { status: 'deleted' }
    )

    session.flash('success', 'Occurrence supprimée')
    return response.redirect().back()
  }
}
