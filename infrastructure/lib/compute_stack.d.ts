import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
interface ComputeStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
    auditTable: cdk.aws_dynamodb.ITable;
    dataLakeBucket: cdk.aws_s3.IBucket;
}
export declare class ComputeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ComputeStackProps);
}
export {};
