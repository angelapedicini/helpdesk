// apollo.d.ts (o lib/apollo-client/apollo.d.ts)
import "@apollo/client";

declare module "@apollo/client" {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface WatchQuery {
        errorPolicy: "all";
      }
      interface Mutate {
        errorPolicy: "all";
      }
    }
  }
}

// Perché in Apollo Client 4.2+ impostare errorPolicy: "all" in defaultOptions cambia il tipo runtime di data (può diventare undefined anche con 
// l'operazione "riuscita"), e senza dichiararlo esplicitamente in quel file TypeScript continuerebbe a fidarsi ciecamente del vecchio tipo non-nullable, 
// rischiando errori a runtime non intercettati dal type-checker.