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
} from "@mui/material";
import {useState} from "react";
import {
  useGetAvailableUsersQuery,
  useCreateChatMutation,
} from "../../services/apiSlice";
import {User} from "../../types";

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: () => void;
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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });

  const {data: users = [], isLoading: loadingUsers} =
    useGetAvailableUsersQuery();
  const [createChat, {isLoading: creating}] = useCreateChatMutation();

  const handleSubmit = async () => {
    try {
      await createChat({
        name,
        type,
        participants: selectedParticipants,
      }).unwrap();

      onChatCreated();
      onClose();
      // Reset form
      setName("");
      setType("direct");
      setSelectedParticipants([]);
    } catch (error) {
      console.error("Failed to create chat:", error);

      // Type guard for ApiError
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
        onChatCreated(); // Refresh chat list
        onClose();
      } else {
        // Show error notification
        setNotification({
          open: true,
          message:
            isApiError(error) && error.data?.error
              ? error.data.error
              : "Failed to create chat",
          severity: "error",
        });
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({...prev, open: false}));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <Box sx={{display: "flex", flexDirection: "column", gap: 2, mt: 2}}>
            <TextField
              label="Chat Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <MenuItem value="direct">Direct Message</MenuItem>
                <MenuItem value="group">Group Chat</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Participants</InputLabel>
              <Select
                multiple
                value={selectedParticipants}
                onChange={(e) =>
                  setSelectedParticipants(e.target.value as string[])
                }
                renderValue={(selected) => (
                  <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                    {selected.map((value) => {
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
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={creating || !name || selectedParticipants.length === 0}
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
