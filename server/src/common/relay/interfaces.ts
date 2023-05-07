import { GraphQLResolveInfo } from 'graphql'
import { PageInfo } from './dto/page-info.type'

// Prisma Relay Cursor Connection Arguments
export interface Options<Record, Cursor, Node, CustomEdge extends Edge<Node>> {
  getCursor?: (record: Record) => Cursor
  encodeCursor?: (cursor: Cursor) => string
  decodeCursor?: (cursorString: string) => Cursor

  recordToEdge?: (record: Record) => Omit<CustomEdge, 'cursor'>

  resolveInfo?: GraphQLResolveInfo | null
}

// Prisma Arguments
export interface PrismaFindManyArguments<Cursor> {
  cursor?: Cursor
  take?: number
  skip?: number
}

// Relay Arguments
export interface ConnectionArguments {
  first?: number | null
  after?: string | null
  last?: number | null
  before?: string | null
  skip?: number | null
}

// Relay Response
export interface Connection<T, CustomEdge extends Edge<T> = Edge<T>> {
  edges: Array<CustomEdge>
  pageInfo: PageInfo
  totalCount: number
}

export interface Edge<T> {
  cursor: string
  node: T
}
