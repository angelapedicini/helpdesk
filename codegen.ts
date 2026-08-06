import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/api/graphql',
  documents: ['app/**/*.tsx', 'lib/**/*.ts', 'apollo-client/**/*.ts'],
  generates: {
    './apollo-client/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          Date: 'string',
        },
      },
    },
  },
};

export default config;