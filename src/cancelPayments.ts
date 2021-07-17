import creds from '../credentials.json'
import * as gcConstants from 'gocardless-nodejs/constants'
import { Payment, PaymentStatus } from 'gocardless-nodejs'
import { GoCardlessClient } from 'gocardless-nodejs/client'

const isLive = process.env.ENVIRONMENT === 'live'

const credentials = isLive ? creds.LIVE : creds.SANDBOX
const gcEnv = isLive
  ? gcConstants.Environments.Live
  : gcConstants.Environments.Sandbox

const client = new GoCardlessClient(credentials.token, gcEnv, {
  raiseOnIdempotencyConflict: true,
})

async function cancelPayments(payment: Payment) {
  const mandate = await client.mandates.find(payment.links.mandate)
  const customer = await client.customers.find(mandate.links.customer)
  console.log(
    '🕵️‍♂️',
    customer.given_name,
    customer.family_name,
    customer.email,
    payment.id,
    payment.description
  )
  console.log('⏸  Cancelling:', payment.id)
  try {
    await client.payments.cancel(payment.id, {})
    console.log('✅ Cancelled!')
  } catch (err) {
    console.error('💣', payment.id, err.message)
  }
}

async function run() {
  for await (const payment of client.payments.all({
    status: 'pending_submission' as PaymentStatus,
  })) {
    await cancelPayments(payment)
  }

  console.log('🍾 Congratulations, you did it! 🥂')
}

run()
