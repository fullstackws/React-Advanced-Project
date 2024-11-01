import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Image,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  UnorderedList,
  ListItem,
  Stack,
  useBreakpointValue,
  HStack,
  Grid,
} from "@chakra-ui/react";
import { MdLocationOn, MdAccessTime, MdCalendarToday } from "react-icons/md";

const fetchEvent = async (eventId) => {
  const response = await fetch(`http://localhost:3000/events/${eventId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }
  const data = await response.json();
  return {
    ...data,
    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
  };
};

const fetchCategories = async () => {
  const response = await fetch("http://localhost:3000/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

const fetchUsers = async () => {
  try {
    console.log("Fetching users...");
    const response = await fetch("http://localhost:3000/users");

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched users data:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchUsers:", error);
    throw error;
  }
};

const updateEvent = async (eventData) => {
  const response = await fetch(`http://localhost:3000/events/${eventData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: eventData.id,
      createdBy: eventData.createdBy,
      title: eventData.title,
      description: eventData.description,
      image: eventData.image,
      categoryIds: eventData.categoryIds,
      location: eventData.location,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to update event");
  }
  return response.json();
};

const deleteEvent = async (eventId, userId) => {
  try {
    console.log(`Attempting to delete event ${eventId} and user ${userId}`); // Add debugging

    // First, delete the event
    const response = await fetch(`http://localhost:3000/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("Event not found, proceeding to delete user");
        // If event doesn't exist, continue with user deletion
      } else {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }
    }

    // If we get here, either the event was deleted successfully or it didn't exist
    if (userId) {
      const deleteUserResponse = await deleteUser(userId);
      if (deleteUserResponse.success) {
        console.log("User deleted successfully");
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting event or user:", error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
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

const formatEventDateTime = (startTime, endTime) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const dateStr = startDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const startTimeStr = formatTime(startDate);
  const endTimeStr = formatTime(endDate);

  return {
    date: dateStr,
    time: `${startTimeStr} - ${endTimeStr}`,
  };
};

const InfoBox = ({ children, ...props }) => (
  <Box
    bg="white"
    p={4}
    borderRadius="lg"
    boxShadow="sm"
    border="1px"
    borderColor="gray.200"
    width="100%"
    {...props}
  >
    {children}
  </Box>
);

const DateTimeBox = ({ startTime, endTime }) => {
  const { date, time } = formatEventDateTime(startTime, endTime);

  return (
    <InfoBox>
      <VStack align="stretch" spacing={3}>
        <HStack spacing={3}>
          <MdCalendarToday color="gray.500" size={24} />
          <Text fontSize="md" fontWeight="medium">
            {date}
          </Text>
        </HStack>
        <HStack spacing={3}>
          <MdAccessTime color="gray.500" size={24} />
          <Text fontSize="md" fontWeight="medium">
            {time}
          </Text>
        </HStack>
        <Button
          colorScheme="blue"
          size="sm"
          width="100%"
          mt={2}
          onClick={() => {
            console.log("Add to agenda clicked");
          }}
        >
          Add to Agenda
        </Button>
      </VStack>
    </InfoBox>
  );
};

const LocationBox = ({ location }) => {
  return (
    <InfoBox>
      <HStack spacing={3} align="flex-start">
        <MdLocationOn color="gray.500" size={24} />
        <VStack align="start" spacing={2}>
          <Text fontSize="md" fontWeight="medium">
            {location}
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              window.open(
                `https://maps.google.com/?q=${encodeURIComponent(location)}`,
                "_blank"
              );
            }}
          >
            View on Maps
          </Button>
        </VStack>
      </HStack>
    </InfoBox>
  );
};

