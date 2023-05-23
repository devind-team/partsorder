import { join } from 'node:path'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { ConfigModule } from '@nestjs/config'
import GraphQLJSON from 'graphql-type-json'

import { AuthModule } from '@auth/auth.module'
import { PrismaService } from '@common/services/prisma.service'
import { UsersModule } from '@users/users.module'
import { OrdersModule } from '@orders/orders.module'
import { FilesModule } from '@files/files.module'
import { ItemsModule } from '@items/items.module'
import { PricesModule } from '@prices/prices.module'
import { ProductsModule } from '@products/products.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), '../client/schema.graphql'),
      installSubscriptionHandlers: true,
      playground: true,
      resolvers: { JSON: GraphQLJSON },
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    ItemsModule,
    PricesModule,
    OrdersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*')
  }
}
