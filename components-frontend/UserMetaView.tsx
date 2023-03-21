import { Collapse, List, ListItemButton } from '@mui/material';
import { useCallback, useState } from 'react';
import { UserDTO } from '../components-shared/user-def';
import MetaView from './MetaView';

export default function UserMetaView({
  tenantName,
  users,
  onCloseMetaView,
}: {
  tenantName: string;
  users: UserDTO[];
  onCloseMetaView: () => void;
}) {
  return (
    <MetaView
      title={'User List'}
      onCloseMetaView={onCloseMetaView}
      className="w-[24rem] h-[36rem]"
    >
      <div className="w-full bg-blue-50 shadow-md rounded-xl text-center py-2 px-4 my-2 text-primary">
        <p className="text-md truncate">{tenantName}</p>
      </div>

      <div className="bg-blue-50 w-full px-4 shadow-md p-4 text-sm rounded-lg overflow-y-auto mt-3">
        {users.map((user) => (
          <UserListItem user={user} key={user.id} />
        ))}
      </div>
    </MetaView>
  );
}

function UserListItem({ user }: { user: UserDTO }) {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    setOpen((open) => !open);
  }, []);

  return (
    <div
      key={user.email}
      className="w-full hover:bg-blue-100 hover:text-blue-600 text-primary rounded-md cursor-pointer"
      onClick={handleClick}
    >
      <div
        key={user.email}
        className="flex justify-between items-center p-2 my-1 "
      >
        <p className="truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="truncate text-gray-600">{user.userRole}</p>
      </div>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <div className="text-gray-700 truncate h">
              <p>
                <b>Email:</b> {user.email}
              </p>
              <p>
                <b>Org Unit:</b> {user.orgUnitId}
              </p>
              <p>
                <b>Features:</b> {user.featureIds.join(', ')}
              </p>
            </div>
          </ListItemButton>
        </List>
      </Collapse>
    </div>
  );
}
