import React from "react";
import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export const Root = () => {
  return (
    <Box>
      <Navigation />
      <Box as="main" p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};
