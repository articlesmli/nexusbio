import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
export declare class StorageStack extends cdk.Stack {
    readonly dataLakeBucket: s3.Bucket;
    readonly auditTable: dynamodb.Table;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
