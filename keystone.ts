import 'dotenv/config'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'

export default withAuth(
  config({
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: 'postgresql',
      url: process.env.DATABASE_URL!,
    },
    lists,
    session,
    ui: {
      isAccessAllowed: ({ session }) => !!session?.data.isAdmin,
    },
  })
);
