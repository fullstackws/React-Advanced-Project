import React, { useState, useMemo, useEffect } from "react";
import {
  Heading,
  Box,
  VStack,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Image,
  Badge,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Container,
  useToast,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Wrap,
  WrapItem,
  useBreakpointValue,
  InputRightElement,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

export const EventsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [modalSelectedCategories, setModalSelectedCategories] = useState([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setModalSelectedCategories([]);
      setFormError("");
    }
  }, [isOpen]);

  const buttonText = useBreakpointValue({
    base: "Filter",
    md: "Filter by Category",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/categories");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched categories:", data);
      return data;
    },
  });

  const fetchEvents = async () => {
    const response = await fetch("http://localhost:3000/events");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const handleUser = async (userName) => {
    try {
      // First check if user exists
      const response = await fetch(`http://localhost:3000/users`);
      const users = await response.json();
      const existingUser = users.find((user) => user.name === userName);

      if (existingUser) {
        return existingUser;
      }

      // If user doesn't exist, create new user
      const createResponse = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: userName }),
      });

      return await createResponse.json();
    } catch (error) {
      console.error("Error handling user:", error);
      throw error;
    }
  };

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const getCategoryName = (categoryId) => {
    const category = categories?.find((cat) => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => {
      try {
        if (!event) return false;

        const eventCategoryIds = event.categoryIds || [];

        const matchesSearch =
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategories =
          selectedCategories.length === 0 ||
          eventCategoryIds.some((categoryId) =>
            selectedCategories.includes(categoryId.toString())
          );

        return matchesSearch && matchesCategories;
      } catch (error) {
        console.error("Error filtering event:", error);
        return false;
      }
    });
  }, [events, searchTerm, selectedCategories]);

  const handleCategoryChange = (values) => {
    setSelectedCategories(values);
  };

  const handleModalCategoryChange = (values) => {
    setModalSelectedCategories(values);

    // Clear the form error if at least one category is selected
    if (values.length > 0) {
      setFormError("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  const createEvent = async (newEvent) => {
    const response = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const addEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      toast({
        title: "Event created",
        description: "Your event has been successfully created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    setFormError("");

    if (modalSelectedCategories.length === 0) {
      setFormError("Please select at least one category");
      return;
    }

    const startTime = new Date(formData.get("startTime"));
    const endTime = new Date(formData.get("endTime"));

    if (endTime <= startTime) {
      toast({
        title: "Invalid dates",
        description: "End time must be after start time",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Handle user creation/lookup
      const creatorName = formData.get("createdBy");
      const user = await handleUser(creatorName);

      const newEvent = {
        title: formData.get("title"),
        createdBy: user.id, // Use the user ID instead of the name
        description: formData.get("description"),
        location: formData.get("location"),
        image: formData.get("image"),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        categoryIds: modalSelectedCategories.map(Number),
      };

      await addEventMutation.mutateAsync(newEvent);
      setModalSelectedCategories([]);
      setFormError("");
      e.target.reset();
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error creating event",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setModalSelectedCategories([]);
      setFormError("");
    }
  }, [isOpen]);

  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error.message}</Box>;

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Container maxW="container.xl">
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" mb={4}>
          <Heading size="xl">Upcoming Events</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Event
          </Button>
        </HStack>
        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pr="4.5rem"
            />
            {searchTerm && (
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setSearchTerm("")}>
                  <CloseIcon boxSize={3} />
                </Button>
              </InputRightElement>
            )}
          </InputGroup>

          <Menu closeOnSelect={false}>
            <MenuButton as={Button}>{buttonText}</MenuButton>
            <MenuList maxH="300px" overflowY="auto">
              {categories && categories.length > 0 ? (
                <MenuOptionGroup
                  type="checkbox"
                  value={selectedCategories}
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <MenuItemOption
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              ) : (
                <Box p={2}>No categories available</Box>
              )}
            </MenuList>
          </Menu>

          {selectedCategories.length > 0 && (
            <Button onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          )}
        </HStack>
        {filteredEvents.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <Heading size="md">{event.title}</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {event.image && (
                      <Image
                        src={event.image}
                        alt={event.title}
                        borderRadius="md"
                        objectFit="cover"
                        height="200px"
                      />
                    )}
                    <Text>{event.description}</Text>
                    <Text>
                      Starts: {new Date(event.startTime).toLocaleDateString()}{" "}
                      {formatTime(event.startTime)}
                    </Text>
                    <Text>
                      Ends: {new Date(event.endTime).toLocaleDateString()}{" "}
                      {formatTime(event.endTime)}
                    </Text>
                    <Wrap>
                      {Array.isArray(event.categoryIds) &&
                      event.categoryIds.length > 0 ? (
                        event.categoryIds.map((categoryId) => (
                          <WrapItem key={categoryId}>
                            <Badge colorScheme="blue">
                              {getCategoryName(categoryId)}
                            </Badge>
                          </WrapItem>
                        ))
                      ) : (
                        <WrapItem>
                          <Badge colorScheme="gray">No categories</Badge>
                        </WrapItem>
                      )}
                    </Wrap>
                  </VStack>
                </CardBody>
                <CardFooter>
                  <Button
                    as={Link}
                    to={`/event/${event.id}`}
                    colorScheme="blue"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" fontWeight="bold">
              No events found
            </Text>
            <Text mt={2}>Try adjusting your search or filter criteria</Text>
          </Box>
        )}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Event</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input name="title" />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea name="description" />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input name="location" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Image URL</FormLabel>
                    <Input name="image" />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Created By</FormLabel>
                    <Input
                      name="createdBy"
                      placeholder="Enter your name"
                      required
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      name="startTime"
                      type="datetime-local"
                      min="2023-01-01T01:00"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      name="endTime"
                      type="datetime-local"
                      min="2023-01-01T01:00"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Categories (select at least one)</FormLabel>
                    <CheckboxGroup
                      colorScheme="blue"
                      value={modalSelectedCategories}
                      onChange={handleModalCategoryChange}
                    >
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                        {categories?.map((category) => (
                          <Checkbox
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </CheckboxGroup>
                    {formError && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        {formError}
                      </Text>
                    )}
                    {modalSelectedCategories.length > 0 && (
                      <Text fontSize="sm" mt={2} color="green.500">
                        Selected:{" "}
                        {modalSelectedCategories
                          .map(
                            (id) =>
                              categories?.find(
                                (cat) => cat.id.toString() === id
                              )?.name
                          )
                          .join(", ")}
                      </Text>
                    )}
                  </FormControl>
                  <Button type="submit" colorScheme="blue" isFullWidth>
                    Create Event
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};
