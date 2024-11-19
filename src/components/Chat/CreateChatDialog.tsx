import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import {useState} from "react";
import {
  useGetAvailableUsersQuery,
  useCreateChatMutation,
} from "../../services/apiSlice";
import {User, CreateChatPayload} from "../../types";

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (data: CreateChatPayload) => Promise<void>;
}

interface ApiError {
  data?: {
    error?: string;
    existingChat?: {
      id: string;
      name: string;
      type: string;
      participants: string[];
    };
  };
}

const CreateChatDialog: React.FC<CreateChatDialogProps> = ({
  open,
  onClose,
  onChatCreated,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("direct");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const {data: users = [], isLoading: loadingUsers} =
    useGetAvailableUsersQuery();
  const [createChat, {isLoading: creating}] = useCreateChatMutation();

  const handleSubmit = async () => {
    try {
      // Validate participant count
      if (selectedParticipants.length === 0) {
        setNotification({
          open: true,
          message: "Please select at least one participant",
          severity: "error",
        });
        return;
      }

      // Validate based on chat type
      if (type === "direct") {
        if (selectedParticipants.length !== 1) {
          setNotification({
            open: true,
            message: "Direct chat must have exactly one participant",
            severity: "error",
          });
          return;
        }
      } else if (type === "group") {
        if (selectedParticipants.length < 2) {
          setNotification({
            open: true,
            message: "Group chat must have at least two participants",
            severity: "error",
          });
          return;
        }
        if (!name.trim()) {
          setNotification({
            open: true,
            message: "Group chat must have a name",
            severity: "error",
          });
          return;
        }
      }

      // Prepare chat data
      const chatData = {
        name:
          type === "direct"
            ? users.find((u) => u.id === selectedParticipants[0])?.username ||
              ""
            : name.trim(),
        type,
        participants: selectedParticipants,
      };

      // Create chat
      await createChat(chatData).unwrap();

      setNotification({
        open: true,
        message: `${
          type === "direct" ? "Chat" : "Group chat"
        } created successfully`,
        severity: "success",
      });

      await onChatCreated(chatData);
      onClose();

      // Reset form
      setName("");
      setType("direct");
      setSelectedParticipants([]);
    } catch (error) {
      console.error("Failed to create chat:", error);

      const isApiError = (err: unknown): err is ApiError => {
        return (
          typeof err === "object" &&
          err !== null &&
          "data" in err &&
          typeof err.data === "object" &&
          err.data !== null
        );
      };

      if (isApiError(error) && error.data?.existingChat) {
        setNotification({
          open: true,
          message:
            type === "direct"
              ? "Opening existing chat..."
              : "Opening existing group chat...",
          severity: "info",
        });

        await onChatCreated({
          name: error.data.existingChat.name,
          type: error.data.existingChat.type,
          participants: error.data.existingChat.participants,
        });
        onClose();
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({...prev, open: false}));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create New {type === "direct" ? "Chat" : "Group Chat"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{display: "flex", flexDirection: "column", gap: 2, mt: 2}}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  // Clear name when switching to direct chat
                  if (e.target.value === "direct") {
                    setName("");
                  }
                }}
              >
                <MenuItem value="direct">Direct Message</MenuItem>
                <MenuItem value="group">Group Chat</MenuItem>
              </Select>
            </FormControl>

            {type === "group" && (
              <TextField
                label="Group Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                error={type === "group" && !name.trim()}
                helperText={
                  type === "group" && !name.trim()
                    ? "Group name is required"
                    : ""
                }
              />
            )}

            <FormControl fullWidth error={selectedParticipants.length === 0}>
              <InputLabel>
                {type === "direct" ? "Select User" : "Select Participants"}
              </InputLabel>
              <Select
                multiple={type === "group"}
                value={
                  type === "group"
                    ? selectedParticipants
                    : selectedParticipants[0] || ""
                }
                onChange={(e) => {
                  if (type === "group") {
                    setSelectedParticipants(e.target.value as string[]);
                  } else {
                    setSelectedParticipants(
                      e.target.value ? [e.target.value as string] : []
                    );
                  }
                }}
                renderValue={(selected) => (
                  <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                    {(Array.isArray(selected)
                      ? selected
                      : selected
                      ? [selected]
                      : []
                    ).map((value) => {
                      const user = users.find((u: User) => u.id === value);
                      return (
                        <Chip
                          key={value}
                          label={user?.username || value}
                          onDelete={() =>
                            setSelectedParticipants((prev) =>
                              prev.filter((id) => id !== value)
                            )
                          }
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {loadingUsers ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  users.map((user: User) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))
                )}
              </Select>
              {selectedParticipants.length === 0 && (
                <FormHelperText>
                  Please select {type === "direct" ? "a user" : "participants"}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              creating ||
              selectedParticipants.length === 0 ||
              (type === "group" && !name.trim())
            }
          >
            {creating ? <CircularProgress size={24} /> : "Create Chat"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{width: "100%"}}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateChatDialog;
