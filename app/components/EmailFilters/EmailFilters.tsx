'use client';

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { EmailFilters as IEmailFilters, EmailSortOptions } from '../../services/gmail';

interface EmailFiltersProps {
  filters: IEmailFilters;
  sort: EmailSortOptions;
  onFiltersChange: (filters: IEmailFilters) => void;
  onSortChange: (sort: EmailSortOptions) => void;
}

export const EmailFilters: React.FC<EmailFiltersProps> = ({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}) => {
  const handleFilterChange = (field: keyof IEmailFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const [field, order] = event.target.value.split('-');
    onSortChange({
      field: field as EmailSortOptions['field'],
      order: order as EmailSortOptions['order'],
    });
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={`${sort.field}-${sort.order}`}
          label="Sort by"
          onChange={handleSortChange}
        >
          <MenuItem value="date-desc">Date (Newest first)</MenuItem>
          <MenuItem value="date-asc">Date (Oldest first)</MenuItem>
          <MenuItem value="from-asc">Sender (A-Z)</MenuItem>
          <MenuItem value="from-desc">Sender (Z-A)</MenuItem>
          <MenuItem value="subject-asc">Subject (A-Z)</MenuItem>
          <MenuItem value="subject-desc">Subject (Z-A)</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="From"
        value={filters.from || ''}
        onChange={(e) => handleFilterChange('from', e.target.value)}
        fullWidth
      />

      <TextField
        label="Subject contains"
        value={filters.subject || ''}
        onChange={(e) => handleFilterChange('subject', e.target.value)}
        fullWidth
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <DatePicker
          label="After"
          value={filters.after || null}
          onChange={(date) => handleFilterChange('after', date)}
        />
        <DatePicker
          label="Before"
          value={filters.before || null}
          onChange={(date) => handleFilterChange('before', date)}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={filters.isUnread || false}
            onChange={(e) => handleFilterChange('isUnread', e.target.checked)}
          />
        }
        label="Unread only"
      />

      <FormControlLabel
        control={
          <Switch
            checked={filters.isImportant || false}
            onChange={(e) => handleFilterChange('isImportant', e.target.checked)}
          />
        }
        label="Important only"
      />
    </Box>
  );
}; 