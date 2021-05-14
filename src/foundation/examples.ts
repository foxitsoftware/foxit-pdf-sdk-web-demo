export interface ExampleInfo {
  name: string;
  baseName: string;
  path: string;
  description: string;
}
export const examples = process.env.EXAMPLES as unknown as ExampleInfo[];
