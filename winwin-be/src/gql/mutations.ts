import InviteToMediation from './mutationResolvers/InviteToMediation'
import PayToMediator from './mutationResolvers/PayToMediator'
import DenyMediation from './mutationResolvers/DenyMediation'

export const resolvers = {
  PayToMediator,
  InviteToMediation,
  DenyMediation,
}
