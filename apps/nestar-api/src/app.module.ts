import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';

// This is the main application module for the Nestar API service.
// It imports necessary modules, sets up GraphQL with Apollo, and configures global error handling.
//Design Pattern: Modular Architecture
@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true,
      formatError: (error: T) => { // formatting GraphQL errors globally
        const graphqlFormatError = {
          code: error?.extensions.code ,// GraphQL error code
          message: 
          error?.extensions?.exception?.response?.message || error?.extensions?.exception?.message || error?.message,
        };
        console.log('GRAPHQL GLOBAL ERR:', graphqlFormatError);
        return graphqlFormatError;
      },
    
    }),
    ComponentsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
