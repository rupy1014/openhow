export type ClaudeTask =
  | 'classification'
  | 'summary'
  | 'coding'
  | 'deep-review';

export interface ClaudeRunConfig {
  model: string;
  effort: 'low' | 'medium' | 'high' | 'max';
  useBatch: boolean;
  clearContextFirst: boolean;
}

export function pickClaudeConfig(task: ClaudeTask): ClaudeRunConfig {
  switch (task) {
    case 'classification':
      return {
        model: 'claude-haiku-4-5',
        effort: 'low',
        useBatch: false,
        clearContextFirst: true,
      };

    case 'summary':
      return {
        model: 'claude-sonnet-4-6',
        effort: 'low',
        useBatch: true,
        clearContextFirst: true,
      };

    case 'coding':
      return {
        model: 'claude-sonnet-4-6',
        effort: 'medium',
        useBatch: false,
        clearContextFirst: false,
      };

    case 'deep-review':
      return {
        model: 'claude-opus-4-6',
        effort: 'high',
        useBatch: false,
        clearContextFirst: true,
      };
  }
}

export function shouldUsePromptCaching(task: ClaudeTask): boolean {
  return task === 'summary' || task === 'coding' || task === 'deep-review';
}
