import { Modal as MantineModal } from '@mantine/core';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer, width = 520 }) => (
  <MantineModal
    opened
    onClose={onClose}
    title={title}
    size={width}
    overlayProps={{ opacity: 0.55, blur: 3 }}
  >
    <div>{children}</div>
    {footer && <div style={{ marginTop: '1rem' }}>{footer}</div>}
  </MantineModal>
);


