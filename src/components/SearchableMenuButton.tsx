import React, { useState, type KeyboardEvent } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@qlik-trial/sprout/icons/react/Add';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';

interface SearchableMenuButtonProps {
  options: string[];
  handleFeatureChange: (expression: string, index: number) => void;
  index: number;
}

const SearchableMenuButton: React.FC<SearchableMenuButtonProps> = ({ options, handleFeatureChange, index }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
    setSearchText('');
  };

  const handleMenuSelect = (expression: string) => {
    handleFeatureChange(expression, index);
    handleClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const filteredOptions = options.filter((option) => option.toLowerCase().includes(searchText.toLowerCase()));

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleFeatureChange(filteredOptions[0], index);
      handleClose();
    }
  };

  return (
    <div>
      <Button
        sx={{
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          maxWidth: '100%',
          maxHeight: 32,
          display: 'inline-block',
        }}
        variant="outlined"
        color="inherit"
        startIcon={<AddIcon height="16px" />}
        aria-controls="searchable-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        Use variable
      </Button>
      <Menu
        id="searchable-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'search-menu',
        }}
      >
        <MenuItem onKeyDown={(e) => e.stopPropagation()}>
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
                  borderBottom: 'none', // Remove the bottom line

                  // Reset default hover styles (optional)
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
        {filteredOptions.map((option) => (
          <MenuItem key={option} onClick={() => handleMenuSelect(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default SearchableMenuButton;
