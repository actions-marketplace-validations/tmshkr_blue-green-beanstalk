import {
  ApplicationVersionDescription,
  EnvironmentDescription,
  ElasticBeanstalkClient,
  UpdateEnvironmentCommand,
  waitUntilEnvironmentUpdated,
} from "@aws-sdk/client-elastic-beanstalk";
import { setDescribeEventsInterval } from "./setDescribeEventsInterval";

export async function deploy(
  client: ElasticBeanstalkClient,
  targetEnv: EnvironmentDescription,
  applicationVersion: ApplicationVersionDescription
) {
  console.log(`Starting deployment to to ${targetEnv.EnvironmentName}`);
  const startTime = new Date();
  await client.send(
    new UpdateEnvironmentCommand({
      EnvironmentId: targetEnv.EnvironmentId,
      VersionLabel: applicationVersion.VersionLabel,
    })
  );

  const interval = setDescribeEventsInterval(
    client,
    targetEnv.EnvironmentId,
    startTime
  );
  await waitUntilEnvironmentUpdated(
    { client, maxWaitTime: 60 * 10, minDelay: 5, maxDelay: 30 },
    { EnvironmentIds: [targetEnv.EnvironmentId] }
  );
  clearInterval(interval);
}
