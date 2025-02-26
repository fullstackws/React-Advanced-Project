import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate, useRouteError } from "react-router-dom";

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, teal.400, teal.600)"
        backgroundClip="text"
      >
        Oops!
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        {error.statusText || error.message}
      </Text>
      <Text color={"gray.500"} mb={6}>
        The page you are looking for does not seem to exist
      </Text>

      <Button
        colorScheme="teal"
        bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
        color="white"
        variant="solid"
        onClick={() => navigate("/")}
      >
        Go to Home
      </Button>
    </Box>
  );
};
