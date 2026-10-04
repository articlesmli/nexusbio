import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as opensearchserverless from 'aws-cdk-lib/aws-opensearchserverless';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly dataLakeBucket: s3.Bucket;
  public readonly auditTable: dynamodb.Table;
  public readonly searchCollection: opensearchserverless.CfnCollection;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // [Point 2] S3 Data Lake (raw abstracts, multi-omics dataset files)
    this.dataLakeBucket = new s3.Bucket(this, 'NexusBioDataLake', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Suitable for prototype environments
    });

    // [Point 4] DynamoDB Audit Trail & System State History
    this.auditTable = new dynamodb.Table(this, 'NexusBioAuditTrail', {
      partitionKey: { name: 'session_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // [Point 2] OpenSearch Serverless Vector Collection for Bedrock Knowledge Bases
    this.searchCollection = new opensearchserverless.CfnCollection(this, 'OpenSearchCollection', {
      name: 'nexusbio-literature-vector-store',
      type: 'VECTORSEARCH',
    });
  }
}
