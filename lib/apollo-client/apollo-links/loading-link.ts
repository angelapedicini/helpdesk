import { ApolloLink, makeVar } from "@apollo/client";
import { finalize } from "rxjs";

export const loadingVar = makeVar(0);

export const loadingLink = new ApolloLink((operation, forward) => {
  loadingVar(loadingVar() + 1);

  return forward(operation).pipe(
    finalize(() => {
      loadingVar(Math.max(0, loadingVar() - 1));
    })
  );
});