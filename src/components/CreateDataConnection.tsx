import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
} from '@mui/material';
import { getAutoMLModels, getConnectionString, createDataConnection, getSpaces } from '../helper';

interface CreateDataConnectionProps {
  open: boolean;
  onClose: () => void;
  onConnectionCreated: (connection: AutoMLConnection) => void;
  appSpaceId: string | null;
}

interface AutoMLModel {
  name: string;
  value: string;
}

interface Space {
  id: string;
  name: string;
}

interface AutoMLConnection {
  id: string;
  name: string;
  deploymentId: string;
  spaceId: string;
}

const CreateDataConnection: React.FC<CreateDataConnectionProps> = ({ open, onClose, onConnectionCreated, appSpaceId }) => {
  const [models, setModels] = useState<AutoMLModel[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedModel, setSelectedModel] = useState<AutoMLModel | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [connectionName, setConnectionName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      const fetchedModels = await getAutoMLModels();
      setModels(fetchedModels);
    };

    const fetchSpaces = async () => {
      let fetchedSpaces = await getSpaces();
      const personalSpace = { id: 'personal', name: 'Personal' };
      fetchedSpaces = [...fetchedSpaces, personalSpace];
      setSpaces(fetchedSpaces);
    };

    fetchModels();
    fetchSpaces();
  }, []);

  useEffect(() => {
    if (appSpaceId && spaces.length > 0) {
      const currentSpace = spaces.find(space => space.id === appSpaceId);
      setSelectedSpace(currentSpace || null);
    }
  }, [appSpaceId, spaces]);

  const handleCreate = async () => {
    if (!selectedModel || !connectionName || !selectedSpace) return;

    setLoading(true);
    try {
      const connectionString = await getConnectionString(selectedModel.value);
      const createdConnection = await createDataConnection(connectionString, connectionName, selectedSpace.id === 'personal' ? '' : selectedSpace.id);
      const newConnection: AutoMLConnection = {
        id: createdConnection.id,
        name: createdConnection.qName,
        deploymentId: selectedModel.value,
        spaceId: selectedSpace.id,
      };
      onConnectionCreated(newConnection);
      
      // Close dialog and reset form
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating data connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedModel(null);
    setConnectionName('');
    setSelectedSpace(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create AutoML data connection</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Autocomplete
            options={models}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Select AutoML Model" />}
            value={selectedModel}
            onChange={(_, newValue) => setSelectedModel(newValue)}
          />
          <TextField
            label="Connection Name"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            fullWidth
          />
          <Autocomplete
            options={spaces}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Select space" />}
            value={selectedSpace}
            onChange={(_, newValue) => setSelectedSpace(newValue)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          disabled={!selectedModel || !connectionName || !selectedSpace || loading}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : 'Create connection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDataConnection;