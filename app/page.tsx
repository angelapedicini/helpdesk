"use client";

import { useState } from "react";
import { Box, Button, CircularProgress, Alert } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { START_DEMO_MUTATION } from "@/apollo-client/queries/demo/demo.mutations";
import { LOGIN } from "@/apollo-client/queries/auth/login/login.mutation";


export default function Page() {
  const router = useRouter();
  const [startDemo, { loading, error }] = useMutation(START_DEMO_MUTATION);
  const [login] = useMutation(LOGIN);
  const [result, setResult] = useState<string | null>(null);

  const handleStartDemo = async () => {
    try {
      const { data } = await startDemo();
      if (data?.startDemo.success) {
        setResult(`Branch creato! demoSessionId: ${data.startDemo.demoSessionId}`);
      }

      const { data: loginData } = await login({
        variables: {
          input: {
            email: "system.admin@example.com",
          },
        },
      });

      router.replace("/dashboard");
    } catch (err) {
      console.error("Errore startDemo:", err);
    }
  };

  const loginStatic = async () => {
    const { data: loginData } = await login({
      variables: {
        input: {
          email: "system.admin@example.com",
        },
      },
    });
    router.replace("/dashboard");

  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: 320,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          sx={{ color: "inherit", py: 1.5, fontSize: "1.1rem" }}
          onClick={handleStartDemo}
          disabled={loading}
        >
          Start Demo
        </Button>

        {/* <Button
          variant="outlined"
          size="large"
          sx={{ color: "inherit", py: 1.5, fontSize: "1.1rem" }}
          onClick={loginStatic}
          disabled={loading}
        >
          Login Static
        </Button> */}

        {/* {result && <Alert severity="success">{result}</Alert>} */}
        {/* {error && <Alert severity="error">{error.message}</Alert>} */}
      </Box>
    </Box>
  );
}