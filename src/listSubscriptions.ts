import { promises as fs } from 'fs'
import path from 'path'
import { client } from './GCClient'
import { Subscription, SubscriptionStatus } from 'gocardless-nodejs'

async function listSubscription(subscription: Subscription) {
  const mandate = await client.mandates.find(subscription.links.mandate)
  const customer = await client.customers.find(mandate.links.customer)
  return {
    customer: {
      name: `${customer.given_name} ${customer.family_name}`,
      email: customer.email,
    },
    subscription: {
      id: subscription.id,
      name: subscription.name,
      resume: true,
    },
  }
}

async function run() {
  const results = []
  const status = ['paused' as SubscriptionStatus]
  const subscriptionName = 'Stage and Screen Membership'

  for await (const subscription of client.subscriptions.all({
    status,
  })) {
    if (subscription.name === subscriptionName) {
      results.push(await listSubscription(subscription))
    }
  }

  const resultFile = path.join(process.cwd(), 'subscriptions.json')
  await fs.writeFile(resultFile, JSON.stringify(results, null, 2))

  console.log('Done')
}

run()
