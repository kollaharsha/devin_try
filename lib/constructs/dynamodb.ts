import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { DynamoDBConfig, DynamoDBTableConfig, DynamoDBStreamConsumerConfig } from '../types/service-config';
import { EnvironmentConfig } from '../utils/environment';

export interface DynamoDBConstructProps {
  dynamodbConfig: DynamoDBConfig;
  serviceName: string;
  environment: string;
  envConfig: EnvironmentConfig;
  taskRole: iam.Role;
}

export class DynamoDBConstruct extends Construct {
  public readonly tables: Map<string, dynamodb.Table> = new Map();
  public readonly streamConsumers: lambda.Function[] = [];

  constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
    super(scope, id);

    const { dynamodbConfig, serviceName, environment, envConfig, taskRole } = props;

    if (dynamodbConfig.tables) {
      for (const tableConfig of dynamodbConfig.tables) {
        const table = this.createTable(tableConfig, environment, envConfig);
        this.tables.set(tableConfig.tableName, table);
      }
    }

    if (dynamodbConfig.accessTables) {
      this.grantTableAccess(dynamodbConfig.accessTables, taskRole, environment);
    }

    if (dynamodbConfig.streamConsumers) {
      for (const consumerConfig of dynamodbConfig.streamConsumers) {
        const consumer = this.createStreamConsumer(consumerConfig, serviceName, environment);
        this.streamConsumers.push(consumer);
      }
    }
  }

  private createTable(
    tableConfig: DynamoDBTableConfig,
    environment: string,
    envConfig: EnvironmentConfig
  ): dynamodb.Table {
    const tableName = `${environment}-${tableConfig.tableName}`;
    
    const tableProps: dynamodb.TableProps = {
      tableName,
      partitionKey: {
        name: tableConfig.partitionKey.name,
        type: this.mapAttributeType(tableConfig.partitionKey.type),
      },
      sortKey: tableConfig.sortKey ? {
        name: tableConfig.sortKey.name,
        type: this.mapAttributeType(tableConfig.sortKey.type),
      } : undefined,
      billingMode: tableConfig.billingMode === 'PROVISIONED' 
        ? dynamodb.BillingMode.PROVISIONED 
        : dynamodb.BillingMode.PAY_PER_REQUEST,
      readCapacity: tableConfig.billingMode === 'PROVISIONED' ? (tableConfig.readCapacity ?? 5) : undefined,
      writeCapacity: tableConfig.billingMode === 'PROVISIONED' ? (tableConfig.writeCapacity ?? 5) : undefined,
      stream: tableConfig.streams?.enabled ? this.mapStreamViewType(tableConfig.streams.viewType) : undefined,
      pointInTimeRecovery: tableConfig.pointInTimeRecovery ?? false,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    };

    const table = new dynamodb.Table(this, `Table-${tableConfig.tableName}`, tableProps);

    if (tableConfig.globalSecondaryIndexes) {
      for (const gsi of tableConfig.globalSecondaryIndexes) {
        const gsiProps: dynamodb.GlobalSecondaryIndexProps = {
          indexName: gsi.indexName,
          partitionKey: {
            name: gsi.partitionKey.name,
            type: this.mapAttributeType(gsi.partitionKey.type),
          },
          sortKey: gsi.sortKey ? {
            name: gsi.sortKey.name,
            type: this.mapAttributeType(gsi.sortKey.type),
          } : undefined,
          projectionType: this.mapProjectionType(gsi.projectionType),
          nonKeyAttributes: gsi.projectionType === 'INCLUDE' ? gsi.nonKeyAttributes : undefined,
          readCapacity: tableConfig.billingMode === 'PROVISIONED' ? (gsi.readCapacity ?? 5) : undefined,
          writeCapacity: tableConfig.billingMode === 'PROVISIONED' ? (gsi.writeCapacity ?? 5) : undefined,
        };

        table.addGlobalSecondaryIndex(gsiProps);
      }
    }

    if (tableConfig.localSecondaryIndexes) {
      for (const lsi of tableConfig.localSecondaryIndexes) {
        table.addLocalSecondaryIndex({
          indexName: lsi.indexName,
          sortKey: {
            name: lsi.sortKey.name,
            type: this.mapAttributeType(lsi.sortKey.type),
          },
          projectionType: this.mapProjectionType(lsi.projectionType),
          nonKeyAttributes: lsi.projectionType === 'INCLUDE' ? lsi.nonKeyAttributes : undefined,
        });
      }
    }

    if (tableConfig.globalTable?.enabled && envConfig.multiRegion) {
      const regions = tableConfig.globalTable.regions || this.getRegions(envConfig);
      
      table.node.addMetadata('globalTable', {
        enabled: true,
        regions: regions,
      });
    }

    return table;
  }

  private grantTableAccess(
    accessTables: Array<{
      tableName: string;
      permissions: ('read' | 'write' | 'delete')[];
      indexes?: string[];
    }>,
    taskRole: iam.Role,
    environment: string
  ): void {
    for (const accessConfig of accessTables) {
      const tableArn = `arn:aws:dynamodb:*:*:table/${environment}-${accessConfig.tableName}`;
      const indexArn = `${tableArn}/index/*`;

      const actions: string[] = [];
      
      if (accessConfig.permissions.includes('read')) {
        actions.push(
          'dynamodb:GetItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchGetItem'
        );
      }
      
      if (accessConfig.permissions.includes('write')) {
        actions.push(
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:BatchWriteItem'
        );
      }
      
      if (accessConfig.permissions.includes('delete')) {
        actions.push(
          'dynamodb:DeleteItem'
        );
      }

      const resources = [tableArn];
      if (accessConfig.indexes) {
        resources.push(indexArn);
      }

      taskRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions,
        resources,
      }));
    }
  }

  private createStreamConsumer(
    consumerConfig: DynamoDBStreamConsumerConfig,
    serviceName: string,
    environment: string
  ): lambda.Function {
    const functionName = `${environment}-${serviceName}-${consumerConfig.sourceTableName}-consumer`;
    
    const consumerFunction = new lambda.Function(this, `StreamConsumer-${consumerConfig.sourceTableName}`, {
      functionName,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: consumerConfig.consumer.handler || 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('DynamoDB Stream Event:', JSON.stringify(event, null, 2));
          for (const record of event.Records) {
            console.log('Processing record:', record);
          }
        };
      `),
      environment: {
        SOURCE_TABLE: `${environment}-${consumerConfig.sourceTableName}`,
      },
    });

    const ownedTable = this.tables.get(consumerConfig.sourceTableName);
    if (ownedTable) {
      consumerFunction.addEventSource(new lambdaEventSources.DynamoEventSource(ownedTable, {
        startingPosition: consumerConfig.consumer.startingPosition === 'TRIM_HORIZON' 
          ? lambda.StartingPosition.TRIM_HORIZON 
          : lambda.StartingPosition.LATEST,
        batchSize: consumerConfig.consumer.batchSize ?? 10,
        maxBatchingWindow: consumerConfig.consumer.maxBatchingWindow 
          ? cdk.Duration.seconds(consumerConfig.consumer.maxBatchingWindow)
          : undefined,
        parallelizationFactor: consumerConfig.consumer.parallelizationFactor ?? 1,
        maxRecordAge: consumerConfig.consumer.maxRecordAge 
          ? cdk.Duration.seconds(consumerConfig.consumer.maxRecordAge)
          : undefined,
        retryAttempts: consumerConfig.consumer.retryAttempts ?? 3,
      }));
    } else {
      const tableArn = `arn:aws:dynamodb:*:*:table/${environment}-${consumerConfig.sourceTableName}`;
      const streamArn = `arn:aws:dynamodb:*:*:table/${environment}-${consumerConfig.sourceTableName}/stream/*`;
      
      const tableRef = dynamodb.Table.fromTableAttributes(this, `SourceTable-${consumerConfig.sourceTableName}`, {
        tableArn,
        tableStreamArn: streamArn,
      });
      
      consumerFunction.addEventSource(new lambdaEventSources.DynamoEventSource(tableRef, {
        startingPosition: consumerConfig.consumer.startingPosition === 'TRIM_HORIZON' 
          ? lambda.StartingPosition.TRIM_HORIZON 
          : lambda.StartingPosition.LATEST,
        batchSize: consumerConfig.consumer.batchSize ?? 10,
        maxBatchingWindow: consumerConfig.consumer.maxBatchingWindow 
          ? cdk.Duration.seconds(consumerConfig.consumer.maxBatchingWindow)
          : undefined,
        parallelizationFactor: consumerConfig.consumer.parallelizationFactor ?? 1,
        maxRecordAge: consumerConfig.consumer.maxRecordAge 
          ? cdk.Duration.seconds(consumerConfig.consumer.maxRecordAge)
          : undefined,
        retryAttempts: consumerConfig.consumer.retryAttempts ?? 3,
      }));
    }

    return consumerFunction;
  }

  private mapAttributeType(type: 'S' | 'N' | 'B'): dynamodb.AttributeType {
    switch (type) {
      case 'S': return dynamodb.AttributeType.STRING;
      case 'N': return dynamodb.AttributeType.NUMBER;
      case 'B': return dynamodb.AttributeType.BINARY;
      default: return dynamodb.AttributeType.STRING;
    }
  }

  private mapStreamViewType(viewType?: string): dynamodb.StreamViewType {
    switch (viewType) {
      case 'KEYS_ONLY': return dynamodb.StreamViewType.KEYS_ONLY;
      case 'NEW_IMAGE': return dynamodb.StreamViewType.NEW_IMAGE;
      case 'OLD_IMAGE': return dynamodb.StreamViewType.OLD_IMAGE;
      case 'NEW_AND_OLD_IMAGES': return dynamodb.StreamViewType.NEW_AND_OLD_IMAGES;
      default: return dynamodb.StreamViewType.NEW_AND_OLD_IMAGES;
    }
  }

  private mapProjectionType(projectionType?: string): dynamodb.ProjectionType {
    switch (projectionType) {
      case 'ALL': return dynamodb.ProjectionType.ALL;
      case 'KEYS_ONLY': return dynamodb.ProjectionType.KEYS_ONLY;
      case 'INCLUDE': return dynamodb.ProjectionType.INCLUDE;
      default: return dynamodb.ProjectionType.ALL;
    }
  }

  private getRegions(envConfig: EnvironmentConfig): string[] {
    const regions = [envConfig.primaryRegion];
    if (envConfig.secondaryRegion) {
      regions.push(envConfig.secondaryRegion);
    }
    return regions;
  }

  public getTable(tableName: string): dynamodb.Table | undefined {
    return this.tables.get(tableName);
  }

  public getAllTables(): dynamodb.Table[] {
    return Array.from(this.tables.values());
  }
}
