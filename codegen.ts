import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/api/graphql',
  documents: ['app/**/*.tsx', 'lib/**/*.ts', 'apollo-client/**/*.ts'],
  generates: {
    './graphql-generated/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          Date: 'string',
        },
      },
    },
    './graphql-generated/schema.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          Date: 'string',
        },
        enumsAsConst: true,
      },
    },
  },
};

export default config;