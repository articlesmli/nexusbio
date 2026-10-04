import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as oss from 'aws-cdk-lib/aws-opensearchserverless';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly dataLakeBucket: s3.Bucket;
  public readonly auditTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. S3 Data Lake Bucket
    this.dataLakeBucket = new s3.Bucket(this, 'NexusBioDataLake', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 2. DynamoDB Audit Trail Table
    this.auditTable = new dynamodb.Table(this, 'NexusBioAuditTrail', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 3. OpenSearch Serverless Encryption Policy
    const encryptionPolicy = new oss.CfnSecurityPolicy(this, 'OpenSearchEncryptionPolicy', {
      name: 'nexusbio-encryption-policy',
      type: 'encryption',
      policy: JSON.stringify({
        Rules: [
          {
            ResourceType: 'collection',
            Resource: ['collection/nexusbio-literature-vector-store'],
          },
        ],
        AWSOwnedKey: true,
      }),
    });

    // 4. OpenSearch Serverless Network Policy
    const networkPolicy = new oss.CfnSecurityPolicy(this, 'OpenSearchNetworkPolicy', {
      name: 'nexusbio-network-policy',
      type: 'network',
      policy: JSON.stringify([
        {
          Rules: [
            {
              ResourceType: 'collection',
              Resource: ['collection/nexusbio-literature-vector-store'],
            },
            {
              ResourceType: 'dashboard',
              Resource: ['collection/nexusbio-literature-vector-store'],
            },
          ],
          AllowFromPublic: true,
        },
      ]),
    });

    // 5. OpenSearch Serverless Collection
    const openSearchCollection = new oss.CfnCollection(this, 'OpenSearchCollection', {
      name: 'nexusbio-literature-vector-store',
      type: 'VECTORSEARCH',
    });

    openSearchCollection.addDependency(encryptionPolicy);
    openSearchCollection.addDependency(networkPolicy);
  }
}
