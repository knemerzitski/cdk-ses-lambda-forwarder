import {
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';

interface Handlers {
  GetObjectCommand?: (command: GetObjectCommand) => GetObjectCommandOutput;
}

export class MockS3Client extends S3Client {
  handlers: Handlers;

  constructor(handlers: Handlers) {
    super();
    this.handlers = handlers;
  }

  async send(command: unknown): Promise<unknown> {
    if (command instanceof GetObjectCommand) {
      return this.handlers.GetObjectCommand?.call(this, command);
    }

    throw new Error(`Unsupported command "${command?.constructor.name}"`);
  }
}

export function newMockS3ClientHelper({
  getObjectInputHandler = () => {},
  getObjectOutput = 'ignore',
}: {
  getObjectInputHandler?: (input: GetObjectCommandInput) => void;
  getObjectOutput?: string;
}) {
  return new MockS3Client({
    GetObjectCommand({ input }) {
      getObjectInputHandler(input);
      return {
        Body: {
          async transformToString() {
            return getObjectOutput;
          },
        },
      } as GetObjectCommandOutput;
    },
  });
}
