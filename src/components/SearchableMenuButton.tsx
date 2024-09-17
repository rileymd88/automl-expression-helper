import React, { useState, type KeyboardEvent } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@qlik-trial/sprout/icons/react/Add';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useTheme, Tabs, Tab } from '@mui/material';

interface SearchableMenuButtonProps {
  options: string[];
  fields: string[];
  handleFeatureChange: (expression: string, index: number) => void;
  index: number;
}

const SearchableMenuButton: React.FC<SearchableMenuButtonProps> = ({
  options,
  fields,
  handleFeatureChange,
  index
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');
  const [tabValue, setTabValue] = useState(0);

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
    </div>
  );
};

export default SearchableMenuButton;
