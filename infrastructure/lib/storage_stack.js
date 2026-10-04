"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const oss = require("aws-cdk-lib/aws-opensearchserverless");
class StorageStack extends cdk.Stack {
    dataLakeBucket;
    auditTable;
    constructor(scope, id, props) {
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
exports.StorageStack = StorageStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZV9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0b3JhZ2Vfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6QyxxREFBcUQ7QUFDckQsNERBQTREO0FBRzVELE1BQWEsWUFBYSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3pCLGNBQWMsQ0FBWTtJQUMxQixVQUFVLENBQWlCO0lBRTNDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM1RCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsZ0NBQWdDO1FBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUMvRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNqRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87U0FDekMsQ0FBQyxDQUFDO1FBRUgsNkNBQTZDO1FBQzdDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQ3JGLElBQUksRUFBRSw0QkFBNEI7WUFDbEMsSUFBSSxFQUFFLFlBQVk7WUFDbEIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3JCLEtBQUssRUFBRTtvQkFDTDt3QkFDRSxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsUUFBUSxFQUFFLENBQUMsNkNBQTZDLENBQUM7cUJBQzFEO2lCQUNGO2dCQUNELFdBQVcsRUFBRSxJQUFJO2FBQ2xCLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwwQ0FBMEM7UUFDMUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFO1lBQy9FLElBQUksRUFBRSx5QkFBeUI7WUFDL0IsSUFBSSxFQUFFLFNBQVM7WUFDZixNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDckI7b0JBQ0UsS0FBSyxFQUFFO3dCQUNMOzRCQUNFLFlBQVksRUFBRSxZQUFZOzRCQUMxQixRQUFRLEVBQUUsQ0FBQyw2Q0FBNkMsQ0FBQzt5QkFDMUQ7d0JBQ0Q7NEJBQ0UsWUFBWSxFQUFFLFdBQVc7NEJBQ3pCLFFBQVEsRUFBRSxDQUFDLDZDQUE2QyxDQUFDO3lCQUMxRDtxQkFDRjtvQkFDRCxlQUFlLEVBQUUsSUFBSTtpQkFDdEI7YUFDRixDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsc0NBQXNDO1FBQ3RDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUMvRSxJQUFJLEVBQUUsa0NBQWtDO1lBQ3hDLElBQUksRUFBRSxjQUFjO1NBQ3JCLENBQUMsQ0FBQztRQUVILG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3JELG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0Y7QUFqRUQsb0NBaUVDIn0=