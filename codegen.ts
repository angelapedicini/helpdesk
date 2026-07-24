// import { CodegenConfig } from '@graphql-codegen/cli';

// const config: CodegenConfig = {
//   schema: 'http://localhost:3000/api/graphql', // o path a schema.graphql
//   documents: ['app/**/*.tsx', 'lib/**/*.ts'],
//   generates: {
//     './lib/gql/': {
//       preset: 'client',
//       plugins: [],
//     },
//   },
// };

// export default config;

// codegen.ts
// codegen.ts
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/api/graphql',
  documents: ['app/**/*.tsx', 'lib/**/*.ts'],
  generates: {
    './lib/gql/': {
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