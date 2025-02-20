export interface Action {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: any, message: any) => Promise<boolean>;
  handler: (runtime: any, message: any, state?: any) => Promise<any>;
}

export interface Provider {
  get: (runtime: any, message: any, state?: any) => Promise<string>;
}

export interface Evaluator {
  name: string;
  description: string;
  validate: (runtime: any, message: any) => Promise<boolean>;
  handler: (runtime: any, message: any) => Promise<any>;
  priority: number;
}
