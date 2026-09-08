"use client";

import { useState } from "react";
import { Box, Button, CircularProgress, Alert } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { START_DEMO_MUTATION } from "@/apollo-client/queries/demo/demo.mutations";


export default function Page() {
  const router = useRouter();
  const [startDemo, { loading, error }] = useMutation(START_DEMO_MUTATION);
  const [result, setResult] = useState<string | null>(null);

  const handleStartDemo = async () => {
    try {
      const { data } = await startDemo();
      if (data?.startDemo.success) {
        setResult(`Branch creato! demoSessionId: ${data.startDemo.demoSessionId}`);
      }
      router.replace("/dashboard");
    } catch (err) {
      console.error("Errore startDemo:", err);
    }
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

        {result && <Alert severity="success">{result}</Alert>}
        {error && <Alert severity="error">{error.message}</Alert>}
      </Box>
    </Box>
  );
}