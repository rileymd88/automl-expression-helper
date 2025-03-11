import React, { useState, type KeyboardEvent } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@qlik-trial/sprout/icons/react/Add';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useTheme, Tabs, Tab } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import { createVariable } from '../helper';
interface SearchableMenuButtonProps {
  options: string[];
  fields: string[];
  handleFeatureChange: (expression: string, index: number) => void;
  index: number;
  app?: EngineAPI.IApp;
}

// Styled components for the dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const StyledDivider = styled(Divider)(() => ({
  margin: '8px 0',
}));

const SearchableMenuButton: React.FC<SearchableMenuButtonProps> = ({
  options,
  fields,
  handleFeatureChange,
  index,
  app
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [createVarDialogOpen, setCreateVarDialogOpen] = useState(false);
  const [variableName, setVariableName] = useState('');
  const [variableDefinition, setVariableDefinition] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
    setSearchText('');
  };

  const handleMenuSelect = (item: string) => {
    const expression = tabValue === 0 ? `[${item}]` : item;
    handleFeatureChange(expression, index);
    handleClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchText('');
  };

  const handleCreateVarClick = () => {
    setCreateVarDialogOpen(true);
    handleClose();
  };

  const handleCreateVarDialogClose = () => {
    setCreateVarDialogOpen(false);
    setVariableName('');
    setVariableDefinition('');
  };

  const handleCreateVariable = async () => {
    if (!app || !variableName.trim() || !variableDefinition.trim()) {
      return;
    }
    
    try {
      // Import the createVariable function from helper.ts
      
      
      // Create the variable using the helper function
      await createVariable(app, variableName, variableDefinition);
      
      // Select the newly created variable
      handleFeatureChange(variableName, index);
      
      // Close the dialog
      handleCreateVarDialogClose();
    } catch (error) {
      console.error('Error creating variable:', error);
    }
  };

  const currentItems = tabValue === 0 ? fields : options;
  const filteredItems = currentItems.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && filteredItems.length > 0) {
      event.preventDefault();
      handleMenuSelect(filteredItems[0]);
    }
  };

  return (
    <div>
      <Button
        sx={{
          maxWidth: '100%',
          maxHeight: 32,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
        variant="outlined"
        color="inherit"
        aria-controls="searchable-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        + Add
      </Button>
      <Menu
        id="searchable-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'search-menu',
          // Prevent Menu from adjusting its size based on content
          style: { padding: 0 }
        }}
        // Set fixed width and max height with scroll
        PaperProps={{
          sx: {
            width: 300, // Fixed width
            maxHeight: 400, // Fixed max height
            display: 'flex',
            flexDirection: 'column',
            // Ensure the Menu content fills the Paper
            '& .MuiMenu-list': {
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            },
          },
        }}
      >
        {/* Tabs Section */}
        <MenuItem disableRipple>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Fields" />
            <Tab label="Variables" />
          </Tabs>
        </MenuItem>

        {/* Search Bar Section */}
        <MenuItem disableRipple onKeyDown={(e) => e.stopPropagation()}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <TextField
              sx={{
                color: 'inherit',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
                  width: '100%',
                  [theme.breakpoints.up('md')]: {
                    width: '20ch',
                  },
                  borderBottom: 'none',
                  '&:hover': {
                    borderBottom: 'none',
                  },
                },
              }}
              variant="standard"
              placeholder="Search…"
              value={searchText}
              onChange={handleSearchChange}
              onKeyDown={handleEnter}
            />
          </Box>
        </MenuItem>

        {/* Create Variable Option */}
        {tabValue === 1 && app && (
          <MenuItem 
            onClick={handleCreateVarClick}
            sx={{
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '10px 16px',
              margin: '8px 0',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <AddIcon />
              <Typography 
                sx={{ 
                  ml: 1.5,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                }}
              >
                Create new variable
              </Typography>
            </Box>
          </MenuItem>
        )}

        {/* Items List Section */}
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
          }}
        >
          {filteredItems.map((item) => (
            <MenuItem key={item} onClick={() => handleMenuSelect(item)}>
              {item}
            </MenuItem>
          ))}
        </Box>
      </Menu>

      {/* Create Variable Dialog */}
      <StyledDialog 
        open={createVarDialogOpen} 
        onClose={handleCreateVarDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Create new variable</Typography>
          <StyledDivider />
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="variable-name"
            label="Variable name"
            type="text"
            fullWidth
            variant="outlined"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="variable-definition"
            label="Variable definition" 
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={variableDefinition}
            onChange={(e) => setVariableDefinition(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateVarDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateVariable} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default SearchableMenuButton;
