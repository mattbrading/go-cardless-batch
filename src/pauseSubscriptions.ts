import creds from '../credentials.json'
import * as gcConstants from 'gocardless-nodejs/constants'
import { Subscription, SubscriptionStatus } from 'gocardless-nodejs'
import { GoCardlessClient } from 'gocardless-nodejs/client'

const isLive = process.env.ENVIRONMENT === 'live'

const credentials = isLive ? creds.LIVE : creds.SANDBOX
const gcEnv = isLive
  ? gcConstants.Environments.Live
  : gcConstants.Environments.Sandbox

const client = new GoCardlessClient(credentials.token, gcEnv, {
  raiseOnIdempotencyConflict: true,
})

async function pauseSubscription(subscription: Subscription) {
  const mandate = await client.mandates.find(subscription.links.mandate)
  const customer = await client.customers.find(mandate.links.customer)
  console.log(
    '🕵️‍♂️',
    customer.given_name,
    customer.family_name,
    customer.email,
    subscription.id,
    subscription.name
  )
  console.log('⏸  Pausing:', subscription.id)
  try {
    await client.subscriptions.pause(subscription.id, {})
    console.log('✅ Paused!')
  } catch (err) {
    console.error('💣', subscription.id, err.message)
  }
}

async function run() {
  for await (const subscription of client.subscriptions.all({
    status: ['active' as SubscriptionStatus],
  })) {
    if (subscription.name === 'Stage and Screen Membership') {
      await pauseSubscription(subscription)
    }
  }

  console.log('🍾 Congratulations, you did it! 🥂')
}

run()
