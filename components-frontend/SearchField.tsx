import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent } from 'react';

export default function SearchField({
  textValue,
  setSearchFieldCallback,
  className,
}: {
  textValue: string;
  setSearchFieldCallback: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <TextField
      id="searchField"
      variant="outlined"
      fullWidth
      className={className}
      margin="normal"
      size="small"
      value={textValue || ''}
      placeholder="Search"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      onChange={setSearchFieldCallback}
    />
  );
}