const EditEventModal = ({ isOpen, onClose, event, onUpdate }) => {
  const [formData, setFormData] = React.useState({
    id: event.id,
    title: event.title,
    description: event.description,
    image: event.image,
    location: event.location,
    startTime: new Date(event.startTime).toISOString().slice(0, 16),
    endTime: new Date(event.endTime).toISOString().slice(0, 16),
    categoryIds: Array.isArray(event.categoryIds)
      ? event.categoryIds.join(",")
      : "",
    createdBy: event.createdBy,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Handle user creation/update
      const user = await handleUser(formData.createdBy);

      // Update formData with user id and ensure proper date format
      const updatedFormData = {
        id: formData.id,
        createdBy: user.id,
        title: formData.title,
        description: formData.description,
        image: formData.image,
        categoryIds: formData.categoryIds
          .split(",")
          .map(Number)
          .filter((id) => !isNaN(id)), // Convert string to array of numbers
        location: formData.location,
        startTime: new Date(formData.startTime).toISOString(), // Convert to ISO string format
        endTime: new Date(formData.endTime).toISOString(), // Convert to ISO string format
      };

      onUpdate(updatedFormData);
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} pb={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Categories</FormLabel>
                <Input
                  name="categoryIds"
                  value={formData.categoryIds}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Created By</FormLabel>
                <Input
                  name="createdBy"
                  value={formData.createdBy}
                  onChange={handleChange}
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" w="100%">
                Save Changes
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const cancelRef = React.useRef();

  const buttonPlacement = useBreakpointValue({ base: "column", sm: "row" });

  const {
    data: event,
    isLoading: eventLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEvent(eventId),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const getCategoryName = (categoryId) => {
    const category = categories?.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getUserName = (createdBy) => {
    console.log("getUserName called with:", createdBy);
    console.log("Current users data:", users);

    if (isLoadingUsers || !users) {
      console.log("Users data is still loading or not available");
      return "Loading...";
    }

    const user = users.find(
      (user) => user.id === createdBy || user.name === createdBy
    );
    console.log("Found user:", user);

    return user ? user.name : "Unknown User";
  };

  const mutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: (data) => {
      queryClient.setQueryData(["event", eventId], data);
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Event updated successfully",
        description: `The event "${data.title}" has been updated with your changes.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating event",
        description:
          error.message ||
          "There was a problem updating your event. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ([eventId, userId]) => deleteEvent(eventId, userId),
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["event", eventId]);

      toast({
        title: "Event deleted successfully",
        description: "The event has been permanently removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });

      // Navigate to home page
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Error deleting event",
        description:
          error.message ||
          "There was a problem deleting the event. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteAlertOpen(false);
    setDeleteConfirmation("");
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting to delete event with ID:", eventId);
      console.log("User ID to be deleted:", event.createdBy); // Add this line to debug

      // Pass both eventId and userId to deleteEvent
      await deleteMutation.mutateAsync([eventId, event.createdBy]);

      console.log("Delete successful");
      setDeleteConfirmation("");
      setIsDeleteAlertOpen(false);

      // Invalidate and refetch queries after successful deletion
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["event", eventId]);

      // Show success toast
      toast({
        title: "Event deleted successfully",
        description: "The event has been permanently removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });

      // Navigate to home page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete request failed",
        description:
          error.message || "Could not delete the event. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (eventLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
    <Container maxW="container.lg" py={8}>
      <Stack
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        spacing={4}
      >
        <Heading size="2xl">{event.title}</Heading>
        <Stack
          direction={buttonPlacement}
          spacing={4}
          width={{ base: "100%", sm: "auto" }}
        >
          <Button
            colorScheme="blue"
            onClick={onOpen}
            width={{ base: "100%", sm: "auto" }}
          >
            Edit Event
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDeleteClick}
            leftIcon={<DeleteIcon />}
            width={{ base: "100%", sm: "auto" }}
          >
            Delete Event
          </Button>
        </Stack>
      </Stack>
      <VStack align="stretch" spacing={6} mt={6}>
        <Image src={event.image} alt={event.title} borderRadius="lg" />

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          <DateTimeBox startTime={event.startTime} endTime={event.endTime} />
          <LocationBox location={event.location} />
        </Grid>

        <Text fontSize="lg" fontWeight="bold">
          Categories:{" "}
          {Array.isArray(event.categoryIds) ? (
            event.categoryIds.map((categoryId, index) => (
              <Badge key={index} colorScheme="blue" mr={2}>
                {categories ? getCategoryName(categoryId) : categoryId}
              </Badge>
            ))
          ) : (
            <Badge colorScheme="gray">No categories</Badge>
          )}
        </Text>
        <Text fontSize="lg" fontWeight="bold">
          Created by:{" "}
          {isLoadingUsers ? "Loading..." : getUserName(event.createdBy)}
        </Text>
        {console.log("Rendering with event:", event)}
        <Text fontSize="lg">{event.description}</Text>
      </VStack>

      <EditEventModal
        isOpen={isOpen}
        onClose={onClose}
        event={event}
        onUpdate={(formData) => mutation.mutate(formData)}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleDeleteCancel}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="stretch" spacing={4}>
                <Text color="red.500" fontWeight="bold">
                  ⚠️ Warning: This action cannot be undone
                </Text>
                <Text>
                  You are about to permanently delete this event. This will:
                </Text>
                <UnorderedList pl={4} spacing={2}>
                  <ListItem>Remove all event details and information</ListItem>
                  <ListItem>Delete all associated data</ListItem>
                  <ListItem>Remove the event from all listings</ListItem>
                </UnorderedList>
                <Text fontWeight="bold">
                  Please type {event.title} below to confirm deletion:
                </Text>
                <Input
                  placeholder="Type event title to confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={isLoading}
                isDisabled={deleteConfirmation !== event.title}
              >
                Delete Event
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};
