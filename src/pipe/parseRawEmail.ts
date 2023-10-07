interface ProcessRawEmailParams {
  rawEmail: string;
}

export interface EmailInfo {
  source: string;
  headers: {
    subject: string;
    from: string;
  };
}

export function parseRawEmail({ rawEmail }: ProcessRawEmailParams): EmailInfo {
  const headerBodySplitPos = rawEmail.match(/\r?\n\r?\n/)?.index ?? 0;

  const header = rawEmail.substring(0, headerBodySplitPos);

  const subject = header.match(/^subject:((.(?!^\S))*)/ims)?.[1].trim() ?? '';
  const from = header.match(/^from:((.(?!^\S))*)/ims)?.[1].trim() ?? '';

  return {
    source: rawEmail,
    headers: {
      subject,
      from,
    },
  };
}
