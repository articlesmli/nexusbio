import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
interface ComputeStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
    dataLakeBucket: s3.IBucket;
    auditTable: dynamodb.ITable;
}
export declare class ComputeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ComputeStackProps);
}
export {};
