import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

export default function MetaView({
  title,
  children,
  onCloseMetaView,
  className,
}: {
  title: string;
  children: React.ReactNode;
  onCloseMetaView: () => void;
  className?: string;
}) {
  return (
    <div
      className={`container rounded-xl bg-blue-100 shadow-lg p-4 overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center">
        <h1 className="custom-heading-2">{title}</h1>
        <IconButton onClick={onCloseMetaView}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className="h-[92%] flex flex-col">{children}</div>
    </div>
  );
}
