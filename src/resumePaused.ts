import { promises as fs } from 'fs'
import path from 'path'
import { client } from './GCClient'

const emails: string[] = []
const errors: string[] = []

async function resumeSubscription({
  customer,
  subscription,
}: {
  customer: {
    email: string
  }
  subscription: {
    id: string
    resume: boolean
  }
}) {
  if (subscription.resume) {
    console.log('⏸  Resuming:', subscription.id)
    try {
      await client.subscriptions.resume(subscription.id, {})
      emails.push(customer.email || 'missing email for' + subscription.id)
      console.log('✅ Resumed!')
    } catch (err) {
      errors.push(subscription.id)
      console.error('💣', subscription.id, err.message)
    }
  }
}

async function run() {
  let subscriptions = []
  try {
    subscriptions = JSON.parse(
      await fs
        .readFile(path.join(process.cwd(), 'subscriptions.json'))
        .then((data) => data.toString())
    )
  } catch (err) {
    throw Error('Unable to Read subscriptions.json')
  }

  for await (const subscription of subscriptions) {
    await resumeSubscription(subscription)
  }

  if (emails.length) {
    console.log('Send Emails To:')
    console.log(emails.join('\n'))
  }

  if (errors.length) {
    console.error('Some went wrong:')
    console.error(errors.join('\n'))
  }

  console.log('🍾 Congratulations, you did it! 🥂')
}

run()
