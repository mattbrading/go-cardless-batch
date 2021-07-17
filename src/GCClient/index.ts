import creds from '../../credentials.json'
import * as gcConstants from 'gocardless-nodejs/constants'
import { GoCardlessClient } from 'gocardless-nodejs/client'

const isLive = process.env.ENVIRONMENT === 'live'

const credentials = isLive ? creds.LIVE : creds.SANDBOX
const gcEnv = isLive
  ? gcConstants.Environments.Live
  : gcConstants.Environments.Sandbox

export const client = new GoCardlessClient(credentials.token, gcEnv, {
  raiseOnIdempotencyConflict: true,
})
