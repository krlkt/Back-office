import {
  Divider,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';

export interface RowProps {
  readonly name: string;
  readonly id: string;
  readonly link?: string;
  onDeleteIconClick?: (id: string, name: string) => void;
  readonly children?: React.ReactNode;
}

const Row = ({ name, id, link, onDeleteIconClick, children }: RowProps) => {
  const clickCallback = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onDeleteIconClick?.(id, name);
    },
    [id, name, onDeleteIconClick]
  );

  return (
    <Link href={link || '#'} key={name}>
      <ListItem className="text-primary font-light flex justify-between hover:cursor-pointer hover:bg-gray-300 transition-color duration-300 hover:bg-opacity-60">
        <div className="h-10 flex items-center grow justify-between">
          <div className="flex justify-start whitespace-nowrap">{name}</div>
          {children}
          {onDeleteIconClick && (
            <div className="flex justify-end space-x-3">
              <IconButton onClick={clickCallback}>
                <DeleteIcon className="text-md opacity-90 hover:opacity-100" />
              </IconButton>
            </div>
          )}
        </div>
      </ListItem>
    </Link>
  );
};

export function PaginatedList<T extends RowProps>({
  currentItems,
}: {
  currentItems: Array<T>;
}) {
  return (
    <List>
      {currentItems.length == 0 && (
        <div className="p-4 rounded-lg bg-blue-200 bg-opacity-50 text-gray-600 mt-4">
          <h1>No entries found.</h1>
        </div>
      )}
      {currentItems.map((item) => {
        return (
          <div key={item.id}>
            <Row
              name={item.name}
              link={item.link}
              id={item.id}
              onDeleteIconClick={item.onDeleteIconClick}
            >
              {item.children}
            </Row>
            <Divider />
          </div>
        );
      })}
    </List>
  );
}

export default function CustomPagination<T extends RowProps>({
  items,
}: {
  items: Array<T>;
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pageCount, setPageCount] = useState(10);
  const [currentItems, setCurrentItems] = useState<T[]>([]);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    const tmpPageCount = Math.ceil(items.length / rowsPerPage);
    const endOffset = itemOffset + rowsPerPage;
    setCurrentItems(items.slice(itemOffset, endOffset));
    setPageCount(tmpPageCount);
    if (page > tmpPageCount) {
      setPage(1);
      setItemOffset(0);
    }
  }, [itemOffset, items, rowsPerPage, page]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
      const newOffset = ((value - 1) * rowsPerPage) % items.length;
      setItemOffset(newOffset);
    },
    [items.length, rowsPerPage]
  );

  const handleChangeRowsPerPage = useCallback((event: SelectChangeEvent) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
    setItemOffset(0);
  }, []);

  return (
    <div className="text-primary">
      <PaginatedList currentItems={currentItems} />
      {currentItems.length != 0 && (
        <>
          <div className="flex space-x-2 text-md items-center justify-center my-2">
            <Pagination page={page} count={pageCount} onChange={handleChange} />
          </div>
          <div className="flex space-x-14 text-md items-center justify-center my-2">
            <p>
              {<b>{currentItems.length == 0 ? 0 : 1 + itemOffset}</b>} -{' '}
              {<b>{Math.min(itemOffset + rowsPerPage, items.length)}</b>} out of{' '}
              {<b>{items.length}</b>}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <p>Entries per page</p>
              <Select
                id="items-per-page"
                value={rowsPerPage.toString()}
                onChange={handleChangeRowsPerPage}
                className="h-10"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
