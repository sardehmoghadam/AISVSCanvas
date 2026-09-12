export type StandardVersion = string;

export type CodeExample = {
  language: string;
  label: string;
  filename?: string;
  code: string;
  secure?: boolean;
};

export type Section = {
  id: string;
  slug: string;
  title: string;
  description: string;
  chapterId: string;
  standardVersion: StandardVersion;
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  standardVersion: StandardVersion;
};
