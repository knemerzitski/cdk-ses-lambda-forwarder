import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from '@aws-sdk/client-sesv2';

interface Handlers {
  SendEmailCommand?: (command: SendEmailCommand) => SendEmailCommandOutput;
}

export class MockSesClient extends SESv2Client {
  handlers: Handlers;

  constructor(handlers: Handlers) {
    super();
    this.handlers = handlers;
  }

  async send(command: unknown): Promise<unknown> {
    if (command instanceof SendEmailCommand) {
      return this.handlers.SendEmailCommand?.call(this, command);
    }

    throw new Error(`Unsupported command "${command?.constructor.name}"`);
  }
}

export function newMockSesClientHelper({
  sendEmailInputHandler = () => {},
}: {
  sendEmailInputHandler?: (input: SendEmailCommandInput) => void;
}) {
  return new MockSesClient({
    SendEmailCommand({ input }) {
      sendEmailInputHandler(input);
      return {} as SendEmailCommandOutput;
    },
  });
}
