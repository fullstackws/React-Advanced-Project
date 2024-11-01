import React from "react";
import { Box, Flex, Button, Icon } from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

export const Navigation = () => {
  return (
    <Box as="nav" bg="gray.100" py={4}>
      <Flex
        maxW="container.xl"
        mx="auto"
        alignItems="center"
        justifyContent="start"
      >
        <Button
          as={RouterLink}
          to="/"
          leftIcon={<Icon as={FaHome} />}
          colorScheme="blue"
          variant="solid"
          mr={4}
          shadow="md"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          transition="all 0.2s"
        >
          Home
        </Button>
        {/* 
        <Link
          as={RouterLink}
          to="/"
          mr={4}
          fontWeight="medium"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaCalendar} mr={2} />
          Events
        </Link>
        <Link
          as={RouterLink}
          to="/event/1"
          fontWeight="medium"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaCalendar} mr={2} />
          Event
        </Link>
        */}
      </Flex>
    </Box>
  );
};
